import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEventRegistrationEmail } from "@/lib/ses";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      city,
      eventId,
      eventTitle,
      eventCoverUrl,
      eventDate,
      timeText,
      speakerName,
      youtubeUrl,
      eventSlug,
    } = body || {};

    if (!email || !firstName) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios (email y nombre)." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName ? lastName.trim() : "";
    const cleanCity = city ? city.trim() : null;

    // 1. Upsert EventGuest in Database
    let guest = null;
    try {
      guest = await prisma.eventGuest.upsert({
        where: { email: cleanEmail },
        update: {
          firstName: cleanFirstName,
          lastName: cleanLastName,
          city: cleanCity,
          isGuest: true,
        },
        create: {
          email: cleanEmail,
          firstName: cleanFirstName,
          lastName: cleanLastName,
          city: cleanCity,
          isGuest: true,
        },
      });
    } catch (dbErr: any) {
      console.error("[Database EventGuest Error]:", dbErr.message || dbErr);
    }

    // 2. Upsert EventInscription if valid eventId UUID is provided
    if (guest && eventId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)) {
      try {
        await prisma.eventInscription.upsert({
          where: {
            eventId_guestId: {
              eventId,
              guestId: guest.id,
            },
          },
          update: {},
          create: {
            eventId,
            guestId: guest.id,
          },
        });
      } catch (insErr: any) {
        console.error("[Database EventInscription Error]:", insErr.message || insErr);
      }
    }

    // 3. Send confirmation email via AWS SES from eventos@luminuslatam.com
    let emailStatus = "sent";
    try {
      await sendEventRegistrationEmail({
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        eventTitle: eventTitle || "Evento de Bienestar LUMINUS",
        eventCoverUrl,
        eventDate,
        timeText,
        speakerName,
        youtubeUrl,
        eventSlug,
      });
      console.log(`[Event Registration Email Sent]: ${cleanEmail} via eventos@luminuslatam.com`);
    } catch (emailErr: any) {
      console.error("[SES Send Email Error]:", emailErr.message || emailErr);
      emailStatus = "failed";
    }

    // 4. Log sent email in SentEmailLog
    try {
      await prisma.sentEmailLog.create({
        data: {
          recipient: cleanEmail,
          subject: `[LUMINUS] Confirmación de inscripción: ${eventTitle || "Evento de Bienestar"}`,
          htmlBody: `Inscripción enviada desde eventos@luminuslatam.com. Estado: ${emailStatus}`,
        },
      });
    } catch (logErr: any) {
      console.error("[SentEmailLog Error]:", logErr.message || logErr);
    }

    return NextResponse.json({ success: true, emailStatus });
  } catch (err: any) {
    console.error("[Event Inscription Route Error]:", err.message || err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al procesar la inscripción." },
      { status: 500 }
    );
  }
}
