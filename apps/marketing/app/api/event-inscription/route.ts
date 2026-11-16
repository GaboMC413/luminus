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
      userTimezone,
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
    
    // Parse location string into city, state, country
    const rawLoc = body?.location || city;
    const parts = rawLoc ? String(rawLoc).split(",").map((p: string) => p.trim()).filter(Boolean) : [];
    const parsedCity = parts.length > 0 ? parts[0] : null;
    const parsedState = parts.length >= 3 ? parts.slice(1, -1).join(", ") : (parts.length === 2 ? parts[1] : null);
    const parsedCountry = parts.length >= 3 ? parts[parts.length - 1] : null;

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
              ...(eventSlug ? [{ slug: String(eventSlug).trim() }] : []),
              ...(eventTitle ? [{ title: String(eventTitle).trim() }] : []),
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

    if (!dbEvent || !resolvedEventId) {
      return NextResponse.json(
        { success: false, error: "El evento solicitado no fue encontrado." },
        { status: 404 }
      );
    }

    // 2. Upsert EventGuest in Database
    let guest = null;
    try {
      guest = await prisma.eventGuest.upsert({
        where: { email: cleanEmail },
        update: {
          ...(cleanFirstName ? { firstName: cleanFirstName } : {}),
          ...(cleanLastName ? { lastName: cleanLastName } : {}),
          ...(parsedCity ? { city: parsedCity } : {}),
          ...(parsedState ? { state: parsedState } : {}),
          ...(parsedCountry ? { country: parsedCountry } : {}),
          isGuest: true,
        },
        create: {
          email: cleanEmail,
          firstName: cleanFirstName || "Invitado",
          lastName: cleanLastName,
          city: parsedCity,
          state: parsedState,
          country: parsedCountry,
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
    // Always use trusted database event fields to prevent email content/link spoofing
    let emailStatus = "sent";

    let finalYoutubeUrl: string | undefined = undefined;
    if (dbEvent.youtubeId) {
      finalYoutubeUrl = `https://www.youtube.com/watch?v=${dbEvent.youtubeId}`;
    } else if (dbEvent.link && (dbEvent.link.includes("youtube") || dbEvent.link.includes("youtu.be"))) {
      finalYoutubeUrl = dbEvent.link;
    }

    try {
      console.log(`[SES START] Procesando envío de email para ${cleanEmail} (evento: ${dbEvent.title})...`);
      const emailRes = await sendEventRegistrationEmail({
        firstName: guest.firstName || cleanFirstName || "Invitado",
        lastName: guest.lastName || cleanLastName,
        email: cleanEmail,
        eventTitle: dbEvent.title,
        eventCoverUrl: dbEvent.coverUrl || null,
        eventDate: dbEvent.date ? dbEvent.date.toISOString() : null,
        timeText: dbEvent.timeText || null,
        speakerName: dbEvent.speakerName || null,
        youtubeUrl: finalYoutubeUrl,
        eventSlug: dbEvent.slug || null,
        location: dbEvent.location || "Estreno en YouTube",
        userTimezone: typeof userTimezone === "string" ? userTimezone.slice(0, 80) : null,
        source: "web",
      });
      console.log(`[Event Registration Email Sent]: ${cleanEmail} (resend=${!!isResend}) MessageId:`, (emailRes as any)?.messageId || "local-preview");
    } catch (emailErr: unknown) {
      const { logServerError } = await import("@/lib/server-error");
      logServerError("[marketing/event-inscription] SES error", emailErr);
      emailStatus = "failed";
    }

    return NextResponse.json({
      success: true,
      alreadyRegistered,
      emailStatus,
    });
  } catch (err: unknown) {
    const { handleMarketingApiError } = await import("@/lib/server-error");
    return handleMarketingApiError(err, {
      context: "[marketing/event-inscription] POST",
      error: "Error al procesar la inscripción.",
    });
  }
}
