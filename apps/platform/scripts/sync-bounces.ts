import fs from "fs";
import path from "path";
import { syncAwsSuppressionListToLocalContacts } from "../lib/local-marketing/awsSesAnalytics";

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

async function sync() {
  console.log("🔄 Sincronizando lista de supresión de AWS SES (bounces & complaints)...");
  try {
    const result = await syncAwsSuppressionListToLocalContacts();
    console.log("✅ Sincronización finalizada:");
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("❌ Error en la sincronización:", err);
  }
}

sync();
