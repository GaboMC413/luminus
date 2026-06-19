import { prisma } from "./db";

export interface Quest {
  id: string;
  label: string;
  completed: boolean;
  actionUrl: string;
  icon: string;
}

const QUEST_CONFIG: Record<string, { label: string; actionUrl: string; icon: string }> = {
  profession: {
    label: "Indica tu profesión",
    actionUrl: "/perfil-usuario?edit=personal",
    icon: "work",
  },
  bio: {
    label: "Escribe tu biografía",
    actionUrl: "/perfil-usuario?edit=bio",
    icon: "article_person",
  },
  interests: {
    label: "Comparte tus reflexiones",
    actionUrl: "/perfil-usuario?edit=prompts",
    icon: "format_quote",
  },
  cover: {
    label: "Personaliza tu foto de portada",
    actionUrl: "/perfil-usuario?edit=cover",
    icon: "photo_prints",
  },
  connect: {
    label: "Envía una solicitud de conexión",
    actionUrl: "/comunidad",
    icon: "person_add",
  },
};

const CELEBRATION_COPY: Record<string, { title: string; body: string; actionUrl: string }> = {
  profession: {
    title: "Has indicado tu profesión",
    body: "Definir tu profesión ayuda a que otros miembros conozcan tu experiencia y campo de especialidad. Es el punto de partida ideal para compartir conocimientos y entablar colaboraciones en la comunidad.",
    actionUrl: "/perfil-usuario",
  },
  bio: {
    title: "Has escrito tu biografía",
    body: "Tu biografía es tu voz en LUMINUS. Al contar quién eres, qué te apasiona y qué buscas, creas puentes de afinidad genuina para que otras personas inicien conversaciones significativas contigo.",
    actionUrl: "/perfil-usuario",
  },
  interests: {
    title: "Has compartido tus reflexiones",
    body: "Compartir tus reflexiones y valores ayuda a alinear tu energía con la de otros miembros. Permite que la comunidad conozca en qué crees y cómo pueden apoyarse mutuamente en su crecimiento.",
    actionUrl: "/perfil-usuario",
  },
  cover: {
    title: "Has personalizado tu foto de portada",
    body: "Personalizar tu portada define el ambiente y la energía de tu perfil. Un espacio visualmente acogedor y propio hace que tu presencia en LUMINUS se sienta verdaderamente tuya y acogedora.",
    actionUrl: "/perfil-usuario",
  },
  connect: {
    title: "Has enviado tu primera solicitud",
    body: "¡Has dado el primer paso para construir tu red! En LUMINUS, cada conexión fortalece nuestra red de apoyo. Conectar te permite intercambiar perspectivas, compartir bienestar y no caminar solo.",
    actionUrl: "/comunidad",
  },
};

export async function getOnboardingQuests(userId: string): Promise<{ quests: Quest[]; progressPercentage: number }> {
  // Fetch user data with relations needed for quest checks
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      profilePrompts: true,
      sentConnections: { take: 1 },
      receivedConnections: { take: 1 },
    },
  });

  if (!user) {
    return { quests: [], progressPercentage: 0 };
  }

  const profile = user.profile;

  // Determine completion states
  const states: Record<string, boolean> = {
    profession: !!(profile?.profession && profile.profession.trim() !== ""),
    bio: !!(profile?.bio && profile.bio.trim() !== ""),
    interests: user.profilePrompts.length > 0,
    cover: !!(profile?.coverUrl && profile.coverUrl.trim() !== ""),
    connect: user.sentConnections.length > 0 || user.receivedConnections.length > 0,
  };

  const quests: Quest[] = Object.keys(QUEST_CONFIG).map((id) => ({
    id,
    label: QUEST_CONFIG[id].label,
    completed: states[id] || false,
    actionUrl: QUEST_CONFIG[id].actionUrl,
    icon: QUEST_CONFIG[id].icon,
  }));

  const completedCount = quests.filter((q) => q.completed).length;
  const progressPercentage = Math.round((completedCount / quests.length) * 100);

  return { quests, progressPercentage };
}

export interface NewlyCompletedQuest {
  id: string;
  title: string;
  body: string;
}

export async function checkAndTriggerQuestCompletion(
  userId: string,
  questId: string
): Promise<NewlyCompletedQuest | null> {
  if (!QUEST_CONFIG[questId]) return null;

  // 1. Check if quest condition is met currently
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      profilePrompts: true,
      sentConnections: { take: 1 },
      receivedConnections: { take: 1 },
    },
  });

  if (!user) return null;

  const profile = user.profile;
  let isCompleted = false;

  switch (questId) {
    case "profession":
      isCompleted = !!(profile?.profession && profile.profession.trim() !== "");
      break;
    case "bio":
      isCompleted = !!(profile?.bio && profile.bio.trim() !== "");
      break;
    case "interests":
      isCompleted = user.profilePrompts.length > 0;
      break;
    case "cover":
      isCompleted = !!(profile?.coverUrl && profile.coverUrl.trim() !== "");
      break;
    case "connect":
      isCompleted = user.sentConnections.length > 0 || user.receivedConnections.length > 0;
      break;
  }

  if (!isCompleted) return null;

  // 2. Check if a celebration notification already exists
  const typeKey = `quest_completed_${questId}`;
  const existingNotification = await prisma.notification.findFirst({
    where: {
      userId,
      type: typeKey,
    },
  });

  if (existingNotification) return null;

  // 3. Create celebration notification
  const copy = CELEBRATION_COPY[questId];
  await prisma.notification.create({
    data: {
      userId,
      type: typeKey,
      title: copy.title,
      body: copy.body,
      actionUrl: copy.actionUrl,
      actorName: "LUMINUS",
      actorAvatarUrl: "/iso-logo-black.svg", // Using the official logo avatar
      readAt: new Date(),
    },
  });

  return {
    id: questId,
    title: copy.title,
    body: copy.body,
  };
}
