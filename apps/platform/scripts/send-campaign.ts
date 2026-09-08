/**
 * CLI CAMPAIGN SENDER SCRIPT
 * 
 * Permite ejecutar el envío masivo de campañas por terminal en segundo plano
 * sin depender del navegador abierto. Registra el progreso y los resultados
 * en local storage (campaigns.json / logs.json) y en Prisma DB para que la
 * herramienta administrativa (/admin/email-marketing) los muestre en tiempo real.
 * 
 * Uso:
 *   npx tsx scripts/send-campaign.ts [--dry-run] [--campaign-id=CMP_ID] [--yes]
 */

import fs from "fs";
import path from "path";
import { getLocalCampaignById, getLocalContacts, getLocalAudienceById } from "../lib/local-marketing/store";
import { executeCampaignBatchSend } from "../lib/local-marketing/sender";

// 1. Cargar variables de entorno de apps/platform/.env.local
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
  const isDryRun = args.includes("--dry-run");
  const autoConfirm = args.includes("--yes") || args.includes("-y");

  let campaignId = "cmp_viviana_1788832131088"; // Por defecto la campaña activa
  const argCampaign = args.find((a) => a.startsWith("--campaign-id="));
  if (argCampaign) {
    campaignId = argCampaign.split("=")[1].trim();
  }

  console.log("\n=======================================================");
  console.log("   🚀 LUMINUS EMAIL MARKETING - CLI SENDER TOOL");
  console.log("=======================================================\n");

  const campaign = getLocalCampaignById(campaignId);
  if (!campaign) {
    console.error(`❌ ERROR: No se encontró la campaña con ID '${campaignId}'.`);
    process.exit(1);
  }

  console.log(`📋 ID de Campaña:   ${campaign.id}`);
  console.log(`📧 Asunto:          ${campaign.subject}`);
  console.log(`👤 Remitente:       "${campaign.fromName}" <${campaign.fromEmail}>`);
  console.log(`🏷️  Estado actual:   ${campaign.status}`);

  // Calcular destinatarios elegibles (activos únicamente)
  const allContacts = getLocalContacts();
  let recipients = allContacts.filter(
    (c) => (c.status ? c.status === "ACTIVE" : !c.unsubscribed && !c.bounced) && c.email.includes("@")
  );

  if (campaign.audienceId && campaign.audienceId !== "aud_all") {
    const audience = getLocalAudienceById(campaign.audienceId);
    if (audience) {
      if (audience.countryFilter) {
        recipients = recipients.filter((c) => c.country?.toLowerCase() === audience.countryFilter?.toLowerCase());
      }
      if (audience.sourceFilter) {
        recipients = recipients.filter((c) => c.source?.toLowerCase() === audience.sourceFilter?.toLowerCase());
      }
      if (audience.tagFilter) {
        recipients = recipients.filter((c) => c.tags.includes(audience.tagFilter!));
      }
      if (audience.professionFilter) {
        recipients = recipients.filter((c) => c.profession?.toLowerCase() === audience.professionFilter?.toLowerCase());
      }
    }
  } else if (campaign.targetTags && campaign.targetTags.length > 0) {
    recipients = recipients.filter((c) =>
      c.tags.some((tag) => campaign.targetTags.includes(tag))
    );
  }

  // Filtrar con la lista de supresión de la base de datos de producción
  let eligibleCount = recipients.length;
  try {
    const { filterUnsubscribedEmails } = await import("./local-unsubscribe-helper");
    const eligibleEmails = new Set(await filterUnsubscribedEmails(recipients.map((r) => r.email)));
    recipients = recipients.filter((r) => eligibleEmails.has(r.email.toLowerCase().trim()));
    eligibleCount = recipients.length;
  } catch (err: any) {
    console.warn("⚠️ Advertencia al consultar lista de desuscritos en DB:", err?.message || err);
  }

  console.log(`👥 Destinatarios:   ${eligibleCount} contactos activos elegibles`);

  if (isDryRun) {
    console.log("\n🧪 Modo [--dry-run] activo. NO se realizaron envíos reales.");
    console.log("   Todo está listo para cuando decidas realizar el envío.");
    console.log("\n=======================================================\n");
    process.exit(0);
  }

  if (eligibleCount === 0) {
    console.log("\n⚠️ No hay destinatarios elegibles para enviar.");
    process.exit(0);
  }

  if (!autoConfirm) {
    console.log("\n-------------------------------------------------------");
    console.log(`⚠️ ATENCIÓN: Se enviarán ${eligibleCount} correos reales vía AWS SES.`);
    console.log("   Para confirmar el envío, vuelve a ejecutar el comando con el flag --yes:");
    console.log(`   npx tsx scripts/send-campaign.ts --yes`);
    console.log("-------------------------------------------------------\n");
    process.exit(0);
  }

  console.log("\n▶️ Iniciando lote de envío masivo vía AWS SES...\n");

  const startTime = Date.now();
  const result = await executeCampaignBatchSend(campaignId, {
    delayMs: 100,
    onProgress: (info) => {
      const barLength = 25;
      const filledLength = Math.round((info.percentage / 100) * barLength);
      const bar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength);
      process.stdout.write(
        `\r[${bar}] ${info.percentage.toFixed(1)}% (${info.sent + info.failed}/${info.total}) | OK: ${info.sent} | Fallidos: ${info.failed}  `
      );
    },
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("\n\n=======================================================");
  console.log("   ✅ ENVÍO MASIVO FINALIZADO CON ÉXITO");
  console.log("=======================================================");
  console.log(`⏱️  Tiempo total:    ${durationSec} segundos`);
  console.log(`✉️  Enviados OK:     ${result.sent}`);
  console.log(`❌ Fallidos:        ${result.failed}`);
  console.log(`📊 Total procesado: ${result.total}`);
  console.log(`🌐 Los resultados ya están disponibles en la Tool Web (/admin/email-marketing).`);
  console.log("=======================================================\n");
}

main().catch((err) => {
  console.error("❌ Error no controlado al ejecutar el script de envío:", err);
  process.exit(1);
});
