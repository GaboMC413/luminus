import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID de inscripción requerido." },
        { status: 400 }
      );
    }

    await prisma.eventInscription.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Inscripción eliminada correctamente de la base de datos." });
  } catch (error: any) {
    console.error("[DELETE Event Inscription Error]:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar inscripción de la base de datos." },
      { status: 500 }
    );
  }
}
