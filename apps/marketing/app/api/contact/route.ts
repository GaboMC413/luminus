import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendContactNotificationEmail } from "@/lib/ses";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { handleMarketingApiError, logServerError } from "@/lib/server-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, apellido, email, telefono, pais, motivo, mensaje, turnstileToken } = body;

    const turnstileResult = await verifyTurnstileToken(turnstileToken);
    if (!turnstileResult.success) {
      return NextResponse.json(
        { error: turnstileResult.error },
        { status: 400 }
      );
    }

    // Validación de campos requeridos
    if (!nombre || !apellido || !email || !motivo || !mensaje) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios deben ser completados." },
        { status: 400 }
      );
    }

    const cleanNombre = nombre.trim();
    const cleanApellido = apellido.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanTelefono = telefono ? telefono.trim() : null;
    const cleanPais = pais ? pais.trim() : null;
    const cleanMotivo = motivo.trim();
    const cleanMensaje = mensaje.trim();

    // 1. Guardar mensaje de contacto en PostgreSQL via Prisma
    let dbSuccess = false;

    try {
      await prisma.contactMessage.create({
        data: {
          nombre: cleanNombre,
          apellido: cleanApellido,
          email: cleanEmail,
          telefono: cleanTelefono,
          pais: cleanPais,
          motivo: cleanMotivo,
          mensaje: cleanMensaje,
        },
      });
      dbSuccess = true;
    } catch (err: unknown) {
      logServerError("[marketing/contact] DB error", err);
    }

    // 2. Enviar notificación por AWS SES
    let emailSuccess = false;

    try {
      await sendContactNotificationEmail({
        nombre: cleanNombre,
        apellido: cleanApellido,
        email: cleanEmail,
        telefono: cleanTelefono || undefined,
        pais: cleanPais || undefined,
        motivo: cleanMotivo,
        mensaje: cleanMensaje,
      });
      emailSuccess = true;
    } catch (err: unknown) {
      logServerError("[marketing/contact] SES error", err);
    }

    if (!dbSuccess && !emailSuccess) {
      return NextResponse.json(
        {
          error: "No pudimos procesar tu mensaje en este momento. Por favor intenta de nuevo más tarde o escríbenos directamente a info@luminuslatam.com.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      dbSaved: dbSuccess,
      emailSent: emailSuccess,
    });
  } catch (error: unknown) {
    return handleMarketingApiError(error, {
      context: "[marketing/contact] POST",
      error: "Ocurrió un error interno procesando tu solicitud.",
    });
  }
}
