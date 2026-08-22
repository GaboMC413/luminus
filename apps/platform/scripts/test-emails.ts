import fs from "fs";
import path from "path";

// Cargar .env.local
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const parts = trimmed.split("=");
      const key = parts[0]?.trim();
      const val = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "");
      if (key && val) {
        process.env[key] = val;
      }
    }
  });
}

import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendEmailChangeVerificationEmail,
  sendEventRegistrationEmail,
  sendContactNotificationEmail,
} from "../lib/mails/sender";

async function runTest() {
  const recipients = ["gabrielmedcap@hotmail.com", "gabrielmedcap@gmail.com"];

  console.log("🚀 Iniciando prueba de envíos de correo vía AWS SES...");
  console.log(`SES Region: ${process.env.SES_REGION}`);
  console.log(`SES AccessKeyId: ${process.env.SES_ACCESS_KEY_ID}`);
  console.log(`From Email Default: ${process.env.SES_FROM_EMAIL}`);
  console.log(`Event From Email: ${process.env.EVENT_FROM_EMAIL}`);

  for (const email of recipients) {
    console.log(`\n========================================`);
    console.log(`📧 ENVIANDO PRUEBAS A: ${email}`);
    console.log(`========================================`);

    // 1. Password Reset
    try {
      console.log(`1. [RECUPERACIÓN CONTRASEÑA] Enviando a ${email}...`);
      const res1 = await sendPasswordResetEmail(email, "849204");
      console.log("   ✅ ÉXITO MessageId:", res1.messageId || res1.mode);
    } catch (e: any) {
      console.error("   ❌ ERROR:", e.message || e);
    }

    // 2. Welcome Email
    try {
      console.log(`2. [BIENVENIDA] Enviando a ${email}...`);
      const res2 = await sendWelcomeEmail(email, "Gabriel Medina");
      console.log("   ✅ ÉXITO MessageId:", res2.messageId || res2.mode);
    } catch (e: any) {
      console.error("   ❌ ERROR:", e.message || e);
    }

    // 3. Email Change Verification
    try {
      console.log(`3. [CAMBIO DE CORREO] Enviando a ${email}...`);
      const res3 = await sendEmailChangeVerificationEmail(email, "392019");
      console.log("   ✅ ÉXITO MessageId:", res3.messageId || res3.mode);
    } catch (e: any) {
      console.error("   ❌ ERROR:", e.message || e);
    }

    // 4. Event Registration
    try {
      console.log(`4. [INSCRIPCIÓN EVENTO] Enviando a ${email}...`);
      const res4 = await sendEventRegistrationEmail(email, {
        firstName: "Gabriel",
        eventTitle: "Taller de Bienestar Emocional & Salud Mental",
        eventCoverUrl: "https://luminusbienestar.com/logo-mails.png",
        eventDate: "2026-08-28",
        timeText: "18:00 hs (GMT-3)",
        speakerName: "Dra. Sofía Martínez",
        eventSlug: "bienestar-emocional-2026",
      });
      console.log("   ✅ ÉXITO MessageId:", res4.messageId || res4.mode);
    } catch (e: any) {
      console.error("   ❌ ERROR:", e.message || e);
    }
  }

  // 5. Contact Notification
  console.log(`\n========================================`);
  console.log(`📨 5. [NOTIFICACIÓN DE CONTACTO] Enviando a ${recipients.join(", ")}...`);
  console.log(`========================================`);
  try {
    process.env.CONTACT_NOTIFICATION_EMAILS = recipients.join(",");
    const res5 = await sendContactNotificationEmail({
      nombre: "Gabriel",
      apellido: "Medina",
      email: "gabrielmedcap@gmail.com",
      telefono: "+54 9 11 1234-5678",
      pais: "Uruguay",
      motivo: "Prueba de Integración LUMINUS",
      mensaje: "Hola Gabriel! Este es un mensaje de prueba enviado directamente a hotmail y gmail.",
    });
    console.log("   ✅ ÉXITO MessageId:", res5.messageId || res5.mode);
  } catch (e: any) {
    console.error("   ❌ ERROR:", e.message || e);
  }

  console.log("\n✨ Todos los envíos han sido procesados.");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("FATAL TEST ERROR:", err);
  process.exit(1);
});
