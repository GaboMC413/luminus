import fs from "fs";
import path from "path";

// Cargar variables de entorno
const envFiles = [
  path.resolve(__dirname, "../apps/platform/.env.local"),
  path.resolve(__dirname, "../apps/platform/.env"),
  path.resolve(__dirname, "../.env.local"),
  path.resolve(__dirname, "../.env"),
];

for (const envPath of envFiles) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const idx = trimmed.indexOf("=");
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}

import { executeCampaignBatchSend } from "../apps/platform/lib/local-marketing/sender";
import { getLocalCampaignById } from "../apps/platform/lib/local-marketing/store";

async function run() {
  const campaignId = "cmp_1790118100900_melca";
  const campaign = getLocalCampaignById(campaignId);

  if (!campaign) {
    console.error(`❌ No se encontró la campaña con ID: ${campaignId}`);
    process.exit(1);
  }

  console.log("=================================================================");
  console.log("🚀 PREPARANDO ENVÍO MASIVO VÍA AWS SES");
  console.log("=================================================================");
  console.log(`📌 Asunto: "${campaign.subject}"`);
  console.log(`👤 Remitente: ${campaign.fromName} <${campaign.fromEmail}>`);
  console.log(`🎯 Audiencia: ${campaign.audienceName || "Todos los Contactos Activos"}`);
  console.log(`⏱️  Ritmo de envío: ~6-7 emails/segundo (delay de 100ms entre llamadas)`);
  console.log("=================================================================\n");

  const startTime = Date.now();
  let lastReportedTime = Date.now();

  const result = await executeCampaignBatchSend(campaignId, {
    delayMs: 100,
    onProgress: (info) => {
      const now = Date.now();
      // Reportar cada 50 correos o cada 5 segundos
      if (info.sent % 50 === 0 || info.sent === info.total || now - lastReportedTime > 5000) {
        lastReportedTime = now;
        const elapsedSec = Math.round((now - startTime) / 1000);
        const ratePerSec = elapsedSec > 0 ? (info.sent / elapsedSec).toFixed(1) : "0";
        const percent = ((info.sent + info.failed) / info.total) * 100;

        console.log(
          `[${new Date().toLocaleTimeString("es-AR")}] ` +
            `📊 Progreso: ${percent.toFixed(1)}% ` +
            `[${(info.sent + info.failed).toLocaleString()}/${info.total.toLocaleString()}] ` +
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
