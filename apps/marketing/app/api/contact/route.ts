import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendContactNotificationEmail } from "@/lib/ses";

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

    const cleanNombre = nombre.trim();
    const cleanApellido = apellido.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanTelefono = telefono ? telefono.trim() : null;
    const cleanPais = pais ? pais.trim() : null;
    const cleanMotivo = motivo.trim();
    const cleanMensaje = mensaje.trim();

    // 1. Guardar mensaje de contacto en PostgreSQL via Prisma
    let dbSuccess = false;
    let dbError = null;

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
    } catch (err: any) {
      console.error("[Database Contact Error]:", err.message || err);
      dbError = err.message || "Error al guardar mensaje en la base de datos.";
    }

    // 2. Enviar notificación por AWS SES
    let emailSuccess = false;
    let emailError = null;

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
    } catch (err: any) {
      console.error("[AWS SES Error] Error al enviar email de notificación:", err);
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
