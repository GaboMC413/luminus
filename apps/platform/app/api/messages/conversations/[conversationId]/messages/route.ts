import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isUuid(value: unknown) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function serializeMessage(message: any) {
  return {
    id: message.id,
    conversation_id: message.conversationId,
    sender_id: message.senderId,
    body: message.body,
    created_at: message.createdAt.toISOString(),
  };
}

async function assertParticipant(prisma: any, conversationId: string, userId: string) {
  return prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
    select: {
      conversationId: true,
    },
  });
}

export async function GET(_: Request, { params }: { params: { conversationId: string } }) {
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
    const participant = await assertParticipant(prisma, conversationId, session.userId);

    if (!participant) {
      return NextResponse.json({ message: "Conversacion no encontrada." }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.userId,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    const otherParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: {
          not: session.userId,
        },
      },
      select: {
        lastReadAt: true,
      },
    });

    return NextResponse.json({
      messages: messages.map(serializeMessage),
      otherLastReadAt: otherParticipant?.lastReadAt ? otherParticipant.lastReadAt.toISOString() : null,
    });
  } catch (error) {
    console.error("Failed to fetch messages.", error);
    return NextResponse.json({ message: "No se pudieron cargar los mensajes." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { conversationId: string } }) {
  const session = getCurrentSession();
  const { conversationId } = params;

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  if (!isUuid(conversationId)) {
    return NextResponse.json({ message: "Conversacion invalida." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const messageBody = typeof body?.body === "string" ? body.body.trim() : "";

  if (!messageBody) {
    return NextResponse.json({ message: "El mensaje no puede estar vacio." }, { status: 400 });
  }

  if (messageBody.length > 2000) {
    return NextResponse.json({ message: "El mensaje es demasiado largo." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const participant = await assertParticipant(prisma, conversationId, session.userId);

    if (!participant) {
      return NextResponse.json({ message: "Conversacion no encontrada." }, { status: 404 });
    }

    const message = await prisma.$transaction(async (tx: any) => {
      const created = await tx.message.create({
        data: {
          conversationId,
          senderId: session.userId,
          body: messageBody,
        },
      });

      await tx.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      return created;
    });

    return NextResponse.json({
      message: serializeMessage(message),
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to send message.", error);
    return NextResponse.json({ message: "No se pudo enviar el mensaje." }, { status: 500 });
  }
}
