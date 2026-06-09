import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

function isUuid(value: unknown) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function serializeNotification(notification: any) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    user: notification.actorName || "LUMINUS",
    avatar: notification.actorAvatarUrl || "",
    action: notification.body,
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

    return NextResponse.json({
      notifications: notifications.map(serializeNotification),
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
