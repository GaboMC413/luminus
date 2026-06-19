import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isUuid(value: unknown) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function DELETE(
  _: Request,
  { params }: { params: { conversationId: string } }
) {
  const session = getCurrentSession();
  const { conversationId } = params;

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  if (!isUuid(conversationId)) {
    return NextResponse.json({ message: "Conversacion invalida." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    
    // Check if the user is a participant of the conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.userId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ message: "Conversacion no encontrada." }, { status: 404 });
    }

    // Delete the conversation (this will cascade delete all messages and participants)
    await prisma.conversation.delete({
      where: {
        id: conversationId,
      },
    });

    return NextResponse.json({ message: "Conversacion eliminada exitosamente." });
  } catch (error) {
    console.error("Failed to delete conversation.", error);
    return NextResponse.json({ message: "No se pudo eliminar la conversacion." }, { status: 500 });
  }
}
