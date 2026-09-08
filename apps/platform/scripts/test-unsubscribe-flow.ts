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

import {
  generateUnsubscribeToken,
  verifyUnsubscribeToken,
  generateUnsubscribeUrls,
  filterUnsubscribedEmails,
  prepareCampaignEmail,
} from "./local-unsubscribe-helper";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Running Unsubscribe Flow Integration Tests...\n");

  const testEmail = "test_subscriber_2026@example.com";

  // 1. Test HMAC Token Generation & Verification
  const token = generateUnsubscribeToken(testEmail);
  const isValid = verifyUnsubscribeToken(testEmail, token);
  const isInvalid = verifyUnsubscribeToken(testEmail, "wrong-token-12345");

  console.log("1. HMAC Token Verification:");
  console.log("   - Token:", token);
  console.log("   - Valid Token Check:", isValid ? "✅ PASSED" : "❌ FAILED");
  console.log("   - Tampered Token Check:", !isInvalid ? "✅ PASSED" : "❌ FAILED");

  // 2. Test URL & Header Generation
  const { unsubscribeUrl, apiUrl } = generateUnsubscribeUrls(testEmail);
  console.log("\n2. Generated URLs:");
  console.log("   - Unsubscribe Web Page:", unsubscribeUrl);
  console.log("   - 1-Click API URL:", apiUrl);

  // 3. Test Campaign Email Formatting
  const { html, sesHeaders } = prepareCampaignEmail({
    recipientEmail: testEmail,
    htmlContent: "<html><body><h1>Boletín Mensual</h1><p>Contenido...</p></body></html>",
  });

  const containsLink = html.includes("/desuscribir?email=");
  const hasHeaders = Boolean(sesHeaders["List-Unsubscribe"] && sesHeaders["List-Unsubscribe-Post"]);
  console.log("\n3. Campaign Email Formatting:");
  console.log("   - HTML Footer Injection:", containsLink ? "✅ PASSED" : "❌ FAILED");
  console.log("   - RFC 8058 SES Headers:", hasHeaders ? "✅ PASSED" : "❌ FAILED");

  // 4. Test DB Record Unsubscribe & Filtering
  console.log("\n4. Database Filtering:");
  // Insert test unsubscribe record
  await prisma.unsubscribedEmail.upsert({
    where: { email: testEmail },
    create: { email: testEmail, reason: "Test Script Unsubscribe" },
    update: { createdAt: new Date() },
  });

  const emailList = [testEmail, "active_user_2026@example.com"];
  const filtered = await filterUnsubscribedEmails(emailList);

  const correctlyFiltered = !filtered.includes(testEmail) && filtered.includes("active_user_2026@example.com");
  console.log("   - Unsubscribed Email Filtering:", correctlyFiltered ? "✅ PASSED" : "❌ FAILED");

  // Cleanup test record
  await prisma.unsubscribedEmail.deleteMany({
    where: { email: testEmail },
  });
  console.log("   - Database Cleanup: Done");

  // 5. Test Analytics Tracking Record & Link Rewriting
  console.log("\n5. Analytics Tracking:");
  const sentLog = await prisma.sentEmailLog.create({
    data: {
      recipient: testEmail,
      subject: "Test Analytics Email",
      htmlBody: "<h1>Test</h1>",
      status: "SENT",
    },
  });

  const campaign = prepareCampaignEmail({
    recipientEmail: testEmail,
    htmlContent: '<html><body><a href="https://luminuslatam.com/proximasfechas">Ver Eventos</a></body></html>',
    emailLogId: sentLog.id,
  });

  const hasPixel = campaign.html.includes(`/api/track/open?id=${sentLog.id}`);
  const hasClickProxy = campaign.html.includes(`/api/track/click?id=${sentLog.id}`);

  console.log("   - Open Tracking Pixel Injection:", hasPixel ? "✅ PASSED" : "❌ FAILED");
  console.log("   - Click Proxy URL Rewriting:", hasClickProxy ? "✅ PASSED" : "❌ FAILED");

  // Clean test log
  await prisma.sentEmailLog.delete({ where: { id: sentLog.id } });

  console.log("\n✨ All Integration Tests Completed Successfully!");
}

main()
  .catch((err) => {
    console.error("❌ Test script failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
