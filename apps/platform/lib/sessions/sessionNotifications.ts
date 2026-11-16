export async function sendSessionChatMessage({
  prisma,
  senderId,
  recipientId,
  body,
}: {
  prisma: any;
  senderId: string;
  recipientId: string;
  body: string;
}) {
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: senderId } } },
        { participants: { some: { userId: recipientId } } },
      ],
    },
    select: { id: true },
  });

  const conversationId = existingConversation
    ? existingConversation.id
    : (
        await prisma.conversation.create({
          data: {
            initiatorId: senderId,
            participants: {
              create: [{ userId: senderId }, { userId: recipientId }],
            },
          },
          select: { id: true },
        })
      ).id;

  const now = new Date();

  await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId,
        body,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: now },
    }),
    prisma.conversationParticipant.updateMany({
      where: { conversationId },
      data: { deletedAt: null },
    }),
  ]);

  return conversationId;
}

export async function createSessionNotification({
  prisma,
  userId,
  type,
  title,
  actorName,
  actorAvatarUrl,
  body,
  actionUrl,
}: {
  prisma: any;
  userId: string;
  type:
    | "session_requested"
    | "session_accepted"
    | "session_declined"
    | "session_cancelled"
    | "session_guidance";
  title: string;
  actorName: string;
  actorAvatarUrl: string;
  body: string;
  actionUrl: string;
}) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      actorName,
      actorAvatarUrl: actorAvatarUrl || null,
      body,
      actionUrl,
    },
  });
}
