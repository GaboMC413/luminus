import fs from "fs";
import path from "path";

// Load .env.local if present
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const parts = trimmed.split("=");
      const key = parts[0]?.trim();
      const val = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "");
      if (key && val && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

import { prisma } from "../lib/db";

async function main() {
  console.log("🔍 Buscando conversaciones de bienvenida...");

  const SYSTEM_EMAIL = "info@luminuslatam.com";
  const systemUser = await prisma.user.findUnique({
    where: { email: SYSTEM_EMAIL },
  });

  if (!systemUser) {
    console.log(`ℹ️ No se encontró usuario del sistema (${SYSTEM_EMAIL}).`);
    return;
  }

  // Find all conversations where systemUser is a participant
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId: systemUser.id },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, email: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`📋 Total de conversaciones del sistema: ${conversations.length}`);

  // 1. Clean up orphan conversations (conversations where systemUser is the ONLY participant)
  let orphansRemoved = 0;
  for (const conv of conversations) {
    const realParticipants = conv.participants.filter((p) => p.userId !== systemUser.id && p.user !== null);
    if (realParticipants.length === 0) {
      await prisma.message.deleteMany({ where: { conversationId: conv.id } });
      await prisma.conversationParticipant.deleteMany({ where: { conversationId: conv.id } });
      await prisma.conversation.delete({ where: { id: conv.id } });
      orphansRemoved++;
    }
  }
  if (orphansRemoved > 0) {
    console.log(`🧹 Se eliminaron ${orphansRemoved} conversaciones huérfanas sin destinatario.`);
  }

  // 2. Group active conversations by recipient userId
  const remainingConversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId: systemUser.id },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, email: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const userMap = new Map<string, typeof remainingConversations>();

  for (const conv of remainingConversations) {
    const otherParticipant = conv.participants.find((p: any) => p.userId !== systemUser.id);
    if (!otherParticipant) continue;

    const otherUserId = otherParticipant.userId;
    if (!userMap.has(otherUserId)) {
      userMap.set(otherUserId, []);
    }
    userMap.get(otherUserId)!.push(conv);
  }

  let duplicatesRemoved = 0;

  for (const [userId, convs] of Array.from(userMap.entries())) {
    if (convs.length <= 1) continue;

    const userEmail = convs[0].participants.find((p: any) => p.userId === userId)?.user?.email || userId;
    console.log(`⚠️ Usuario ${userEmail} tiene ${convs.length} conversaciones con el sistema.`);

    // Conservamos la primera conversación
    const primaryConv = convs[0];
    const duplicateConvs = convs.slice(1);

    for (const dup of duplicateConvs) {
      // Si el usuario envió mensajes en la conversación duplicada, migrarlos a la principal
      const userMessages = dup.messages.filter((m: any) => m.senderId !== systemUser.id);
      if (userMessages.length > 0) {
        console.log(`  ↪ Migrando ${userMessages.length} mensaje(s) de usuario a la conversación principal.`);
        await prisma.message.updateMany({
          where: {
            conversationId: dup.id,
            senderId: { not: systemUser.id },
          },
          data: {
            conversationId: primaryConv.id,
          },
        });
      }

      // Eliminar mensajes restantes en la duplicada
      await prisma.message.deleteMany({
        where: { conversationId: dup.id },
      });

      // Eliminar participantes de la duplicada
      await prisma.conversationParticipant.deleteMany({
        where: { conversationId: dup.id },
      });

      // Eliminar la conversación duplicada
      await prisma.conversation.delete({
        where: { id: dup.id },
      });

      duplicatesRemoved++;
      console.log(`  ✅ Conversación duplicada ${dup.id} eliminada.`);
    }
  }

  console.log(`\n🎉 Limpieza finalizada. Total de duplicadas eliminadas: ${duplicatesRemoved}`);
}

main()
  .catch((err) => {
    console.error("❌ Error ejecutando script:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
