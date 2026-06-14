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
    // Sync the profile name and avatar image if the user already exists in DB
    await prisma.userProfile.update({
      where: { userId: systemUser.id },
      data: {
        fullName: "LUMINUS",
        firstName: "LUMINUS",
        lastName: "",
        avatarUrl: "/Profile Image LUMINUS.png",
      },
    });
  }

  // 2. Draft the welcome message content
  const welcomeText = `¡Te damos la bienvenida a *LUMINUS*! 🌱

Nos hace muy felices acompañarte en este camino hacia una vida con mayor bienestar y propósito. ✨

Luminus es tu espacio para explorar, aprender y conectar. Te compartimos algunas de las herramientas que tienes a tu alcance para comenzar hoy:

👥 *Comunidad*: Encuentra y conecta con personas afines que comparten tus inquietudes, valores e intereses.
👉 [Ver Comunidad](https://luminus.lat/comunidad)

🩺 *Especialistas*: Accede a profesionales de bienestar capacitados para acompañarte en tu proceso de forma ética.
👉 [Ver Especialistas](https://luminus.lat/especialistas)

🧭 *Espacios*: Explora grupos de discusión, lecturas recomendadas y actividades diseñadas para tu crecimiento.
👉 [Ver Espacios](https://luminus.lat/espacios)

🗺️ *Mapa*: Ubica de forma interactiva recursos, actividades y profesionales de bienestar cerca de ti.
👉 [Ver Mapa](https://luminus.lat/mapa)

💡 *Faro*: Encuentra guías claras y herramientas valiosas sobre salud mental y desarrollo personal.
👉 [Ver Faro](https://luminus.lat/faro)

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
