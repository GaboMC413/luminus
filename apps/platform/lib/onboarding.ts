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
    actionUrl: "/perfil-usuario?edit=prompts",
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
    label: "Suma a alguien a tu red",
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
    title: "Has sumado tu primera conexión",
    body: "Has dado el primer paso para construir tu red en la comunidad.",
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
      sentConnections: {
        where: { status: "accepted" },
        take: 1,
      },
      receivedConnections: {
        where: { status: "accepted" },
        take: 1,
      },
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

export async function checkAndTriggerQuestsCompletion(
  userId: string,
  questIds: string[],
  preloadedUser?: any
): Promise<NewlyCompletedQuest[]> {
  const validQuestIds = questIds.filter((id) => QUEST_CONFIG[id]);
  if (validQuestIds.length === 0) return [];

  // 1. Fetch user if not preloaded or if needed relations are missing
  let user = preloadedUser;
  const needsConnect = validQuestIds.includes("connect");
  if (!user || !user.profile || (needsConnect && (!user.sentConnections || !user.receivedConnections))) {
    user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        profilePrompts: true,
        interests: { take: 1 },
        sentConnections: {
          where: { status: "accepted" },
          take: 1,
        },
        receivedConnections: {
          where: { status: "accepted" },
          take: 1,
        },
      },
    });
  }

  if (!user) return [];

  const profile = user.profile;

  // 2. Determine which requested quests are completed
  const candidateQuestIds: string[] = [];
  for (const questId of validQuestIds) {
    let isCompleted = false;
    if (questId === "profession") {
      isCompleted = !!(profile?.profession && profile.profession.trim() !== "");
    } else if (questId === "bio") {
      isCompleted = !!(profile?.bio && profile.bio.trim() !== "");
    } else if (questId === "interests") {
      isCompleted = (user.profilePrompts?.length ?? 0) > 0;
    } else if (questId === "user_interests") {
      isCompleted = (user.interests?.length ?? 0) > 0 || !!(profile?.intention && profile.intention.trim() !== "");
    } else if (questId === "cover") {
      isCompleted = !!(profile?.coverUrl && profile.coverUrl.trim() !== "");
    } else if (questId === "connect") {
      isCompleted = (user.sentConnections?.length ?? 0) > 0 || (user.receivedConnections?.length ?? 0) > 0;
    }
    if (isCompleted) {
      candidateQuestIds.push(questId);
    }
  }

  if (candidateQuestIds.length === 0) return [];

  // 3. Batch check existing celebrations in notifications and permanent activity logs
  const candidateTypeKeys = candidateQuestIds.map((id) => `quest_completed_${id}`);
  const [existingNotifications, existingActivityLogs] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId,
        type: { in: candidateTypeKeys },
      },
      select: { type: true },
    }),
    prisma.activityLog.findMany({
      where: {
        userId,
        action: "QUEST_COMPLETED",
        details: { in: candidateQuestIds },
      },
      select: { details: true },
    }),
  ]);

  const existingCompletedSet = new Set<string>([
    ...existingNotifications.map((n) => n.type.replace("quest_completed_", "")),
    ...existingActivityLogs.map((a) => a.details || "").filter(Boolean),
  ]);

  const newQuestIds = candidateQuestIds.filter((id) => !existingCompletedSet.has(id));

  if (newQuestIds.length === 0) return [];

  // 4. Batch create celebration notifications AND permanent activity logs
  const now = new Date();
  const notificationsToCreate = newQuestIds.map((id) => {
    const copy = CELEBRATION_COPY[id];
    return {
      userId,
      type: `quest_completed_${id}`,
      title: copy.title,
      body: copy.body,
      actionUrl: copy.actionUrl,
      actorName: "LUMINUS",
      actorAvatarUrl: "/iso-logo-black.svg",
      readAt: now,
    };
  });

  const activityLogsToCreate = newQuestIds.map((id) => ({
    userId,
    action: "QUEST_COMPLETED",
    details: id,
  }));

  await Promise.all([
    prisma.notification.createMany({
      data: notificationsToCreate,
    }),
    prisma.activityLog.createMany({
      data: activityLogsToCreate,
    }),
  ]);

  return newQuestIds.map((id) => ({
    id,
    title: CELEBRATION_COPY[id].title,
    body: CELEBRATION_COPY[id].body,
  }));
}

export async function checkAndTriggerQuestCompletion(
  userId: string,
  questId: string
): Promise<NewlyCompletedQuest | null> {
  const results = await checkAndTriggerQuestsCompletion(userId, [questId]);
  return results[0] ?? null;
}
