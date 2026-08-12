import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { isUuid } from "@/utils/validation";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const VALID_REASONS = [
  "Comportamiento abusivo o acoso",
  "Spam o contenido comercial no deseado",
  "Contenido inapropiado u ofensivo",
  "Suplantación de identidad",
  "Otro",
];

export async function POST(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const reportedId = typeof body?.reportedId === "string" ? body.reportedId.trim() : "";
    const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : "";

    if (!reportedId || !isUuid(reportedId)) {
      return NextResponse.json({ message: "Usuario reportado no válido." }, { status: 400 });
    }

    if (reportedId === session.userId) {
      return NextResponse.json({ message: "No puedes reportarte a ti mismo." }, { status: 400 });
    }

    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json({ message: "Motivo del reporte no válido." }, { status: 400 });
    }


    // Check if the reported user exists
    const reportedUser = await prisma.user.findUnique({
      where: { id: reportedId },
      select: { id: true },
    });

    if (!reportedUser) {
      return NextResponse.json({ message: "Usuario reportado no encontrado." }, { status: 404 });
    }

    const report = await prisma.userReport.create({
      data: {
        reporterId: session.userId,
        reportedId,
        reason,
        description: description || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Usuario reportado con éxito.",
      report: {
        id: report.id,
        createdAt: report.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to submit user report.", error);
    return NextResponse.json({ message: "No se pudo enviar el reporte." }, { status: 500 });
  }
}
