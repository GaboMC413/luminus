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

  // 2. Draft the welcome message content
  const welcomeText = `¡Te damos la bienvenida a *LUMINUS*! 🌱

Nos alegra acompañarte en este camino hacia una vida con mayor bienestar y propósito. ✨

Luminus es tu red para explorar, aprender y conectar. Te compartimos lo que puedes comenzar a explorar hoy y lo que sumaremos muy pronto:

👥 *Comunidad*: Conecta con personas que comparten inquietudes e intereses similares.
👉 [Ver Comunidad](/comunidad)

🩺 *Especialistas*: Descubre una red de profesionales calificados de distintas áreas del bienestar.
👉 [Ver Especialistas](/especialistas)

✨ *Próximamente en LUMINUS:*

🧭 *Espacios* *(Próximamente)*: Encuentra consultorios, clínicas y otros espacios de bienestar cerca de ti.
👉 [Conocer Espacios](/espacios)

💬 *Grupos* *(Próximamente)*: Forma parte de conversaciones alrededor de temas que te interesan.
👉 [Conocer Grupos](/grupos)

💡 *Faro AI* *(Próximamente)*: Orientación personalizada para descubrir el acompañamiento adecuado.
👉 [Conocer Faro](/faro)

Si necesitas ayuda o tienes alguna pregunta sobre la plataforma, no dudes en responder directamente en este chat. ¡Tu viaje comienza ahora! 🚀`;

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
