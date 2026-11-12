const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...values] = trimmed.split("=");
        const val = values.join("=").replace(/^["']|["']$/g, "").trim();
        if (key && !process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    }
  }
}

// Load env files from platform and workspace root
loadEnvFile(path.resolve(__dirname, "../.env.local"));
loadEnvFile(path.resolve(__dirname, "../.env"));
loadEnvFile(path.resolve(__dirname, "../../.env.local"));
loadEnvFile(path.resolve(__dirname, "../../.env"));

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== AUTO-ACCEPT PENDING CONNECTIONS MIGRATION ===");
  console.log("Timestamp:", new Date().toISOString());

  try {
    // 1. Inspect existing pending connections
    const pendingConnectionsCount = await prisma.userConnection.count({
      where: { status: "pending" },
    });
    console.log(`Found ${pendingConnectionsCount} pending connection(s).`);

    let updatedConnectionsCount = 0;
    if (pendingConnectionsCount > 0) {
      const result = await prisma.userConnection.updateMany({
        where: { status: "pending" },
        data: {
          status: "accepted",
          updatedAt: new Date(),
        },
      });
      updatedConnectionsCount = result.count;
      console.log(`Successfully updated ${updatedConnectionsCount} connection(s) to 'accepted'.`);
    } else {
      console.log("No pending connections to update.");
    }

    // 2. Inspect legacy connection_request notifications
    const legacyNotificationsCount = await prisma.notification.count({
      where: { type: "connection_request" },
    });
    console.log(`Found ${legacyNotificationsCount} legacy 'connection_request' notification(s).`);

    let updatedNotificationsCount = 0;
    if (legacyNotificationsCount > 0) {
      const notifResult = await prisma.notification.updateMany({
        where: { type: "connection_request" },
        data: {
          type: "network_add",
          title: "Nueva conexión",
          body: "te sumó a su red.",
        },
      });
      updatedNotificationsCount = notifResult.count;
      console.log(`Successfully updated ${updatedNotificationsCount} notification(s) to 'network_add'.`);
    } else {
      console.log("No legacy connection notifications to update.");
    }

    console.log("=== MIGRATION COMPLETED SUCCESSFULLY ===");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
