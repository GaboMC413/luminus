import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json({ message: "No tienes permisos de administrador." }, { status: 403 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ message: "ID de correo requerido." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const emailLog = await prisma.sentEmailLog.findUnique({
      where: { id },
      select: {
        id: true,
        htmlBody: true,
      },
    });

    if (!emailLog) {
      return NextResponse.json({ message: "Correo no encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      id: emailLog.id,
      htmlBody: emailLog.htmlBody,
    });
  } catch (error) {
    console.error("[ADMIN_EMAIL_DETAIL_ERROR]", error);
    return NextResponse.json({ message: "Error al cargar el contenido del correo." }, { status: 500 });
  }
}
