const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const execute = process.argv.includes("--execute");
const help = process.argv.includes("--help") || process.argv.includes("-h");

const TABLES = [
  ["messages", () => prisma.message],
  ["conversation_participants", () => prisma.conversationParticipant],
  ["conversations", () => prisma.conversation],
  ["user_connections", () => prisma.userConnection],
  ["notifications", () => prisma.notification],
  ["password_reset_tokens", () => prisma.passwordResetToken],
  ["email_change_tokens", () => prisma.emailChangeToken],
  ["user_profile_prompts", () => prisma.userProfilePrompt],
  ["user_interests", () => prisma.userInterest],
  ["user_profiles", () => prisma.userProfile],
  ["user_identities", () => prisma.userIdentity],
  ["users", () => prisma.user],
];

function printHelp() {
  console.log(`
Usage:
  npm run db:cleanup:dev-users -w platform
  CONFIRM_DEV_USER_CLEANUP=DELETE_DEV_USERS npm run db:cleanup:dev-users -w platform -- --execute

Default mode is a dry run. Execute mode deletes dev user data and keeps seed data such as interests.
`);
}

function assertSafeDatabase() {
  const databaseUrl = process.env.DATABASE_URL || "";
  const explicitConfirmation = process.env.CONFIRM_DEV_USER_CLEANUP === "DELETE_DEV_USERS";
  const looksLikeDev = /luminus-dev|dev/i.test(databaseUrl);

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!looksLikeDev && !explicitConfirmation) {
    throw new Error(
      "DATABASE_URL does not look like a dev database. Set CONFIRM_DEV_USER_CLEANUP=DELETE_DEV_USERS to continue.",
    );
  }

  if (execute && !explicitConfirmation) {
    throw new Error("Execute mode requires CONFIRM_DEV_USER_CLEANUP=DELETE_DEV_USERS.");
  }
}

async function getCounts() {
  const entries = await Promise.all(
    TABLES.map(async ([name, model]) => [name, await model().count()]),
  );

  return Object.fromEntries(entries);
}

async function getIdentityCounts() {
  return prisma.userIdentity.groupBy({
    by: ["provider"],
    _count: { provider: true },
    orderBy: { provider: "asc" },
  });
}

async function printSnapshot(label) {
  const counts = await getCounts();
  const identityCounts = await getIdentityCounts();

  console.log(`\n${label}`);
  for (const [name, count] of Object.entries(counts)) {
    console.log(`- ${name}: ${count}`);
  }

  console.log("- user_identities by provider:");
  if (!identityCounts.length) {
    console.log("  - none");
  } else {
    for (const item of identityCounts) {
      console.log(`  - ${item.provider}: ${item._count.provider}`);
    }
  }
}

async function cleanup() {
  await prisma.$transaction(
    TABLES.map(([, model]) => model().deleteMany({})),
  );
}

async function main() {
  if (help) {
    printHelp();
    return;
  }

  assertSafeDatabase();
  await printSnapshot("Current dev user data");

  if (!execute) {
    console.log("\nDry run only. Nothing was deleted.");
    console.log("To delete, run with -- --execute and CONFIRM_DEV_USER_CLEANUP=DELETE_DEV_USERS.");
    return;
  }

  await cleanup();
  await printSnapshot("After cleanup");
  console.log("\nDev user cleanup completed.");
}

main()
  .catch((error) => {
    console.error(`\nCleanup failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
