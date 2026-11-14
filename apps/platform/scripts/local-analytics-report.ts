import fs from "fs";
import path from "path";

// Load .env.local if present
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.substring(0, idx).trim();
      const value = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n=======================================================");
  console.log("📊 LUMINUS EMAIL MARKETING ANALYTICS REPORT");
  console.log("=======================================================\n");

  const totalLogs = await prisma.sentEmailLog.count();
  const totalOpened = await prisma.sentEmailLog.count({
    where: { openCount: { gt: 0 } },
  });
  const totalClicked = await prisma.sentEmailLog.count({
    where: { clickCount: { gt: 0 } },
  });

  const bouncedCount = await prisma.sentEmailLog.count({
    where: { status: "BOUNCED" },
  });
  const complaintCount = await prisma.sentEmailLog.count({
    where: { status: "COMPLAINT" },
  });
  const unsubscribedCount = await prisma.unsubscribedEmail.count();

  const openRate = totalLogs > 0 ? ((totalOpened / totalLogs) * 100).toFixed(1) : "0.0";
  const clickRate = totalLogs > 0 ? ((totalClicked / totalLogs) * 100).toFixed(1) : "0.0";

  console.log("📈 OVERALL CAMPAIGN METRICS:");
  console.log(`   • Total Emails Tracked  : ${totalLogs}`);
  console.log(`   • Unique Email Opens    : ${totalOpened} (${openRate}% Open Rate)`);
  console.log(`   • Unique Link Clicks    : ${totalClicked} (${clickRate}% Click Rate)`);
  console.log(`   • Hard Bounces          : ${bouncedCount}`);
  console.log(`   • Spam Complaints       : ${complaintCount}`);
  console.log(`   • Total Unsubscribed    : ${unsubscribedCount}`);

  console.log("\n-------------------------------------------------------");
  console.log("✉️ RECENT SENT EMAILS:");
  console.log("-------------------------------------------------------");

  const recentLogs = await prisma.sentEmailLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  if (recentLogs.length === 0) {
    console.log("   (No email logs recorded yet)");
  } else {
    for (const log of recentLogs) {
      const statusTag = log.status || "SENT";
      const openTag = log.openCount > 0 ? `👀 Opened (${log.openCount}x)` : "🙈 Unopened";
      const clickTag = log.clickCount > 0 ? `🔗 Clicked (${log.clickCount}x)` : "";

      console.log(`   • [${log.createdAt.toISOString().substring(0, 10)}] ${log.recipient} | "${log.subject}"`);
      console.log(`     Status: ${statusTag} | ${openTag} ${clickTag}`);
    }
  }

  console.log("\n=======================================================\n");
}

main()
  .catch((err) => {
    console.error("❌ Analytics report error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
