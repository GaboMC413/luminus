import fs from "fs";
import path from "path";

// Cargar variables de entorno locales
const envFiles = [".env.local", ".env", "../../.env.local", "../../.env"];
for (const envFile of envFiles) {
  const fullPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(fullPath)) {
    try {
      if (typeof (process as any).loadEnvFile === "function") {
        (process as any).loadEnvFile(fullPath);
      }
    } catch (e) {}
  }
}

import { executeCampaignBatchSend } from "../lib/local-marketing/sender";
import { getLocalCampaignById, saveLocalCampaign } from "../lib/local-marketing/store";
import { renderBelenNewsletterHtml } from "../lib/mails/belenNewsletter";

async function run() {
  const campaignId = "cmp_belen_pittamiglio_2026";
  
  // Forzar asunto sin emoji y HTML limpio
  saveLocalCampaign({
    id: campaignId,
    subject: "Nuevas conversaciones y nuevas formas de participar en LUMINUS",
    previewText: "Este domingo estrenamos una entrevista con Belén Pittamiglio y te presentamos el nuevo feed de la red.",
    fromEmail: "info@luminuslatam.com",
    fromName: "LUMINUS LATAM",
    htmlContent: renderBelenNewsletterHtml(),
    targetTags: [],
    status: "DRAFT",
  });

  const campaign = getLocalCampaignById(campaignId);

  if (!campaign) {
    console.error(`❌ No se encontró la campaña con ID: ${campaignId}`);
    process.exit(1);
  }

  console.log("=================================================================");
  console.log("🚀 INICIANDO ENVÍO MASIVO DE CAMPAÑA VÍA AWS SES");
  console.log("=================================================================");
  console.log(`📌 Asunto: "${campaign.subject}"`);
  console.log(`👤 Remitente: ${campaign.fromName} <${campaign.fromEmail}>`);
  console.log(`🎯 Audiencia: ${campaign.audienceName || "Todos los Contactos"}`);
  console.log(`⏱️  Configuración: 150ms delay entre envíos (tasa controlada)`);
  console.log("-----------------------------------------------------------------\n");

  const startTime = Date.now();
  let lastReportedTime = Date.now();

  const result = await executeCampaignBatchSend(campaignId, {
    delayMs: 150,
    onProgress: (info) => {
      const now = Date.now();
      // Reportar cada 25 envíos o cada 5 segundos
      if (info.sent % 25 === 0 || info.sent === info.total || now - lastReportedTime > 5000) {
        lastReportedTime = now;
        const elapsedSec = Math.round((now - startTime) / 1000);
        const ratePerSec = elapsedSec > 0 ? (info.sent / elapsedSec).toFixed(1) : "0";
        const percent = ((info.sent + info.failed) / info.total) * 100;
        
        console.log(
          `[${new Date().toLocaleTimeString("es-AR")}] ` +
          `📊 Progreso: ${percent.toFixed(1)}% ` +
          `[${info.sent + info.failed}/${info.total}] ` +
          `| ✅ Enviados: ${info.sent.toLocaleString()} ` +
          `| ❌ Fallidos: ${info.failed} ` +
          `| ⚡ ${ratePerSec} emails/s ` +
          `| Último: ${info.currentEmail}`
        );
      }
    },
  });

  const totalDurationMin = ((Date.now() - startTime) / 60000).toFixed(1);

  console.log("\n=================================================================");
  console.log("🎉 ¡ENVÍO MASIVO COMPLETADO CON ÉXITO!");
  console.log("=================================================================");
  console.log(`Total procesados: ${result.total.toLocaleString()}`);
  console.log(`✅ Entregados a AWS SES: ${result.sent.toLocaleString()}`);
  console.log(`❌ Fallidos/Rebotados: ${result.failed}`);
  console.log(`⏱️  Tiempo total de despacho: ${totalDurationMin} minutos`);
  console.log("=================================================================\n");
}

run().catch((err) => {
  console.error("❌ Error fatal en el envío masivo:", err);
  process.exit(1);
});
