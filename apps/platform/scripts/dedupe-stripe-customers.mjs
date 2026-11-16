import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple env loader from apps/platform/.env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error("Error: STRIPE_SECRET_KEY is not defined in .env.local");
  process.exit(1);
}

const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
const prisma = new PrismaClient();

const isExecute = process.argv.includes("--execute");

async function main() {
  console.log(`\n==================================================`);
  console.log(`Stripe Customer Deduplication Script`);
  console.log(`Mode: ${isExecute ? "EXECUTE (Permanent Deletion)" : "DRY RUN (Read Only)"}`);
  console.log(`==================================================\n`);

  // 1. Fetch DB users
  const dbUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      tier: true,
    },
  });

  const dbUserByEmail = new Map();
  for (const user of dbUsers) {
    if (user.email) {
      dbUserByEmail.set(user.email.trim().toLowerCase(), user);
    }
  }

  // 2. Fetch all Stripe customers
  console.log("Fetching customers from Stripe...");
  const customers = [];
  for await (const customer of stripe.customers.list({ limit: 100 })) {
    if (!customer.deleted) {
      customers.push(customer);
    }
  }
  console.log(`Found ${customers.length} total active customers in Stripe.\n`);

  // 3. Group by email
  const customersByEmail = new Map();
  for (const c of customers) {
    const email = (c.email || "").trim().toLowerCase();
    if (!email) continue;
    if (!customersByEmail.has(email)) {
      customersByEmail.set(email, []);
    }
    customersByEmail.get(email).push(c);
  }

  const duplicates = [];
  for (const [email, list] of customersByEmail.entries()) {
    if (list.length > 1) {
      duplicates.push({ email, list });
    }
  }

  if (duplicates.length === 0) {
    console.log("No duplicate customers found in Stripe!");
    return;
  }

  console.log(`Found ${duplicates.length} email(s) with duplicate customers:\n`);

  const toDelete = [];
  const toKeep = [];

  for (const { email, list } of duplicates) {
    const dbUser = dbUserByEmail.get(email);
    console.log(`--------------------------------------------------`);
    console.log(`Email: ${email}`);
    console.log(`DB User ID: ${dbUser ? dbUser.id : "NONE"}`);
    console.log(`DB Stored Stripe Customer ID: ${dbUser?.stripeCustomerId || "NONE"}`);

    // Inspect each duplicate customer
    const analyzed = [];
    for (const c of list) {
      const subs = await stripe.subscriptions.list({ customer: c.id, limit: 10 });
      const pms = await stripe.paymentMethods.list({ customer: c.id, limit: 10 });
      const activeSubs = subs.data.filter((s) => s.status === "active" || s.status === "trialing");
      const incompleteSubs = subs.data.filter((s) => s.status === "incomplete");
      const isDbLinked = dbUser?.stripeCustomerId === c.id;

      analyzed.push({
        customer: c,
        subscriptionsCount: subs.data.length,
        activeSubscriptionsCount: activeSubs.length,
        incompleteSubscriptionsCount: incompleteSubs.length,
        paymentMethodsCount: pms.data.length,
        isDbLinked,
        created: new Date(c.created * 1000).toISOString(),
      });
    }

    // Sort to determine keeper:
    // 1. isDbLinked (highest priority)
    // 2. active subscriptions
    // 3. payment methods count
    // 4. subscriptions count
    // 5. most recently created
    analyzed.sort((a, b) => {
      if (a.isDbLinked !== b.isDbLinked) return a.isDbLinked ? -1 : 1;
      if (a.activeSubscriptionsCount !== b.activeSubscriptionsCount) return b.activeSubscriptionsCount - a.activeSubscriptionsCount;
      if (a.paymentMethodsCount !== b.paymentMethodsCount) return b.paymentMethodsCount - a.paymentMethodsCount;
      if (a.subscriptionsCount !== b.subscriptionsCount) return b.subscriptionsCount - a.subscriptionsCount;
      return b.customer.created - a.customer.created;
    });

    const keeper = analyzed[0];
    const orphans = analyzed.slice(1);

    toKeep.push({ email, ...keeper });

    console.log(`\n  ✅ KEEP: ${keeper.customer.id}`);
    console.log(`     Created: ${keeper.created}`);
    console.log(`     DB Linked: ${keeper.isDbLinked}`);
    console.log(`     Subscriptions: ${keeper.subscriptionsCount} (${keeper.activeSubscriptionsCount} active)`);
    console.log(`     Payment Methods: ${keeper.paymentMethodsCount}`);

    for (const orphan of orphans) {
      toDelete.push({ email, customerId: orphan.customer.id });
      console.log(`\n  ❌ DELETE (Orphan Duplicate): ${orphan.customer.id}`);
      console.log(`     Created: ${orphan.created}`);
      console.log(`     DB Linked: ${orphan.isDbLinked}`);
      console.log(`     Subscriptions: ${orphan.subscriptionsCount} (${orphan.activeSubscriptionsCount} active)`);
      console.log(`     Payment Methods: ${orphan.paymentMethodsCount}`);
    }
    console.log();
  }

  console.log(`==================================================`);
  console.log(`Summary:`);
  console.log(`Total Keep: ${toKeep.length}`);
  console.log(`Total to Delete: ${toDelete.length}`);
  console.log(`==================================================\n`);

  if (isExecute) {
    console.log(`Starting deletion of ${toDelete.length} orphan customer(s)...`);
    for (const item of toDelete) {
      try {
        const res = await stripe.customers.del(item.customerId);
        console.log(`Deleted ${item.customerId} (${item.email}): deleted=${res.deleted}`);
      } catch (err) {
        console.error(`Failed to delete ${item.customerId} (${item.email}):`, err.message);
      }
    }
    console.log("\nDeletion process completed!");
  } else {
    console.log(`DRY RUN complete. No customers were deleted.`);
    console.log(`To execute deletion, run with --execute`);
  }
}

main()
  .catch((err) => {
    console.error("Execution error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
