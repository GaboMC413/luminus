import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getOnboardingQuests } from "@/lib/onboarding";
import { isUuid } from "@/utils/validation";

export const runtime = "nodejs";

function serializeNotification(notification: any) {
  let title = notification.title || "";
  // Strip common emojis at the start of titles
  title = title.replace(/^[^ws¡!]+/, "").trim();

  let body = notification.body || "";
  // Strip trailing emojis in the body
  body = body.replace(/[^ws.¡!¿?,:;()\-+/*%$=#@_'"\\]+$/, "").trim();

  const isQuestCompleted = String(notification.type).startsWith("quest_completed_");
  let icon: string | undefined = undefined;
  if (isQuestCompleted) {
    const questId = String(notification.type).replace("quest_completed_", "");
    const questIcons: Record<string, string> = {
      profession: "work",
      bio: "article_person",
      interests: "format_quote",
      user_interests: "interests",
      cover: "photo_prints",
      connect: "person_add",
    };
    icon = questIcons[questId] || "auto_awesome";

    title = "¡Destello completado!";
    const questShortDescriptions: Record<string, string> = {
      profession: "Indicaste tu profesión en tu perfil.",
      bio: "Completaste tu biografía de presentación.",
      interests: "Compartiste tus reflexiones personales.",
      user_interests: "Seleccionaste tus temas de interés.",
      cover: "Personalizaste tu foto de portada.",
      connect: "Enviaste tu primera solicitud de conexión.",
    };
    body = questShortDescriptions[questId] || "Completaste un nuevo destello en tu camino.";
  } else if (notification.type === "connection_accepted") {
    title = "Solicitud aceptada";
    body = "aceptó tu solicitud de conexión.";
  } else if (notification.type === "connection_request") {
    title = "Nueva solicitud";
    body = "quiere conectarse contigo.";
  } else {
    // If long paragraph, take the first sentence
    const firstSentence = body.split(/[.!?]\s+/)[0];
    if (firstSentence && firstSentence.length < body.length) {
      body = firstSentence.endsWith(".") ? firstSentence : `${firstSentence}.`;
    }
  }

  // Extract actorId from actionUrl if available
  const actorIdMatch = (notification.actionUrl || "").match(/[?&]id=([^&]+)/);
  const actorId = actorIdMatch ? actorIdMatch[1] : undefined;

  return {
    id: notification.id,
    type: notification.type,
    title,
    user: notification.actorName || "LUMINUS",
    avatar: isQuestCompleted ? "" : (notification.actorAvatarUrl || ""),
    actorId,
    icon,
    action: body,
    action_url: notification.actionUrl || "",
    date: notification.createdAt.toISOString(),
    isUnread: !notification.readAt,
  };
}

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    });

    const serialized: any[] = notifications.map(serializeNotification);

    // Calculate onboarding quests progress
    const isDismissed = await prisma.notification.findFirst({
      where: {
        userId: session.userId,
        type: "onboarding_progress_dismissed",
      },
    });

    if (!isDismissed) {
      const onboardingData = await getOnboardingQuests(session.userId);
      const isCompleted = onboardingData.progressPercentage === 100;

      const progressItem = {
        id: "onboarding-progress",
        type: "onboarding-progress",
        title: "Tus Primeros Destellos",
        user: "LUMINUS",
        avatar: "/iso-logo-black.svg",
        action: isCompleted
          ? "¡Felicitaciones! Has completado todos tus destellos iniciales y encendido tu luz en LUMINUS."
          : `Enciende tu luz. Completa estas ${onboardingData.quests.length} misiones iniciales para conectar y guiar tu camino de bienestar.`,
        action_url: "",
        date: new Date().toISOString(),
        isUnread: !isCompleted,
        quests: onboardingData.quests,
        progressPercentage: onboardingData.progressPercentage,
      };

      if (!isCompleted) {
        // Pinned at the top when in progress
        serialized.unshift(progressItem);
      } else {
        // Kept visible but NOT pinned at top when completed
        serialized.push(progressItem);
      }
    }

    return NextResponse.json({
      notifications: serialized,
    });
  } catch (error) {
    console.error("Failed to fetch notifications.", error);
    return NextResponse.json({ message: "No se pudieron cargar las notificaciones." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const notificationId = body?.id;
  const markAll = body?.markAll === true;

  if (!markAll && !isUuid(notificationId)) {
    return NextResponse.json({ message: "Notificacion invalida." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const now = new Date();

    if (markAll) {
      await prisma.notification.updateMany({
        where: {
          userId: session.userId,
          readAt: null,
        },
        data: {
          readAt: now,
        },
      });
    } else {
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: session.userId,
        },
        data: {
          readAt: now,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to mark notification read.", error);
    return NextResponse.json({ message: "No se pudo actualizar la notificacion." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get("id") || "";

  // Support single-time dismissal for onboarding-progress
  if (notificationId === "onboarding-progress") {
    try {
      const { prisma } = await import("@/lib/db");
      const existing = await prisma.notification.findFirst({
        where: {
          userId: session.userId,
          type: "onboarding_progress_dismissed",
        },
      });
      if (!existing) {
        await prisma.notification.create({
          data: {
            userId: session.userId,
            type: "onboarding_progress_dismissed",
            title: "Destellos Descartados",
            body: "El usuario descartó los destellos iniciales",
            readAt: new Date(),
          },
        });
      }
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("Failed to dismiss onboarding progress.", error);
      return NextResponse.json({ message: "No se pudo descartar los destellos." }, { status: 500 });
    }
  }

  if (!isUuid(notificationId)) {
    return NextResponse.json({ message: "Notificacion invalida." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId: session.userId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete notification.", error);
    return NextResponse.json({ message: "No se pudo eliminar la notificacion." }, { status: 500 });
  }
}
