import fs from "fs";
import path from "path";
import { getLocalContacts, saveLocalContact, LocalContact, ContactStatus } from "../lib/local-marketing/store";

async function main() {
  console.log("\n=======================================================");
  console.log("   🧹 AUDITORÍA Y LIMPIEZA DE ETIQUETAS Y ESTADOS");
  console.log("=======================================================\n");

  const contacts = getLocalContacts();
  console.log(`📋 Total de contactos en base local: ${contacts.length}`);

  let countActive = 0;
  let countUnsubscribed = 0;
  let countBounced = 0;

  let tagsCleanedCount = 0;
  let eventNotesAddedCount = 0;

  const tagDistributionBefore: Record<string, number> = {};
  const tagDistributionAfter: Record<string, number> = {};

  contacts.forEach((c) => {
    (c.tags || []).forEach((t) => {
      tagDistributionBefore[t] = (tagDistributionBefore[t] || 0) + 1;
    });
  });

  for (const c of contacts) {
    const rawTags = c.tags || [];
    const notesLower = (c.notes || "").toLowerCase();

    // 1. Determinar si es Bounced vs Unsubscribed
    const hasBouncedTag = rawTags.includes("bounced");
    const hasBounceNote = notesLower.includes("rebote") || notesLower.includes("bounced") || notesLower.includes("mailbox full") || notesLower.includes("aws ses");
    const isBounced = hasBouncedTag || hasBounceNote || Boolean(c.bounced);

    const hasUnsubTag = rawTags.includes("desuscrito") || rawTags.includes("complaint");
    const isUnsub = (hasUnsubTag || Boolean(c.unsubscribed)) && !isBounced;

    let status: ContactStatus = "ACTIVE";
    let finalBounced = false;
    let finalUnsub = false;

    if (isBounced) {
      status = "BOUNCED";
      finalBounced = true;
      finalUnsub = false;
      countBounced++;
    } else if (isUnsub) {
      status = "UNSUBSCRIBED";
      finalUnsub = true;
      finalBounced = false;
      countUnsubscribed++;
    } else {
      status = "ACTIVE";
      finalBounced = false;
      finalUnsub = false;
      countActive++;
    }

    // 2. Procesar etiquetas y extraer títulos de eventos hacia notas
    const cleanedTags: string[] = [];
    const extractedEvents: string[] = [];
    let hasEventInscription = false;

    for (const tag of rawTags) {
      // Filtrar etiquetas de estado técnico
      if (
        tag === "bounced" ||
        tag === "desuscrito" ||
        tag === "complaint" ||
        tag === "AWS SES Export" ||
        tag === "AWS SES Bounce Export"
      ) {
        tagsCleanedCount++;
        continue;
      }

      // Procesar etiquetas de eventos
      if (
        tag === "Inscripto a Eventos" ||
        tag === "Inscripto a Eventos Pasados" ||
        tag === "Inscripto a Evento"
      ) {
        hasEventInscription = true;
        continue;
      }

      if (tag.startsWith("Evento:")) {
        hasEventInscription = true;
        const eventTitle = tag.replace(/^Evento:\s*/, "").trim();
        if (eventTitle) {
          extractedEvents.push(eventTitle);
        }
        tagsCleanedCount++;
        continue;
      }

      cleanedTags.push(tag);
    }

    if (hasEventInscription || extractedEvents.length > 0) {
      cleanedTags.push("Inscripto a Evento");
    }

    // 3. Actualizar notas si se extrajeron nombres de eventos
    let finalNotes = c.notes || "";
    if (extractedEvents.length > 0) {
      for (const evTitle of extractedEvents) {
        if (!finalNotes.includes(evTitle)) {
          finalNotes = finalNotes
            ? `${finalNotes}\n[Inscripto a Evento]: "${evTitle}"`
            : `[Inscripto a Evento]: "${evTitle}"`;
          eventNotesAddedCount++;
        }
      }
    }

    c.tags = Array.from(new Set(cleanedTags));
    c.status = status;
    c.unsubscribed = finalUnsub;
    c.bounced = finalBounced;
    c.notes = finalNotes;
  }

  // Guardar todos los contactos de una sola vez
  const contactsPath = path.resolve(process.cwd(), "..", "..", ".local-data", "email-marketing", "contacts.json");
  let targetPath = contactsPath;
  if (!fs.existsSync(contactsPath)) {
    targetPath = path.resolve(__dirname, "..", ".local-data", "email-marketing", "contacts.json");
  }
  fs.writeFileSync(targetPath, JSON.stringify(contacts, null, 2), "utf8");

  // Recalcular distribución post-migración
  const contactsAfter = contacts;
  contactsAfter.forEach((c) => {
    (c.tags || []).forEach((t) => {
      tagDistributionAfter[t] = (tagDistributionAfter[t] || 0) + 1;
    });
  });

  console.log("=======================================================");
  console.log("   ✅ MIGRADOS Y CLASIFICADOS CON ÉXITO");
  console.log("=======================================================");
  console.log(`🟢 Contactos ACTIVOS:        ${countActive}`);
  console.log(`🟡 Contactos DESUSCRITOS:    ${countUnsubscribed}`);
  console.log(`🔴 Contactos REBOTADOS:      ${countBounced}`);
  console.log(`🧹 Etiquetas técnicas/evento borradas: ${tagsCleanedCount}`);
  console.log(`📝 Notas de evento migradas: ${eventNotesAddedCount}`);

  console.log("\n🏷️  Distribución de Etiquetas ANTES:");
  Object.entries(tagDistributionBefore).forEach(([t, count]) => {
    console.log(`   - "${t}": ${count}`);
  });

  console.log("\n🏷️  Distribución de Etiquetas AHORA:");
  Object.entries(tagDistributionAfter).forEach(([t, count]) => {
    console.log(`   - "${t}": ${count}`);
  });
  console.log("=======================================================\n");
}

main().catch((err) => {
  console.error("❌ Error durante la auditoría y limpieza:", err);
  process.exit(1);
});
