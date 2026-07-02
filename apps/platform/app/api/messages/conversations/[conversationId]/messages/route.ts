import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { isUuid } from "@/utils/validation";
import { sanitizeMessageBody } from "@/utils/sanitization";
import { isRateLimited, RATE_LIMITS } from "@/utils/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      deletedAt: true,
    },
  });
}

export async function GET(request: Request, { params }: { params: { conversationId: string } }) {
  const session = getCurrentSession();
  const { conversationId } = params;

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const rateLimitResult = isRateLimited(
    session.userId,
    "GET_MESSAGES",
    RATE_LIMITS.GET_MESSAGES.limit,
    RATE_LIMITS.GET_MESSAGES.windowMs
  );
  if (rateLimitResult.success) {
    return NextResponse.json({ message: "Demasiadas solicitudes. Intentalo de nuevo mas tarde." }, { status: 429 });
  }

  if (!isUuid(conversationId)) {
    return NextResponse.json({ message: "Conversacion invalida." }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") || undefined;
  const limitParam = parseInt(searchParams.get("limit") || "50", 10);
  const limit = Math.min(Math.max(limitParam, 1), 100);

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
        createdAt: participant.deletedAt ? { gt: participant.deletedAt } : undefined,
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: {
        createdAt: "desc" as const,
      },
    });

    const hasMore = messages.length > limit;
    const paginatedMessages = hasMore ? messages.slice(0, limit) : messages;

    // Reverse to return ascending order for client
    const sortedMessages = [...paginatedMessages].reverse();
    const nextCursor = hasMore ? paginatedMessages[paginatedMessages.length - 1].id : null;

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
        userId: true,
        lastReadAt: true,
      },
    });

    let connectionInfo = null;
    if (otherParticipant) {
      const connection = await prisma.userConnection.findFirst({
        where: {
          OR: [
            { requesterId: session.userId, recipientId: otherParticipant.userId },
            { requesterId: otherParticipant.userId, recipientId: session.userId },
          ],
        },
        select: {
          id: true,
          status: true,
          requesterId: true,
          recipientId: true,
        },
      });

      if (connection) {
        connectionInfo = {
          id: connection.id,
          status: connection.status,
          requesterId: connection.requesterId,
          recipientId: connection.recipientId,
        };
      }
    }

    return NextResponse.json({
      messages: sortedMessages.map(serializeMessage),
      nextCursor,
      hasMore,
      otherLastReadAt: otherParticipant?.lastReadAt ? otherParticipant.lastReadAt.toISOString() : null,
      connection: connectionInfo,
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

  const rateLimitResult = isRateLimited(
    session.userId,
    "SEND_MESSAGE",
    RATE_LIMITS.SEND_MESSAGE.limit,
    RATE_LIMITS.SEND_MESSAGE.windowMs
  );
  if (rateLimitResult.success) {
    return NextResponse.json({ message: "Demasiadas solicitudes. Intentalo de nuevo mas tarde." }, { status: 429 });
  }

  if (!isUuid(conversationId)) {
    return NextResponse.json({ message: "Conversacion invalida." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const rawMessageBody = typeof body?.body === "string" ? body.body : "";
  const messageBody = sanitizeMessageBody(rawMessageBody);

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

      await tx.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId: session.userId,
          },
        },
        data: {
          deletedAt: null,
        },
      });

      // Manage UserConnection status automatically on message send
      const otherPart = await tx.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId: {
            not: session.userId,
          },
        },
        select: {
          userId: true,
        },
      });

      if (otherPart) {
        const recipientId = otherPart.userId;
        const existingConnection = await tx.userConnection.findFirst({
          where: {
            OR: [
              { requesterId: session.userId, recipientId },
              { requesterId: recipientId, recipientId: session.userId },
            ],
          },
        });

        if (!existingConnection) {
          // Implicit request creation
          await tx.userConnection.create({
            data: {
              requesterId: session.userId,
              recipientId,
              status: "pending",
            },
          });

          // Create notification
          try {
            const senderProfile = await tx.userProfile.findUnique({
              where: { userId: session.userId },
              select: { fullName: true, firstName: true, lastName: true, avatarUrl: true },
            });
            const senderName = senderProfile?.fullName || `${senderProfile?.firstName || ""} ${senderProfile?.lastName || ""}`.trim() || "Un usuario";
            const senderAvatar = senderProfile?.avatarUrl || "";

            await tx.notification.create({
              data: {
                userId: recipientId,
                type: "connection_request",
                title: "Nueva solicitud",
                actorName: senderName,
                actorAvatarUrl: senderAvatar,
                body: "quiere agregarte a su red.",
                actionUrl: `/comunidad/public-profile?id=${session.userId}`,
              },
            });
          } catch (e) {
            console.error("Notification creation failed on implicit connect request:", e);
          }
        } else if (existingConnection.status === "declined") {
          // Reset declined back to pending
          await tx.userConnection.update({
            where: { id: existingConnection.id },
            data: {
              requesterId: session.userId,
              recipientId,
              status: "pending",
              updatedAt: new Date(),
            },
          });

          // Re-create notification
          try {
            const senderProfile = await tx.userProfile.findUnique({
              where: { userId: session.userId },
              select: { fullName: true, firstName: true, lastName: true, avatarUrl: true },
            });
            const senderName = senderProfile?.fullName || `${senderProfile?.firstName || ""} ${senderProfile?.lastName || ""}`.trim() || "Un usuario";
            const senderAvatar = senderProfile?.avatarUrl || "";

            await tx.notification.create({
              data: {
                userId: recipientId,
                type: "connection_request",
                title: "Nueva solicitud",
                actorName: senderName,
                actorAvatarUrl: senderAvatar,
                body: "quiere agregarte a su red.",
                actionUrl: `/comunidad/public-profile?id=${session.userId}`,
              },
            });
          } catch (e) {
            console.error("Notification creation failed on declined restart:", e);
          }
        } else if (existingConnection.status === "pending" && existingConnection.requesterId === recipientId) {
          // Implicit connection accept since receiver replied
          await tx.userConnection.update({
            where: { id: existingConnection.id },
            data: { status: "accepted" },
          });

          // Create notification
          try {
            const senderProfile = await tx.userProfile.findUnique({
              where: { userId: session.userId },
              select: { fullName: true, firstName: true, lastName: true, avatarUrl: true },
            });
            const senderName = senderProfile?.fullName || `${senderProfile?.firstName || ""} ${senderProfile?.lastName || ""}`.trim() || "Un usuario";
            const senderAvatar = senderProfile?.avatarUrl || "";

            await tx.notification.create({
              data: {
                userId: recipientId,
                type: "connection_accepted",
                title: "Solicitud aceptada",
                actorName: senderName,
                actorAvatarUrl: senderAvatar,
                body: "aceptó tu solicitud de conexión.",
                actionUrl: `/comunidad/public-profile?id=${session.userId}`,
              },
            });
          } catch (e) {
            console.error("Notification creation failed on implicit connect accept:", e);
          }
        }
      }

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
