import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEventRegistrationEmail } from "@/lib/ses";
import { verifyTurnstileToken } from "@/lib/turnstile";

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
      isResend,
      turnstileToken,
    } = body || {};

    const turnstileResult = await verifyTurnstileToken(turnstileToken);
    if (!turnstileResult.success) {
      return NextResponse.json(
        { success: false, error: turnstileResult.error },
        { status: 400 }
      );
    }

    if (!email || (!firstName && !isResend)) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios (email y nombre)." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName ? firstName.trim() : "";
    const cleanLastName = lastName ? lastName.trim() : "";
    const cleanCity = city ? city.trim() : null;

    // 1. Resolve Event ID and event details from DB
    let resolvedEventId: string | null = null;
    let dbEvent: any = null;

    if (eventId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)) {
      resolvedEventId = eventId;
    }

    try {
      if (resolvedEventId) {
        dbEvent = await prisma.event.findUnique({ where: { id: resolvedEventId } });
      } else if (eventSlug || eventTitle) {
        dbEvent = await prisma.event.findFirst({
          where: {
            OR: [
              ...(eventSlug ? [{ slug: eventSlug }] : []),
              ...(eventTitle ? [{ title: eventTitle }] : []),
            ],
          },
        });
        if (dbEvent) {
          resolvedEventId = dbEvent.id;
        }
      }
    } catch (findErr: any) {
      console.warn("[Event Lookup Error]:", findErr.message || findErr);
    }

    // 2. Upsert EventGuest in Database
    let guest = null;
    try {
      guest = await prisma.eventGuest.upsert({
        where: { email: cleanEmail },
        update: {
          ...(cleanFirstName ? { firstName: cleanFirstName } : {}),
          ...(cleanLastName ? { lastName: cleanLastName } : {}),
          ...(cleanCity ? { city: cleanCity } : {}),
          isGuest: true,
        },
        create: {
          email: cleanEmail,
          firstName: cleanFirstName || "Invitado",
          lastName: cleanLastName,
          city: cleanCity,
          isGuest: true,
        },
      });
    } catch (dbErr: any) {
      console.error("[Database EventGuest Error]:", dbErr.message || dbErr);
      return NextResponse.json(
        { success: false, error: "Error de base de datos al guardar los datos de la persona." },
        { status: 500 }
      );
    }

    // 3. Check & Upsert EventInscription if resolvedEventId is present
    let alreadyRegistered = false;
    if (guest && resolvedEventId) {
      try {
        const existingInscription = await prisma.eventInscription.findUnique({
          where: {
            eventId_guestId: {
              eventId: resolvedEventId,
              guestId: guest.id,
            },
          },
        });

        if (existingInscription) {
          alreadyRegistered = true;
        }

        await prisma.eventInscription.upsert({
          where: {
            eventId_guestId: {
              eventId: resolvedEventId,
              guestId: guest.id,
            },
          },
          update: {},
          create: {
            eventId: resolvedEventId,
            guestId: guest.id,
          },
        });
      } catch (insErr: any) {
        console.error("[Database EventInscription Error]:", insErr.message || insErr);
        return NextResponse.json(
          { success: false, error: "Error de base de datos al vincular la inscripción." },
          { status: 500 }
        );
      }
    }

    // 4. Send confirmation email via AWS SES from eventos@luminuslatam.com
    // Always trigger email for every event registration or confirmation request
    let emailStatus = "sent";
    let emailError: string | undefined = undefined;

    const rawYt = youtubeUrl || body?.youtubeId || null;
    let finalYoutubeUrl: string | undefined = undefined;
    if (rawYt && rawYt.trim()) {
      const trimmed = rawYt.trim();
      finalYoutubeUrl = (trimmed.startsWith("http://") || trimmed.startsWith("https://")) ? trimmed : `https://www.youtube.com/watch?v=${trimmed}`;
    } else if (dbEvent?.youtubeId) {
      finalYoutubeUrl = `https://www.youtube.com/watch?v=${dbEvent.youtubeId}`;
    } else if (dbEvent?.link && (dbEvent.link.includes("youtube") || dbEvent.link.includes("youtu.be"))) {
      finalYoutubeUrl = dbEvent.link;
    }

    try {
      console.log(`[SES START] Procesando envío de email para ${cleanEmail} (evento: ${eventTitle || dbEvent?.title || "Evento LUMINUS"})...`);
      const emailRes = await sendEventRegistrationEmail({
        firstName: guest.firstName || cleanFirstName || "Invitado",
        lastName: guest.lastName || cleanLastName,
        email: cleanEmail,
        eventTitle: eventTitle || dbEvent?.title || "Evento de Bienestar LUMINUS",
        eventCoverUrl: eventCoverUrl || dbEvent?.coverUrl || null,
        eventDate: eventDate || (dbEvent?.date ? dbEvent.date.toISOString() : null),
        timeText: timeText || dbEvent?.timeText || null,
        speakerName: speakerName || dbEvent?.speakerName || null,
        youtubeUrl: finalYoutubeUrl,
        eventSlug: eventSlug || dbEvent?.slug || null,
      });
      console.log(`[Event Registration Email Sent]: ${cleanEmail} (resend=${!!isResend}) MessageId:`, (emailRes as any)?.messageId || "local-preview");
    } catch (emailErr: any) {
      console.error("❌ Error enviando email de confirmación:", JSON.stringify(emailErr, null, 2));
      emailStatus = "failed";
      emailError = emailErr?.message || String(emailErr);
    }

    return NextResponse.json({
      success: true,
      alreadyRegistered,
      emailStatus,
      ...(emailError ? { emailError } : {}),
    });
  } catch (err: any) {
    console.error("[Event Inscription Route Error]:", err.message || err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al procesar la inscripción." },
      { status: 500 }
    );
  }
}
