import fs from "fs";
import path from "path";
import { getSesV2Client } from "../lib/mails/sesClient";
import { GetConfigurationSetCommand, ListConfigurationSetsCommand } from "@aws-sdk/client-sesv2";

const workspaceRoot = "c:/Users/gabri/OneDrive/Escritorio/Trabajo/LUMINUS/Web - App/luminus";
const envPath = path.join(workspaceRoot, "apps", "platform", ".env.local");
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

async function checkSESConfig() {
  try {
    const client = getSesV2Client();
    const configSets = await client.send(new ListConfigurationSetsCommand({}));
    console.log("Configuration sets found:", configSets.ConfigurationSets);

    for (const cs of configSets.ConfigurationSets || []) {
      if (cs.ConfigurationSetName) {
        const details = await client.send(new GetConfigurationSetCommand({ ConfigurationSetName: cs.ConfigurationSetName }));
        console.log(`Config Set Details [${cs.ConfigurationSetName}]:`, JSON.stringify(details, null, 2));
      }
    }
  } catch (err: any) {
    console.error("Error inspecting SES Config Sets:", err?.message || err);
  }
}

checkSESConfig();
