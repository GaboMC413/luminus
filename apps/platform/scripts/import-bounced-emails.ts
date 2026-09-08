/**
 * IMPORT BOUNCED EMAILS HELPER
 * 
 * Permite desuscribir de golpe cualquier lista de correos que hayan rebotado en tu bandeja (Mailer-Daemon).
 * Puedes pasarle un archivo de texto/CSV o pegar el texto directamente.
 * 
 * Uso:
 *   npx tsx scripts/import-bounced-emails.ts --file=camino/al/archivo.txt
 *   o
 *   npx tsx scripts/import-bounced-emails.ts "email1@ejemplo.com, email2@ejemplo.com"
 */

import fs from "fs";
import path from "path";
import { getLocalContacts, saveLocalContact } from "../lib/local-marketing/store";

// Load env
const envPath = path.join(__dirname, "..", ".env.local");
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

async function main() {
  const args = process.argv.slice(2);
  let textToParse = "";

  const fileArg = args.find((a) => a.startsWith("--file="));
  if (fileArg) {
    const filePath = fileArg.split("=")[1].trim();
    if (fs.existsSync(filePath)) {
      textToParse = fs.readFileSync(filePath, "utf8");
    } else {
      console.error(`❌ El archivo '${filePath}' no existe.`);
      process.exit(1);
    }
  } else if (args.length > 0) {
    textToParse = args.join(" ");
  }

  // Si existe un archivo predeterminado `bounces.txt` en apps/platform/
  const defaultBouncesFile = path.join(__dirname, "..", "bounces.txt");
  if (!textToParse && fs.existsSync(defaultBouncesFile)) {
    console.log("📄 Leyendo lista desde 'apps/platform/bounces.txt'...");
    textToParse = fs.readFileSync(defaultBouncesFile, "utf8");
  }

  if (!textToParse) {
    console.log("\n=======================================================");
    console.log(" 🛑 HERRAMIENTA DE IMPORTACIÓN DE REBOTES (MAILER-DAEMON)");
    console.log("=======================================================\n");
    console.log("Modo de uso facilísimo:");
    console.log(" 1) Crea o pega el texto con los correos rebotados en el archivo:");
    console.log("    'apps/platform/bounces.txt'");
    console.log(" 2) Ejecuta:");
    console.log("    npx tsx scripts/import-bounced-emails.ts\n");
    console.log("O pásale los correos como parámetro:");
    console.log(" npx tsx scripts/import-bounced-emails.ts \"user1@domain.com, user2@domain.com\"\n");
    process.exit(0);
  }

  // Extraer todos los correos electrónicos mediante Expresión Regular
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const foundEmails = Array.from(new Set((textToParse.match(emailRegex) || []).map((e) => e.toLowerCase().trim())));

  // Filtrar emails de sistema propio
  const systemEmails = new Set(["info@luminuslatam.com", "gabrielmedcap@hotmail.com", "mailer-daemon@amazonses.com", "postmaster@amazonses.com"]);
  const validBouncedEmails = foundEmails.filter((e) => !systemEmails.has(e));

  if (validBouncedEmails.length === 0) {
    console.log("⚠️ No se encontraron direcciones de correo válidas para desuscribir.");
    process.exit(0);
  }

  console.log(`\n🔍 Se encontraron ${validBouncedEmails.length} correos rebotados para procesar...`);

  const contacts = getLocalContacts();
  const contactMap = new Map(contacts.map((c) => [c.email.toLowerCase().trim(), c]));

  let updatedCount = 0;
  let newSuppressedCount = 0;

  for (const email of validBouncedEmails) {
    const existing = contactMap.get(email);
    const dateStr = new Date().toLocaleDateString("es-AR");
    const noteText = `[Mailer-Daemon Sync] Desuscrito por rebote de entrega el ${dateStr}.`;

    if (existing) {
      const newTags = Array.from(new Set([...(existing.tags || []), "desuscrito", "bounced"]));
      saveLocalContact({
        ...existing,
        unsubscribed: true,
        tags: newTags,
        notes: existing.notes ? `${existing.notes}\n${noteText}` : noteText,
      });
      updatedCount++;
    } else {
      saveLocalContact({
        email,
        firstName: "Contacto",
        lastName: "Rebotado",
        tags: ["desuscrito", "bounced", "Mailer-Daemon"],
        unsubscribed: true,
        source: "Mailer-Daemon Bounce",
        notes: noteText,
      });
      newSuppressedCount++;
    }
  }

  // Sincronizar también en la tabla UnsubscribedEmail de PostgreSQL si está disponible
  try {
    const { prisma } = await import("../lib/db");
    for (const email of validBouncedEmails) {
      try {
        await prisma.unsubscribedEmail.upsert({
          where: { email },
          create: { email, reason: "BOUNCE_MAILER_DAEMON" },
          update: { reason: "BOUNCE_MAILER_DAEMON" },
        });
      } catch (dbErr) {
        // Ignorar si la DB no está conectada localmente
      }
    }
  } catch (err) {
    // Ignorar si prisma no se carga
  }

  console.log("\n=======================================================");
  console.log("   ✅ DESSUSCRIPCIÓN DE REBOTADOS FINALIZADA");
  console.log("=======================================================");
  console.log(`✉️  Contactos desuscritos actualizados en la base: ${updatedCount}`);
  console.log(`➕ Nuevas direcciones suprimidas agregadas:     ${newSuppressedCount}`);
  console.log(`🛡️  Total correos bloqueados para futuros envíos: ${validBouncedEmails.length}`);
  console.log("=======================================================\n");
}

main().catch((err) => {
  console.error("❌ Error al procesar rebotes:", err);
  process.exit(1);
});
