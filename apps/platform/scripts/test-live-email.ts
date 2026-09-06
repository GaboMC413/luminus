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

import { sendEventLiveNotificationEmail } from "../lib/mails/sender";

async function testLiveEmail() {
  console.log("🚀 Enviando prueba de notificación de evento en vivo vía AWS SES...");
  console.log("Remitente (From):", process.env.EVENT_FROM_EMAIL || "eventos@luminuslatam.com");

  const recipients = ["gabrielmedcap@hotmail.com", "gabrielmedcap@gmail.com"];

  const { prisma } = await import("../lib/db");
  
  // Intentar buscar evento en la base de datos de Viviana o el último evento creado
  let dbEvent = await prisma.event.findFirst({
    where: {
      OR: [
        { speakerName: { contains: "Viviana", mode: "insensitive" } },
        { title: { contains: "Viviana", mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  if (!dbEvent) {
    dbEvent = await prisma.event.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }

  const eventTitle = dbEvent?.title || "Entrevista Online con Viviana Pagliaroli";
  const speakerName = dbEvent?.speakerName || "Viviana Pagliaroli";
  const coverUrl = dbEvent?.coverUrl || "https://luminuslatam.com/Photos/Luminus%20app%20-%20buscar%20especialistas%20y%20comunidad.png";
  const youtubeUrl = dbEvent?.youtubeId 
    ? `https://www.youtube.com/watch?v=${dbEvent.youtubeId}` 
    : (dbEvent?.link || "https://www.youtube.com/@luminus_latam");
  const timeText = dbEvent?.timeText || "18:00 hs (GMT-3)";
  const eventDate = dbEvent?.date ? dbEvent.date.toISOString() : "2026-09-06";

  console.log("\n📋 Datos del Evento:");
  console.log("   • Título:", eventTitle);
  console.log("   • Speaker:", speakerName);
  console.log("   • YouTube Link:", youtubeUrl);
  console.log("   • Hora:", timeText);

  for (const email of recipients) {
    console.log(`\n📧 Enviando correo de prueba a: ${email}...`);
    try {
      const result = await sendEventLiveNotificationEmail(email, {
        firstName: "Gabriel",
        eventTitle,
        eventCoverUrl: coverUrl,
        eventDate,
        timeText,
        speakerName,
        youtubeUrl,
        eventSlug: dbEvent?.slug || "viviana-pagliaroli-estreno",
      });
      console.log(`   ✅ ÉXITO a ${email}. Result:`, result);
    } catch (err: any) {
      console.error(`   ❌ ERROR enviando a ${email}:`, err.message || err);
    }
  }
}

testLiveEmail().then(() => process.exit(0));
