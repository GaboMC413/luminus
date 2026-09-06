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

import { sendEventRegistrationEmail } from "../lib/mails/sender";

async function testRegistrationEmail() {
  console.log("🚀 Enviando prueba de correo de confirmación de inscripción vía AWS SES...");
  console.log("Remitente (From):", process.env.EVENT_FROM_EMAIL || "eventos@luminuslatam.com");

  const recipients = ["gabrielmedcap@hotmail.com", "gabrielmedcap@gmail.com"];

  const { prisma } = await import("../lib/db");
  
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

  const eventTitle = dbEvent?.title || "Pilates más allá de la estética: fuerza, movilidad y salud a largo plazo";
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
      const result = await sendEventRegistrationEmail(email, {
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

testRegistrationEmail().then(() => process.exit(0));
