import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEventRegistrationEmail } from "@/lib/ses";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

const supabaseServer = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

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
          console.warn("[Supabase Warning] Contact upsert error:", contactError.message);
          dbError = contactError.message;
        } else {
          dbSuccess = true;
          const contactId = contactData?.id;

          if (contactId && eventId) {
            const { error: inscriptionError } = await supabaseServer
              .from("event_inscriptions")
              .insert({
                contact_id: contactId,
                event_id: eventId,
                attended: false,
              });

            if (inscriptionError) {
              console.warn("[Supabase Warning] Inscription insert error:", inscriptionError.message);
            }
          }
        }
      } catch (err: any) {
        console.warn("[Supabase Error]:", err?.message);
        dbError = err?.message;
      }
    }

    // 2. Send confirmation email via AWS SES
    let emailSuccess = false;
    let emailError = null;

    // Format Youtube URL if not explicitly provided
    const finalYoutubeUrl =
      youtubeUrl ||
      (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null);

    try {
      await sendEventRegistrationEmail({
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
