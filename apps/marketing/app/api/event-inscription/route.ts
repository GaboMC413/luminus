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
      isResend,
    } = body || {};

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

    // 1. Resolve Event ID from DB if not provided directly as UUID
    let resolvedEventId: string | null = null;
    if (eventId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)) {
      resolvedEventId = eventId;
    } else if (eventSlug || eventTitle) {
      try {
        const foundEvent = await prisma.event.findFirst({
          where: {
            OR: [
              ...(eventSlug ? [{ slug: eventSlug }] : []),
              ...(eventTitle ? [{ title: eventTitle }] : []),
            ],
          },
          select: { id: true },
        });
        if (foundEvent) {
          resolvedEventId = foundEvent.id;
        }
      } catch (findErr: any) {
        console.warn("[Event Lookup Error]:", findErr.message || findErr);
      }
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
    // Send email on new registrations or on explicit resend requests
    let emailStatus = "sent";
    if (!alreadyRegistered || isResend) {
      try {
        await sendEventRegistrationEmail({
          firstName: guest.firstName || cleanFirstName || "Invitado",
          lastName: guest.lastName || cleanLastName,
          email: cleanEmail,
          eventTitle: eventTitle || "Evento de Bienestar LUMINUS",
          eventCoverUrl,
          eventDate,
          timeText,
          speakerName,
          youtubeUrl,
          eventSlug,
        });
        console.log(`[Event Registration Email Sent]: ${cleanEmail} (resend=${!!isResend}) via eventos@luminuslatam.com`);
      } catch (emailErr: any) {
        console.error("[SES Send Email Error]:", emailErr.message || emailErr);
        emailStatus = "failed";
      }
    }

    return NextResponse.json({ success: true, alreadyRegistered, emailStatus });
  } catch (err: any) {
    console.error("[Event Inscription Route Error]:", err.message || err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al procesar la inscripción." },
      { status: 500 }
    );
  }
}
