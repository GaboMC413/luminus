import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendContactNotificationEmail } from "@/lib/ses";

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
    const { nombre, apellido, email, telefono, pais, motivo, mensaje } = body;

    // Validación de campos requeridos
    if (!nombre || !apellido || !email || !motivo || !mensaje) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios deben ser completados." },
        { status: 400 }
      );
    }

    // 1. Guardar en Supabase
    let dbSuccess = false;
    let dbError = null;

    if (supabaseServer) {
      const { error } = await supabaseServer.from("contact_messages").insert([
        {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim(),
          telefono: telefono ? telefono.trim() : null,
          pais: pais ? pais.trim() : null,
          motivo: motivo.trim(),
          mensaje: mensaje.trim(),
        },
      ]);

      if (error) {
        console.error("[Supabase Error] Error al guardar contacto:", error);
        dbError = error.message;
      } else {
        dbSuccess = true;
      }
    } else {
      console.warn("[Supabase Warning] Cliente de Supabase no configurado.");
    }

    // 2. Enviar notificación por AWS SES
    let emailSuccess = false;
    let emailError = null;

    try {
      await sendContactNotificationEmail({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        telefono: telefono ? telefono.trim() : undefined,
        pais: pais ? pais.trim() : undefined,
        motivo: motivo.trim(),
        mensaje: mensaje.trim(),
      });
      emailSuccess = true;
    } catch (err: any) {
      console.error("[AWS SES Error] Error detallado al enviar email de notificación:", {
        name: err?.name,
        message: err?.message,
        code: err?.code,
        metadata: err?.$metadata,
      });
      emailError = `${err?.name || "SESError"}: ${err?.message || "Error al enviar correo electrónico"}`;
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
    console.error("[API Contact Error]:", error);
    return NextResponse.json(
      { error: "Ocurrió un error interno procesando tu solicitud." },
      { status: 500 }
    );
  }
}
