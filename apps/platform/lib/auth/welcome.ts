import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

export async function sendWelcomeMessage(prisma: PrismaClient, newUserId: string) {
  const SYSTEM_EMAIL = "info@luminuslatam.com";

  // 1. Find or create the official LUMINUS system account
  let systemUser = await prisma.user.findUnique({
    where: { email: SYSTEM_EMAIL },
  });

  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: SYSTEM_EMAIL,
        cognitoSub: `system:${randomUUID()}`,
        authProvider: "email",
        role: "ADMIN",
        profile: {
          create: {
            fullName: "LUMINUS",
            firstName: "LUMINUS",
            lastName: "",
            avatarUrl: "/Profile Image LUMINUS.png",
            bio: "Cuenta oficial de bienvenida y soporte de LUMINUS.",
          },
        },
      },
    });
  } else {
    // Sync the profile name and avatar image if the user already exists in DB safely using upsert
    await prisma.userProfile.upsert({
      where: { userId: systemUser.id },
      create: {
        userId: systemUser.id,
        fullName: "LUMINUS",
        firstName: "LUMINUS",
        lastName: "",
        avatarUrl: "/Profile Image LUMINUS.png",
        bio: "Cuenta oficial de bienvenida y soporte de LUMINUS.",
      },
      update: {
        fullName: "LUMINUS",
        firstName: "LUMINUS",
        lastName: "",
        avatarUrl: "/Profile Image LUMINUS.png",
      },
    });
  }

  // 2. Check if a conversation between the system account and the user already exists
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: systemUser.id } } },
        { participants: { some: { userId: newUserId } } },
      ],
    },
  });

  if (existingConversation) {
    return;
  }

  // 3. Draft the welcome message content
  const welcomeText = `¡Te damos la bienvenida a *LUMINUS*! 🌱

Nos alegra tenerte aquí. En la plataforma ya puedes:

🏠 *Inicio*: Compartir y conectar con la comunidad → [Ir a Inicio](/inicio)
🩺 *Especialistas*: Descubrir profesionales del bienestar → [Ver Especialistas](/especialistas)
📅 *Actividades*: Sumarte a charlas y talleres en vivo → [Ver Actividades](/actividades)
🎥 *Grabaciones*: Ver entrevistas y encuentros anteriores → [Ver Grabaciones](/grabaciones)

Si tienes alguna duda, responde directamente por este chat. ✨`;

  // 3. Create the conversation and welcome message in a transaction
  await prisma.$transaction(async (tx) => {
    // Create conversation
    const conversation = await tx.conversation.create({
      data: {
        participants: {
          create: [
            { userId: systemUser.id },
            { userId: newUserId },
          ],
        },
      },
    });

    // Create message
    await tx.message.create({
      data: {
        conversationId: conversation.id,
        senderId: systemUser.id,
        body: welcomeText,
      },
    });
  });
}
