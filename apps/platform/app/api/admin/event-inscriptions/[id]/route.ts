import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { isUuid } from "@/utils/validation";

export const runtime = "nodejs";

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 });
  }

  const params = await props.params;
  try {
    const { id } = params;

    if (!id || !isUuid(id)) {
      return NextResponse.json(
        { error: "ID de inscripción inválido o requerido." },
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
      { error: "Error al eliminar inscripción de la base de datos." },
      { status: 500 }
    );
  }
}
