import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEventRegistrationEmail } from "@/lib/ses";

function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
      youtubeId,
      youtubeUrl,
      eventSlug,
    } = body;

    // Validation
    if (!firstName || !lastName || !email || !eventTitle) {
      return NextResponse.json(
        { error: "Nombre, apellido, email y título del evento son obligatorios." },
        { status: 400 }
      );
    }

    const supabaseServer = getSupabaseServer();

    // 1. Save in Supabase
    let dbSuccess = false;
    let dbError = null;

    if (supabaseServer) {
      try {
        const { data: contactData, error: contactError } = await supabaseServer
          .from("contacts")
          .upsert(
            {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              email: email.trim(),
              city: city ? city.trim() : null,
              marketing_consent: true,
            },
            { onConflict: "email" }
          )
          .select()
          .single();

        if (contactError) {
          console.error("[Supabase Contact Error]:", contactError.message);
          dbError = contactError.message;
        } else {
          dbSuccess = true;
          const contactId = contactData?.id;

          // Resolve eventId to a valid UUID if necessary
          let resolvedEventId = eventId;
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId || "");

          if (!isUuid && (eventSlug || eventTitle)) {
            const { data: foundEvent } = await supabaseServer
              .from("events")
              .select("id")
              .or(`slug.eq.${eventSlug},title.eq.${eventTitle}`)
              .maybeSingle();

            if (foundEvent) {
              resolvedEventId = foundEvent.id;
            }
          }

          const finalIsUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedEventId || "");

          if (contactId && finalIsUuid) {
            const { error: inscriptionError } = await supabaseServer
              .from("event_inscriptions")
              .upsert(
                {
                  contact_id: contactId,
                  event_id: resolvedEventId,
                  attended: false,
                },
                { onConflict: "contact_id,event_id" }
              );

            if (inscriptionError) {
              console.error("[Supabase Inscription Error]:", inscriptionError.message);
            } else {
              console.log(`[Supabase Inscription Success] Contact ${contactId} registered for event ${resolvedEventId}`);
            }
          }
        }
      } catch (err: any) {
        console.error("[Supabase Unexpected Error]:", err?.message);
        dbError = err?.message;
      }
    } else {
      console.warn("[Supabase Warning] Supabase client not initialized in event-inscription API");
    }

    // 2. Send confirmation email via AWS SES
    let emailSuccess = false;
    let emailError = null;

    const finalYoutubeUrl =
      youtubeUrl ||
      (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null);

    try {
      const sesResult = await sendEventRegistrationEmail({
        firstName: firstName.trim(),
        lastName: lastName ? lastName.trim() : undefined,
        email: email.trim(),
        eventTitle: eventTitle.trim(),
        eventCoverUrl: eventCoverUrl || null,
        eventDate: eventDate || null,
        timeText: timeText || null,
        speakerName: speakerName || null,
        youtubeUrl: finalYoutubeUrl,
        eventSlug: eventSlug || null,
      });
      console.log("[AWS SES Event Email Success] MessageId:", sesResult?.MessageId);
      emailSuccess = true;
    } catch (err: any) {
      console.error("[AWS SES Event Email Error]:", {
        name: err?.name,
        message: err?.message,
        code: err?.code,
      });
      emailError = `${err?.name || "SESError"}: ${err?.message || "Error enviando correo"}`;
    }

    return NextResponse.json({
      success: true,
      dbSaved: dbSuccess,
      emailSent: emailSuccess,
      warnings: {
        ...(dbError ? { dbError } : {}),
        ...(emailError ? { emailError } : {}),
      },
    });
  } catch (error: any) {
    console.error("[API Event Inscription Error]:", error);
    return NextResponse.json(
      { error: "Ocurrió un error interno procesando la inscripción." },
      { status: 500 }
    );
  }
}
