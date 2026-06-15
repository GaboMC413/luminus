import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getOnboardingQuests } from "@/lib/onboarding";

export const runtime = "nodejs";

function isUuid(value: unknown) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function serializeNotification(notification: any) {
  let title = notification.title || "";
  // Strip common emojis at the start of titles
  title = title.replace(/^[^\w\s¡!]+/, "").trim();

  let body = notification.body || "";
  // Strip trailing emojis in the body
  body = body.replace(/[^\w\s.¡!¿?,:;()\-+/*%$=#@_'"\\]+$/, "").trim();

  const isQuestCompleted = String(notification.type).startsWith("quest_completed_");
  let icon: string | undefined = undefined;
  if (isQuestCompleted) {
    const questId = String(notification.type).replace("quest_completed_", "");
    const questIcons: Record<string, string> = {
      profession: "work",
      bio: "article_person",
      interests: "format_quote",
      cover: "photo_prints",
      connect: "person_add",
      follow: "heart_plus",
    };
    icon = questIcons[questId] || "auto_awesome";
  }

  return {
    id: notification.id,
    type: notification.type,
    title,
    user: notification.actorName || "LUMINUS",
    avatar: isQuestCompleted ? "" : (notification.actorAvatarUrl || ""),
    icon,
    action: body,
    action_url: notification.actionUrl || "",
    date: notification.createdAt.toISOString(),
    isUnread: !notification.readAt,
  };
}

export async function GET() {
  const session = getCurrentSession();

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

    // Calculate onboarding quests progress and inject onboarding quests checklist if not completed
    const onboardingData = await getOnboardingQuests(session.userId);
    if (onboardingData.progressPercentage < 100) {
      const progressItem = {
        id: "onboarding-progress",
        type: "onboarding-progress",
        title: "Tus Primeros Destellos",
        user: "LUMINUS",
        avatar: "/iso-logo-black.svg",
        action: "Enciende tu luz. Completa estas 6 misiones iniciales para conectar y guiar tu camino de bienestar.",
        action_url: "",
        date: new Date().toISOString(),
        isUnread: true,
        quests: onboardingData.quests,
        progressPercentage: onboardingData.progressPercentage,
      };
      serialized.unshift(progressItem);
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
  const session = getCurrentSession();

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
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get("id") || "";

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
