import { prisma } from "@/lib/db";

export interface Quest {
  id: string;
  label: string;
  completed: boolean;
  actionUrl: string;
  icon: string;
}

export const QUEST_CONFIG: Record<string, { label: string; actionUrl: string; icon: string }> = {
  profession: {
    label: "Indica tu profesión",
    actionUrl: "/perfil-usuario?edit=profession",
    icon: "work",
  },
  bio: {
    label: "Escribe tu biografía",
    actionUrl: "/perfil-usuario?edit=bio",
    icon: "article_person",
  },
  interests: {
    label: "Comparte tus reflexiones",
    actionUrl: "/perfil-usuario?edit=interests",
    icon: "format_quote",
  },
  user_interests: {
    label: "Selecciona tus temas de interés",
    actionUrl: "/perfil-usuario?edit=user_interests",
    icon: "interests",
  },
  cover: {
    label: "Personaliza tu foto de portada",
    actionUrl: "/perfil-usuario?edit=cover",
    icon: "photo_prints",
  },
  connect: {
    label: "Envía una solicitud de conexión",
    actionUrl: "/inicio/miembros",
    icon: "person_add",
  },
};

const CELEBRATION_COPY: Record<string, { title: string; body: string; actionUrl: string }> = {
  profession: {
    title: "Has indicado tu profesión",
    body: "Tu experiencia y campo de especialidad ahora son visibles para la red.",
    actionUrl: "/perfil-usuario",
  },
  bio: {
    title: "Has escrito tu biografía",
    body: "Tu voz y presentación ayudan a que otros miembros conecten contigo.",
    actionUrl: "/perfil-usuario",
  },
  interests: {
    title: "Has compartido tus reflexiones",
    body: "Tus valores e intenciones fortalecen afinidades genuinas en la comunidad.",
    actionUrl: "/perfil-usuario",
  },
  user_interests: {
    title: "Has seleccionado tus temas de interés",
    body: "Tus áreas de interés te acercan a contenidos y personas afines a tu bienestar.",
    actionUrl: "/perfil-usuario",
  },
  cover: {
    title: "Has personalizado tu foto de portada",
    body: "Tu perfil ahora transmite tu energía y presencia visual única.",
    actionUrl: "/perfil-usuario",
  },
  connect: {
    title: "Has enviado tu primera solicitud",
    body: "Has dado el primer paso para construir conexiones conscientes en la red.",
    actionUrl: "/inicio/miembros",
  },
};

export async function getOnboardingQuests(userId: string): Promise<{ quests: Quest[]; progressPercentage: number }> {
  // Fetch user data with relations needed for quest checks
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      profilePrompts: true,
      interests: { take: 1 },
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
    user_interests: user.interests.length > 0 || !!(profile?.intention && profile.intention.trim() !== ""),
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
      interests: { take: 1 },
      sentConnections: { take: 1 },
      receivedConnections: { take: 1 },
    },
  });

  if (!user) return null;

  const profile = user.profile;
  let isCompleted = false;

  if (questId === "profession") {
    isCompleted = !!(profile?.profession && profile.profession.trim() !== "");
  } else if (questId === "bio") {
    isCompleted = !!(profile?.bio && profile.bio.trim() !== "");
  } else if (questId === "interests") {
    isCompleted = user.profilePrompts.length > 0;
  } else if (questId === "user_interests") {
    isCompleted = user.interests.length > 0 || !!(profile?.intention && profile.intention.trim() !== "");
  } else if (questId === "cover") {
    isCompleted = !!(profile?.coverUrl && profile.coverUrl.trim() !== "");
  } else if (questId === "connect") {
    isCompleted = user.sentConnections.length > 0 || user.receivedConnections.length > 0;
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
