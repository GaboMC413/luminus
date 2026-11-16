import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { sendContactNotificationEmail } from "@/lib/mails/sender";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "No estás autenticado." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { motivo, mensaje, responderA } = body;

    if (!motivo || !mensaje || !String(mensaje).trim()) {
      return NextResponse.json(
        { error: "Por favor selecciona un motivo y escribe tu mensaje." },
        { status: 400 }
      );
    }

    // Resolver datos del usuario autenticado desde la base de datos
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            fullName: true,
            phoneNumber: true,
            country: true,
          },
        },
      },
    });

    const cleanNombre =
      user?.profile?.firstName ||
      user?.profile?.fullName?.trim().split(" ")[0] ||
      "Usuario";

    const cleanApellido =
      user?.profile?.lastName ||
      (user?.profile?.fullName ? user.profile.fullName.trim().split(" ").slice(1).join(" ") : "") ||
      "LUMINUS";

    const cleanEmail = user?.email || session.email;

    // Si el usuario especificó un teléfono en responderA, usarlo preferentemente
    const customPhone =
      responderA?.tipo === "telefono" && responderA.valor && !responderA.valor.includes("@")
        ? responderA.valor
        : null;

    const cleanTelefono = customPhone || user?.profile?.phoneNumber || null;
    const cleanPais = user?.profile?.country || null;
    const cleanMotivo = String(motivo).trim();
    const cleanMensaje = String(mensaje).trim();

    const responderADisplay = responderA?.valor
      ? `${responderA.valor} (${responderA.tipo})`
      : cleanEmail;

    // 1. Guardar mensaje en la base de datos
    let savedMessage = null;
    try {
      savedMessage = await prisma.contactMessage.create({
        data: {
          nombre: cleanNombre,
          apellido: cleanApellido,
          email: cleanEmail,
          telefono: cleanTelefono,
          pais: cleanPais,
          motivo: cleanMotivo,
          mensaje: `${cleanMensaje}\n\n[Preferencia de respuesta: ${responderADisplay}]`,
        },
      });
    } catch (dbErr: any) {
      console.error("[api/contact] Database error:", dbErr);
    }

    // 2. Enviar email de notificación a los administradores
    let emailSent = false;
    try {
      await sendContactNotificationEmail({
        nombre: cleanNombre,
        apellido: cleanApellido,
        email: cleanEmail,
        telefono: cleanTelefono || undefined,
        pais: cleanPais || undefined,
        motivo: cleanMotivo,
        mensaje: cleanMensaje,
        responderA: responderADisplay,
      });
      emailSent = true;
    } catch (mailErr: any) {
      console.error("[api/contact] Email notification error:", mailErr);
    }

    if (!savedMessage && !emailSent) {
      return NextResponse.json(
        { error: "No pudimos enviar tu mensaje en este momento. Por favor intenta más tarde." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: savedMessage?.id || null,
      emailSent,
    });
  } catch (error: any) {
    console.error("[api/contact] Server error:", error);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado al procesar tu mensaje." },
      { status: 500 }
    );
  }
}
