import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { isUuid } from "@/utils/validation";
import { isRateLimited, RATE_LIMITS } from "@/utils/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _: Request,
  { params }: { params: { conversationId: string } }
) {
  const session = getCurrentSession();
  const { conversationId } = params;

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const rateLimitResult = isRateLimited(
    session.userId,
    "DELETE_CONVERSATION",
    RATE_LIMITS.DELETE_CONVERSATION.limit,
    RATE_LIMITS.DELETE_CONVERSATION.windowMs
  );
  if (rateLimitResult.success) {
    return NextResponse.json({ message: "Demasiadas solicitudes. Intentalo de nuevo mas tarde." }, { status: 429 });
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

    // Soft delete for the current user by updating their participant deletedAt timestamp
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.userId,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Conversacion eliminada exitosamente." });
  } catch (error) {
    console.error("Failed to delete conversation.", error);
    return NextResponse.json({ message: "No se pudo eliminar la conversacion." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
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
    const body = await request.json().catch(() => null);
    const action = typeof body?.action === "string" ? body.action.trim() : "";

    if (action !== "mute" && action !== "unmute") {
      return NextResponse.json({ message: "Acción no soportada." }, { status: 400 });
    }

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

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.userId,
        },
      },
      data: {
        isMuted: action === "mute",
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: action === "mute" ? "Conversación silenciada." : "Conversación reactivada.",
      isMuted: action === "mute"
    });
  } catch (error) {
    console.error("Failed to update conversation mute status.", error);
    return NextResponse.json({ message: "No se pudo silenciar la conversacion." }, { status: 500 });
  }
}
