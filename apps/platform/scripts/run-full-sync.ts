import fs from "fs";
import path from "path";

// Load environment variables before anything else
function loadEnv() {
  const envFiles = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env"),
    path.resolve(__dirname, "..", ".env.local"),
    path.resolve(__dirname, "..", "..", "marketing", ".env.local"),
    path.resolve(__dirname, "..", "..", "..", ".env.local"),
  ];

  for (const envPath of envFiles) {
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, "utf8");
      for (const line of envConfig.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const idx = trimmed.indexOf("=");
          const key = trimmed.substring(0, idx).trim();
          let val = trimmed.substring(idx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

import { prisma } from "../lib/db";
import {
  getLocalContacts,
  saveLocalContact,
  deleteLocalContact,
  LocalContact,
  ContactStatus,
} from "../lib/local-marketing/store";
import { syncAwsSuppressionListToLocalContacts } from "../lib/local-marketing/awsSesAnalytics";

async function run() {
  console.log("🚀 Ejecutando sincronización y limpieza completa de la lista de contactos...");

  // 1. Fetch DB Unsubscribes
  const unsubscribedRecords = await prisma.unsubscribedEmail.findMany({
    select: { email: true, reason: true },
  });
  const unsubscribedSet = new Set<string>(
    unsubscribedRecords.map((r) => r.email.toLowerCase().trim())
  );
  console.log(`📋 Desuscripciones explícitas en base de datos: ${unsubscribedSet.size}`);

  // 2. Fetch DB Bounces and Complaints from sentEmailLog
  const bouncedLogs = await prisma.sentEmailLog.findMany({
    where: {
      status: { in: ["BOUNCED", "COMPLAINT"] },
    },
    select: { recipient: true, status: true },
  });
  const bouncedSet = new Set<string>(
    bouncedLogs.map((l) => l.recipient.toLowerCase().trim())
  );
  console.log(`⚠️ Rebotes / Quejas registrados en sent_email_logs: ${bouncedSet.size}`);

  // 3. Map existing local contacts
  const existingContacts = getLocalContacts();
  const contactMap = new Map<string, LocalContact>();
  existingContacts.forEach((c) => contactMap.set(c.email.toLowerCase().trim(), c));

  // Clean dummy test contacts
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
    console.warn("Deleted users check warning:", e);
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

  // 4. Sync Registered Platform Users
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
          profession: true,
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

    const isBounced = bouncedSet.has(emailClean);
    const isUnsub = unsubscribedSet.has(emailClean);

    const status: ContactStatus = isBounced
      ? "BOUNCED"
      : isUnsub
      ? "UNSUBSCRIBED"
      : existing?.status || "ACTIVE";

    const cleanExistingTags = (existing?.tags || []).filter(
      (t) =>
        t !== "desuscrito" &&
        t !== "bounced" &&
        t !== "rebote-ses" &&
        t !== "Plataforma LUMINUS" &&
        t !== "Usuario Registrado"
    );

    const tags = Array.from(new Set([...cleanExistingTags, "Usuario Plataforma"]));

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
      profession: u.profile?.profession || existing?.profession || undefined,
      source: existing?.source || "Plataforma LUMINUS",
      tags,
      status,
      unsubscribed: status === "UNSUBSCRIBED",
      bounced: status === "BOUNCED",
      notes: existing?.notes || "Sincronizado automáticamente desde la base de datos de usuarios.",
      createdAt: userCreatedAt,
    });

    contactMap.set(emailClean, updated);
  }

  // 5. Sync Event Guests (all registrations)
  const guests = await prisma.eventGuest.findMany({
    include: {
      inscriptions: {
        include: {
          event: {
            select: {
              title: true,
              date: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`🎫 Invitados e inscriptos a eventos encontrados en DB: ${guests.length}`);
  for (const g of guests) {
    if (!g.email || !g.email.includes("@")) continue;
    const emailClean = g.email.toLowerCase().trim();
    const existing = contactMap.get(emailClean);

    const isBounced = bouncedSet.has(emailClean);
    const isUnsub = g.marketingConsent === false || unsubscribedSet.has(emailClean);

    const status: ContactStatus = isBounced
      ? "BOUNCED"
      : isUnsub
      ? "UNSUBSCRIBED"
      : existing?.status || "ACTIVE";

    const eventTitles = (g.inscriptions || []).map((ins) => ins.event?.title).filter(Boolean);
    let notes = existing?.notes || "";
    if (eventTitles.length > 0) {
      for (const title of eventTitles) {
        if (!notes.includes(title!)) {
          notes = notes
            ? `${notes}\n[Inscripto a Evento]: "${title}"`
            : `[Inscripto a Evento]: "${title}"`;
        }
      }
    }

    const cleanExistingTags = (existing?.tags || []).filter(
      (t) =>
        t !== "desuscrito" &&
        t !== "bounced" &&
        t !== "rebote-ses" &&
        t !== "Inscripto a Eventos" &&
        t !== "Inscripto a Eventos Pasados" &&
        !t.startsWith("Evento:")
    );

    const tags = Array.from(new Set([...cleanExistingTags, "Inscripto a Evento"]));

    const guestCreatedAt = g.createdAt
      ? new Date(g.createdAt).toISOString()
      : existing?.createdAt || new Date().toISOString();

    const updated = saveLocalContact({
      id: existing?.id,
      email: emailClean,
      firstName: g.firstName || existing?.firstName || "",
      lastName: g.lastName || existing?.lastName || "",
      country: g.country || existing?.country || undefined,
      city: g.city || existing?.city || undefined,
      source: existing?.source || "Eventos LUMINUS",
      tags,
      status,
      unsubscribed: status === "UNSUBSCRIBED",
      bounced: status === "BOUNCED",
      notes: notes || "Sincronizado automáticamente desde inscripciones a eventos.",
      createdAt: guestCreatedAt,
    });

    contactMap.set(emailClean, updated);
  }

  // 6. Enforce DB Unsubscribes and Bounces on local contacts
  unsubscribedSet.forEach((emailClean) => {
    const existing = contactMap.get(emailClean);
    if (existing) {
      const cleanTags = (existing.tags || []).filter((t) => t !== "desuscrito" && t !== "bounced");
      const updated = saveLocalContact({
        ...existing,
        status: "UNSUBSCRIBED",
        unsubscribed: true,
        bounced: false,
        tags: cleanTags,
      });
      contactMap.set(emailClean, updated);
    }
  });

  bouncedSet.forEach((emailClean) => {
    const existing = contactMap.get(emailClean);
    if (existing) {
      const cleanTags = (existing.tags || []).filter((t) => t !== "desuscrito" && t !== "bounced" && t !== "rebote-ses");
      const updated = saveLocalContact({
        ...existing,
        status: "BOUNCED",
        bounced: true,
        unsubscribed: false,
        tags: cleanTags,
      });
      contactMap.set(emailClean, updated);
    }
  });

  // 7. Sync AWS SES Suppression List (Live AWS API)
  console.log("\n☁️ Conectando con AWS SES para sincronizar rebotes y quejas (Suppression List)...");
  try {
    const awsResult = await syncAwsSuppressionListToLocalContacts();
    console.log("☁️ Resultado AWS SES Suppression:", JSON.stringify(awsResult, null, 2));
  } catch (sesErr: any) {
    console.warn("⚠️ AWS SES Suppression Sync Warning:", sesErr.message || sesErr);
  }

  // 8. Final Report
  const finalContacts = getLocalContacts();
  const activeCount = finalContacts.filter((c) => (!c.status || c.status === "ACTIVE") && !c.unsubscribed && !c.bounced).length;
  const unsubCount = finalContacts.filter((c) => (c.status === "UNSUBSCRIBED" || c.unsubscribed) && c.status !== "BOUNCED" && !c.bounced).length;
  const bouncedCount = finalContacts.filter((c) => c.status === "BOUNCED" || c.bounced).length;

  console.log("\n==========================================");
  console.log("📊 RESUMEN FINAL DE CONTACTOS:");
  console.log("==========================================");
  console.log(`✅ Total Contactos en Base Local: ${finalContacts.length}`);
  console.log(`🟢 Activos (aptos para envío): ${activeCount}`);
  console.log(`🟡 Desuscritos (excluidos): ${unsubCount}`);
  console.log(`🔴 Rebotados / Complaints (excluidos): ${bouncedCount}`);
  console.log("==========================================\n");

  console.log("🌟 Últimos 10 contactos agregados/actualizados:");
  console.log(
    finalContacts.slice(0, 10).map((c) => ({
      email: c.email,
      nombre: `${c.firstName} ${c.lastName}`.trim(),
      status: c.status || (c.bounced ? "BOUNCED" : c.unsubscribed ? "UNSUBSCRIBED" : "ACTIVE"),
      source: c.source,
      tags: c.tags,
      createdAt: c.createdAt,
    }))
  );

  await prisma.$disconnect();
}

run().catch(console.error);
