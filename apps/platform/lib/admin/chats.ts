import type { PrismaClient } from "@prisma/client";

function toDate(value: Date | null) {
  return value ? value.toISOString() : null;
}

export function serializeAdminChat(conversation: any) {
  const p1 = conversation.participants[0]?.user;
  const p2 = conversation.participants[1]?.user;

  const user1 = p1 ? {
    id: p1.id,
    email: p1.email,
    name: p1.profile?.fullName || `${p1.profile?.firstName || ""} ${p1.profile?.lastName || ""}`.trim() || p1.email || "Usuario",
    avatarUrl: p1.profile?.avatarUrl || "",
  } : null;

  const user2 = p2 ? {
    id: p2.id,
    email: p2.email,
    name: p2.profile?.fullName || `${p2.profile?.firstName || ""} ${p2.profile?.lastName || ""}`.trim() || p2.email || "Usuario",
    avatarUrl: p2.profile?.avatarUrl || "",
  } : null;

  const lastMessage = conversation.messages?.[0];

  return {
    id: conversation.id,
    createdAt: toDate(conversation.createdAt),
    updatedAt: toDate(conversation.updatedAt),
    user1,
    user2,
    lastMessage: lastMessage ? {
      body: lastMessage.body,
      createdAt: toDate(lastMessage.createdAt),
    } : null,
    messagesCount: conversation.messages?.length || 0,
    messages: (conversation.messages || [])
      .map((msg: any) => ({
        id: msg.id,
        body: msg.body,
        senderId: msg.senderId,
        createdAt: toDate(msg.createdAt),
      }))
      .reverse(), // chronologically ascending order (oldest first)
  };
}

export async function listAdminChats(prisma: PrismaClient) {
  const conversations = await prisma.conversation.findMany({
    include: {
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
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 100,
  });

  return conversations.map(serializeAdminChat);
}
