import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { isUuid } from "@/utils/validation";
import { isRateLimited, RATE_LIMITS } from "@/utils/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const rateLimitResult = isRateLimited(
    session.userId,
    "GET_CONVERSATIONS",
    RATE_LIMITS.GET_CONVERSATIONS.limit,
    RATE_LIMITS.GET_CONVERSATIONS.windowMs
  );
  if (rateLimitResult.success) {
    return NextResponse.json({ message: "Demasiadas solicitudes. Intentalo de nuevo mas tarde." }, { status: 429 });
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
        messages: {
          some: {
            deletedAt: null,
          },
        },
      },
      include: conversationInclude,
      orderBy: {
        updatedAt: "desc",
      },
    });

    const activeConversations = conversations.filter((conversation: any) => {
      const participant = conversation.participants.find((p: any) => p.userId === session.userId);
      if (!participant) return false;
      if (participant.deletedAt === null) return true;
      const lastMessage = conversation.messages?.[0];
      if (!lastMessage) return false;
      return lastMessage.createdAt > participant.deletedAt;
    });

    return NextResponse.json({
      conversations: activeConversations.map((conversation: any) => serializeConversation(conversation, session.userId)),
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

  const rateLimitResult = isRateLimited(
    session.userId,
    "CREATE_CONVERSATION",
    RATE_LIMITS.CREATE_CONVERSATION.limit,
    RATE_LIMITS.CREATE_CONVERSATION.windowMs
  );
  if (rateLimitResult.success) {
    return NextResponse.json({ message: "Demasiadas solicitudes. Intentalo de nuevo mas tarde." }, { status: 429 });
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

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { tier: true, trialExpiresAt: true },
    });

    const isBasic = user && (user.tier === "BASIC" || (user.trialExpiresAt && user.trialExpiresAt > new Date()));

    if (!isBasic) {
      // FREE Tier Daily Limit: 1 new conversation per day in local time zone
      const offsetHeader = request.headers.get("x-timezone-offset");
      const offsetMinutes = offsetHeader ? parseInt(offsetHeader, 10) : 0;

      const now = new Date();
      // Adjust server time to client's local time
      const localTime = new Date(now.getTime() - offsetMinutes * 60 * 1000);
      localTime.setUTCHours(0, 0, 0, 0);
      // Convert start of local day back to UTC
      const startOfLocalDayInUtc = new Date(localTime.getTime() + offsetMinutes * 60 * 1000);

      const dailyCount = await prisma.conversation.count({
        where: {
          initiatorId: session.userId,
          createdAt: {
            gte: startOfLocalDayInUtc,
          },
        },
      });

      if (dailyCount >= 1) {
        return NextResponse.json(
          { message: "Ya has iniciado una conversación hoy. Para conectar con más personas, sube de nivel tu plan." },
          { status: 403 }
        );
      }
    } else {
      // BASIC Tier Hourly Limit: 10 new conversations per rolling hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const hourlyCount = await prisma.conversation.count({
        where: {
          initiatorId: session.userId,
          createdAt: {
            gte: oneHourAgo,
          },
        },
      });

      if (hourlyCount >= 10) {
        const oldestInWindow = await prisma.conversation.findFirst({
          where: {
            initiatorId: session.userId,
            createdAt: {
              gte: oneHourAgo,
            },
          },
          orderBy: {
            createdAt: "asc" as const,
          },
          select: {
            createdAt: true,
          },
        });

        const resetTime = oldestInWindow
          ? new Date(oldestInWindow.createdAt.getTime() + 60 * 60 * 1000)
          : new Date(Date.now() + 60 * 60 * 1000);

        const minutesRemaining = Math.max(Math.ceil((resetTime.getTime() - Date.now()) / 60000), 1);
        return NextResponse.json(
          { message: `Has alcanzado el máximo de conexiones permitido por la plataforma. Podrás volver a contactar en ${minutesRemaining} minutos.` },
          { status: 403 }
        );
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        initiatorId: session.userId,
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
