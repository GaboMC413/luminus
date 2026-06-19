import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isUuid(value: unknown) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function serializeConversation(conversation: any, currentUserId: string) {
  const otherParticipant = conversation.participants.find((participant: any) => participant.userId !== currentUserId);
  const otherUser = otherParticipant?.user;
  const profile = otherUser?.profile ?? {};
  const fullName = profile.fullName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  const lastMessage = conversation.messages?.[0];

  const currentParticipant = conversation.participants.find((p: any) => p.userId === currentUserId);
  const isUnread = lastMessage && lastMessage.senderId !== currentUserId
    ? (!currentParticipant?.lastReadAt || lastMessage.createdAt > currentParticipant.lastReadAt)
    : false;

  return {
    id: conversation.id,
    participant: {
      id: otherUser?.id ?? "",
      name: fullName || otherUser?.email || "Usuario",
      avatar_url: profile.avatarUrl || "",
    },
    last_message: lastMessage
      ? {
          id: lastMessage.id,
          body: lastMessage.body,
          sender_id: lastMessage.senderId,
          created_at: lastMessage.createdAt.toISOString(),
        }
      : null,
    is_unread: isUnread,
    updated_at: conversation.updatedAt.toISOString(),
  };
}

const conversationInclude = {
  participants: {
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  },
  messages: {
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc" as const,
    },
    take: 1,
  },
};

export async function GET() {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.userId,
          },
        },
      },
      include: conversationInclude,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      conversations: conversations.map((conversation: any) => serializeConversation(conversation, session.userId)),
    });
  } catch (error) {
    console.error("Failed to fetch conversations.", error);
    return NextResponse.json({ message: "No se pudieron cargar los mensajes." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const recipientId = body?.recipientId;

  if (!isUuid(recipientId)) {
    return NextResponse.json({ message: "Usuario destino invalido." }, { status: 400 });
  }

  if (recipientId === session.userId) {
    return NextResponse.json({ message: "No puedes enviarte mensajes a ti mismo." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true },
    });

    if (!recipient) {
      return NextResponse.json({ message: "Usuario destino no encontrado." }, { status: 404 });
    }

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId: session.userId,
              },
            },
          },
          {
            participants: {
              some: {
                userId: recipientId,
              },
            },
          },
        ],
      },
      include: conversationInclude,
    });

    if (existingConversation) {
      return NextResponse.json({
        conversation: serializeConversation(existingConversation, session.userId),
      });
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: session.userId },
            { userId: recipientId },
          ],
        },
      },
      include: conversationInclude,
    });

    return NextResponse.json({
      conversation: serializeConversation(conversation, session.userId),
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create conversation.", error);
    return NextResponse.json({ message: "No se pudo iniciar la conversacion." }, { status: 500 });
  }
}
