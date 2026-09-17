import fs from "fs";
import path from "path";

// Load env
const envFiles = [".env.local", ".env"];
for (const file of envFiles) {
  const envPath = path.join(__dirname, "..", file);
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    for (const line of envConfig.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const idx = trimmed.indexOf("=");
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

import { prisma } from "../lib/db";
import {
  getLocalContacts,
  saveLocalContact,
  deleteLocalContact,
  LocalContact,
} from "../lib/local-marketing/store";
import { syncAwsSuppressionListToLocalContacts } from "../lib/local-marketing/awsSesAnalytics";

async function run() {
  console.log("🚀 Ejecutando sincronización y limpieza completa...");

  const existingContacts = getLocalContacts();
  const contactMap = new Map<string, LocalContact>();
  existingContacts.forEach((c) => contactMap.set(c.email.toLowerCase().trim(), c));

  const dummyTestEmails = [
    "testari@test.com",
    "test6@test.com",
    "test@test.com",
    "test.local.marketing@example.com",
  ];

  let deletedUserEmails = new Set<string>();
  try {
    const deletedUsers = await prisma.user.findMany({
      where: { status: "deleted" },
      select: { email: true },
    });
    deletedUsers.forEach((u) => {
      if (u.email) deletedUserEmails.add(u.email.toLowerCase().trim());
    });
  } catch (e) {
    console.warn("Deleted users check error:", e);
  }

  let deletedCount = 0;
  for (const [email, contact] of Array.from(contactMap.entries())) {
    if (
      deletedUserEmails.has(email) ||
      dummyTestEmails.includes(email) ||
      (email.startsWith("test") && email.endsWith("@test.com"))
    ) {
      deleteLocalContact(contact.id);
      contactMap.delete(email);
      deletedCount++;
      console.log(`🗑️ Eliminado contacto no deseado: ${email}`);
    }
  }

  // Sync users
  const users = await prisma.user.findMany({
    where: { status: { not: "deleted" } },
    select: {
      id: true,
      email: true,
      createdAt: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          country: true,
          city: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`👥 Usuarios de plataforma activos encontrados en DB: ${users.length}`);
  for (const u of users) {
    if (!u.email || !u.email.includes("@")) continue;
    const emailClean = u.email.toLowerCase().trim();
    const existing = contactMap.get(emailClean);

    const tags = Array.from(
      new Set([
        ...(existing?.tags || []),
        "Plataforma LUMINUS",
        "Usuario Registrado",
      ])
    );

    const userCreatedAt = u.createdAt
      ? new Date(u.createdAt).toISOString()
      : existing?.createdAt || new Date().toISOString();

    const updated = saveLocalContact({
      id: existing?.id,
      email: emailClean,
      firstName: u.profile?.firstName || existing?.firstName || "",
      lastName: u.profile?.lastName || existing?.lastName || "",
      country: u.profile?.country || existing?.country || undefined,
      city: u.profile?.city || existing?.city || undefined,
      source: existing?.source || "Plataforma LUMINUS",
      tags,
      notes: existing?.notes || "Sincronizado automáticamente desde la base de datos de usuarios.",
      createdAt: userCreatedAt,
    });

    contactMap.set(emailClean, updated);
  }

  // AWS Suppression Sync
  const awsResult = await syncAwsSuppressionListToLocalContacts();
  console.log("☁️ AWS SES Supresiones:", awsResult);

  const finalContacts = getLocalContacts();
  console.log("✅ Total contactos final:", finalContacts.length);
  console.log("🌟 Primeros 5 contactos (ordenados por fecha más reciente):");
  console.log(
    finalContacts
      .slice(0, 5)
      .map((c) => ({ email: c.email, name: `${c.firstName} ${c.lastName}`, createdAt: c.createdAt, source: c.source }))
  );
}

run().catch(console.error);
