import fs from "fs";
import path from "path";
import { renderVivianaNewsletterHtml } from "../lib/mails/vivianaNewsletter";
import { sendSingleTestEmail } from "../lib/local-marketing/sender";

// Load env from apps/platform/.env.local
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

async function sendTest() {
  const targetEmail = process.argv[2] || "gabrielmedcap@hotmail.com";
  console.log(`🚀 Enviando mail de prueba a: ${targetEmail}...`);

  const htmlContent = renderVivianaNewsletterHtml({ nombre: "Gabriel" });

  const res = await sendSingleTestEmail({
    toEmail: targetEmail,
    subject: "Algo para llevarte esta semana",
    fromEmail: "info@luminuslatam.com",
    fromName: "LUMINUS LATAM",
    htmlContent,
    campaignId: "cmp_viviana_1788832131088",
  });

  if (res.success) {
    console.log("✅ Mail de prueba enviado correctamente!");
    console.log("📩 MessageId:", res.messageId);
  } else {
    console.error("❌ Error al enviar mail de prueba:", res.error);
  }
}

sendTest().catch((err) => {
  console.error("❌ Exception:", err);
});
