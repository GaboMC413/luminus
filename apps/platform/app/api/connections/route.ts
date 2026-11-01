import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { isUuid } from "@/utils/validation";
import { isRateLimited, RATE_LIMITS } from "@/utils/rateLimit";

export const runtime = "nodejs";

function serializeConnection(connection: any, currentUserId: string) {
  const otherUser =
    connection.requesterId === currentUserId ? connection.recipient : connection.requester;
  const profile = otherUser?.profile ?? {};
  const fullName = profile.fullName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

  const userCategoriesMap = new Map();
  (otherUser?.interests ?? []).forEach((row: any) => {
    const cat = row.interest?.category;
    if (cat && !userCategoriesMap.has(cat.id)) {
      userCategoriesMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        icon: cat.icon || "label",
        iconFilled: cat.iconFilled ?? true,
        color: cat.color || "#3B82F6",
        bgColor: cat.bgColor || "#DBEAFE",
      });
    }
  });

  return {
    id: connection.id,
    status: connection.status,
    direction: connection.requesterId === currentUserId ? "outgoing" : "incoming",
    user: {
      id: otherUser.id,
      name: fullName || "Usuario sin nombre",
      avatar: profile.avatarUrl || "",
      profession: profile.profession || "",
      location: `${profile.city || ""}, ${profile.country || ""}`.replace(/^,\s*|,\s*$/, "").trim(),
      interests: (otherUser?.interests ?? []).map((row: any) => row.interest?.name).filter(Boolean),
      categories: Array.from(userCategoriesMap.values()),
      isSpecialist: Boolean(otherUser?.specialistProfile),
      specialty: otherUser?.specialistProfile?.specialty || otherUser?.specialistProfile?.title || "",
    },
    created_at: connection.createdAt?.toISOString?.() ?? "",
    updated_at: connection.updatedAt?.toISOString?.() ?? "",
  };
}

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const rateLimitResult = isRateLimited(
    session.userId,
    "GET_CONNECTIONS",
    RATE_LIMITS.GET_CONNECTIONS.limit,
    RATE_LIMITS.GET_CONNECTIONS.windowMs
  );
  if (rateLimitResult.success) {
    return NextResponse.json({ message: "Demasiadas solicitudes. Inténtalo de nuevo más tarde." }, { status: 429 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const connections = await prisma.userConnection.findMany({
      where: {
        OR: [
          { requesterId: session.userId },
          { recipientId: session.userId },
        ],
      },
      include: {
        requester: {
          include: {
            profile: true,
            specialistProfile: true,
            interests: {
              include: {
                interest: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
        recipient: {
          include: {
            profile: true,
            specialistProfile: true,
            interests: {
              include: {
                interest: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const serialized = connections.map((conn: any) => serializeConnection(conn, session.userId));
    
    // In our directed model:
    // "following" = users the current user added to their network (outgoing & accepted)
    // "followers" = users who added the current user to their network (incoming & accepted)
    const following = serialized.filter(
      (c: any) => c.direction === "outgoing" && c.status === "accepted"
    );
    const followers = serialized.filter(
      (c: any) => c.direction === "incoming" && c.status === "accepted"
    );

    return NextResponse.json({
      connections: serialized,
      following,
      followers,
    });
  } catch (error) {
    console.error("Connections read failed.", error);
    return NextResponse.json({ message: "No pudimos cargar tus conexiones." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const rateLimitResult = isRateLimited(
    session.userId,
    "SEND_CONNECTION",
    RATE_LIMITS.SEND_CONNECTION.limit,
    RATE_LIMITS.SEND_CONNECTION.windowMs
  );
  if (rateLimitResult.success) {
    return NextResponse.json({ message: "Demasiadas solicitudes. Inténtalo de nuevo más tarde." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const recipientId = typeof body?.recipientId === "string" ? body.recipientId.trim() : "";

  if (!recipientId || !isUuid(recipientId)) {
    return NextResponse.json({ message: "Usuario destino inválido." }, { status: 400 });
  }

  if (recipientId === session.userId) {
    return NextResponse.json({ message: "No puedes sumarte a ti mismo a tu red." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: {
        id: true,
        status: true,
        email: true,
        profile: { select: { firstName: true, lastName: true, fullName: true } },
      },
    });

    if (!recipient || recipient.status !== "active") {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    const targetName =
      recipient.profile?.fullName ||
      `${recipient.profile?.firstName || ""} ${recipient.profile?.lastName || ""}`.trim() ||
      recipient.email ||
      "Usuario";

    const targetDetails = JSON.stringify({
      recipientId,
      recipientEmail: recipient.email,
      recipientName: targetName,
    });

    // Check if reverse relationship blocked session user
    const reverseConnection = await prisma.userConnection.findFirst({
      where: {
        requesterId: recipientId,
        recipientId: session.userId,
        status: "blocked",
      },
    });

    if (reverseConnection) {
      return NextResponse.json({ message: "No puedes sumar a este usuario a tu red." }, { status: 403 });
    }

    // Check directed connection from session.userId -> recipientId
    const existingDirected = await prisma.userConnection.findFirst({
      where: {
        requesterId: session.userId,
        recipientId,
      },
    });

    if (existingDirected) {
      if (existingDirected.status === "blocked") {
        return NextResponse.json({ message: "Debes desbloquear a este usuario primero." }, { status: 400 });
      }

      if (existingDirected.status === "accepted") {
        return NextResponse.json({
          success: true,
          connection: {
            id: existingDirected.id,
            status: "accepted",
            direction: "outgoing",
          },
          message: "Este usuario ya está en tu red.",
        });
      }

      // If existing connection was declined/pending, activate it instantly
      const updated = await prisma.userConnection.update({
        where: { id: existingDirected.id },
        data: {
          status: "accepted",
          updatedAt: new Date(),
        },
      });

      // Notification to recipient
      try {
        const requesterProfile = await prisma.userProfile.findUnique({
          where: { userId: session.userId },
          select: { firstName: true, lastName: true, fullName: true, avatarUrl: true },
        });
        const requesterName =
          requesterProfile?.fullName ||
          `${requesterProfile?.firstName || ""} ${requesterProfile?.lastName || ""}`.trim() ||
          "Un usuario";
        const requesterAvatar = requesterProfile?.avatarUrl || "";

        await prisma.notification.deleteMany({
          where: {
            userId: recipientId,
            type: { in: ["network_add", "connection_request", "connection_accepted"] },
            actionUrl: `/inicio/public-profile?id=${session.userId}`,
          },
        });

        await prisma.notification.create({
          data: {
            userId: recipientId,
            type: "network_add",
            title: "Nueva conexión",
            actorName: requesterName,
            actorAvatarUrl: requesterAvatar,
            body: "te sumó a su red.",
            actionUrl: `/inicio/public-profile?id=${session.userId}`,
          },
        });
      } catch (notifErr) {
        console.error("Failed to create network_add notification:", notifErr);
      }

      return NextResponse.json({
        success: true,
        connection: {
          id: updated.id,
          status: "accepted",
          direction: "outgoing",
        },
        message: "Usuario sumado a tu red.",
      });
    }

    // Create new directed connection with instant accepted status
    const connection = await prisma.userConnection.create({
      data: {
        requesterId: session.userId,
        recipientId,
        status: "accepted",
      },
    });

    try {
      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "ADD_TO_NETWORK",
          details: targetDetails,
        },
      });
    } catch (logError) {
      console.error("Failed to log ADD_TO_NETWORK activity:", logError);
    }

    // Create network_add notification for recipient
    try {
      const requesterProfile = await prisma.userProfile.findUnique({
        where: { userId: session.userId },
        select: { firstName: true, lastName: true, fullName: true, avatarUrl: true },
      });
      const requesterName =
        requesterProfile?.fullName ||
        `${requesterProfile?.firstName || ""} ${requesterProfile?.lastName || ""}`.trim() ||
        "Un usuario";
      const requesterAvatar = requesterProfile?.avatarUrl || "";

      await prisma.notification.deleteMany({
        where: {
          userId: recipientId,
          type: { in: ["network_add", "connection_request", "connection_accepted"] },
          actionUrl: `/inicio/public-profile?id=${session.userId}`,
        },
      });

      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: "network_add",
          title: "Nueva conexión",
          actorName: requesterName,
          actorAvatarUrl: requesterAvatar,
          body: "te sumó a su red.",
          actionUrl: `/inicio/public-profile?id=${session.userId}`,
        },
      });
    } catch (notifError) {
      console.error("Failed to create network_add notification:", notifError);
    }

    const newlyCompletedQuests = [];
    try {
      const { checkAndTriggerQuestCompletion } = await import("@/lib/onboarding");
      const r = await checkAndTriggerQuestCompletion(session.userId, "connect");
      if (r) newlyCompletedQuests.push(r);
    } catch (questError) {
      console.error("Failed to check onboarding connect quest completion:", questError);
    }

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        status: "accepted",
        direction: "outgoing",
      },
      message: "Sumado a tu red con éxito.",
      newlyCompletedQuests,
    });
  } catch (error) {
    console.error("Add to network failed.", error);
    return NextResponse.json({ message: "No pudimos sumar este usuario a tu red." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  // Idempotent acceptance / backward compatibility
  return POST(request);
}

export async function DELETE(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const rateLimitResult = isRateLimited(
    session.userId,
    "DELETE_CONNECTION",
    RATE_LIMITS.DELETE_CONNECTION.limit,
    RATE_LIMITS.DELETE_CONNECTION.windowMs
  );
  if (rateLimitResult.success) {
    return NextResponse.json({ message: "Demasiadas solicitudes. Inténtalo de nuevo más tarde." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  let targetId = searchParams.get("recipientId") || "";

  if (!targetId) {
    const body = await request.json().catch(() => null);
    targetId = typeof body?.recipientId === "string" ? body.recipientId.trim() : "";
  }

  if (!targetId || !isUuid(targetId)) {
    return NextResponse.json({ message: "Usuario de destino inválido." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    
    // In our directed model, deleting means the current user removes targetId from their network
    const connection = await prisma.userConnection.findFirst({
      where: {
        requesterId: session.userId,
        recipientId: targetId,
      },
    });

    if (!connection) {
      return NextResponse.json({ message: "No tienes a este usuario en tu red." }, { status: 404 });
    }

    await prisma.userConnection.delete({
      where: { id: connection.id },
    });

    try {
      const otherUser = await prisma.user.findUnique({
        where: { id: targetId },
        select: { email: true, profile: { select: { firstName: true, lastName: true, fullName: true } } },
      });
      const otherUserName =
        otherUser?.profile?.fullName ||
        `${otherUser?.profile?.firstName || ""} ${otherUser?.profile?.lastName || ""}`.trim() ||
        otherUser?.email ||
        "Usuario";

      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "REMOVE_FROM_NETWORK",
          details: JSON.stringify({
            targetId,
            targetEmail: otherUser?.email,
            targetName: otherUserName,
          }),
        },
      });
    } catch (logErr) {
      console.error("Failed to log REMOVE_FROM_NETWORK activity:", logErr);
    }

    // Delete any pending notification sent from session.userId to targetId
    try {
      await prisma.notification.deleteMany({
        where: {
          userId: targetId,
          type: { in: ["network_add", "connection_request", "connection_accepted"] },
          actionUrl: `/inicio/public-profile?id=${session.userId}`,
        },
      });
    } catch (notifDeleteError) {
      console.error("Failed to clean up notification on removal:", notifDeleteError);
    }

    return NextResponse.json({
      success: true,
      message: "Eliminado de tu red con éxito.",
    });
  } catch (error) {
    console.error("Remove from network failed.", error);
    return NextResponse.json({ message: "No pudimos eliminar al usuario de tu red." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const rateLimitResult = isRateLimited(
    session.userId,
    "BLOCK_CONNECTION",
    RATE_LIMITS.BLOCK_CONNECTION.limit,
    RATE_LIMITS.BLOCK_CONNECTION.windowMs
  );
  if (rateLimitResult.success) {
    return NextResponse.json({ message: "Demasiadas solicitudes. Inténtalo de nuevo más tarde." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const targetId = typeof body?.recipientId === "string" ? body.recipientId.trim() : "";
  const action = typeof body?.action === "string" ? body.action.trim() : "";

  if (!targetId || !isUuid(targetId)) {
    return NextResponse.json({ message: "Usuario de destino inválido." }, { status: 400 });
  }

  if (action !== "block" && action !== "unblock") {
    return NextResponse.json({ message: "Acción no soportada." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");

    if (action === "unblock") {
      const blocked = await prisma.userConnection.findFirst({
        where: {
          requesterId: session.userId,
          recipientId: targetId,
          status: "blocked",
        },
      });

      if (!blocked) {
        return NextResponse.json({ message: "No existe ningún bloqueo activo con este usuario." }, { status: 404 });
      }

      await prisma.userConnection.delete({
        where: { id: blocked.id },
      });

      try {
        const otherUser = await prisma.user.findUnique({
          where: { id: targetId },
          select: { email: true, profile: { select: { firstName: true, lastName: true, fullName: true } } },
        });
        const otherUserName =
          otherUser?.profile?.fullName ||
          `${otherUser?.profile?.firstName || ""} ${otherUser?.profile?.lastName || ""}`.trim() ||
          otherUser?.email ||
          "Usuario";
        await prisma.activityLog.create({
          data: {
            userId: session.userId,
            action: "UNBLOCK_USER",
            details: JSON.stringify({
              targetId,
              targetEmail: otherUser?.email,
              targetName: otherUserName,
            }),
          },
        });
      } catch (logErr) {
        console.error("Failed to log UNBLOCK_USER activity:", logErr);
      }

      return NextResponse.json({
        success: true,
        message: "Usuario desbloqueado con éxito.",
      });
    }

    // Action === "block":
    // 1. Create or update directed connection from session.userId -> targetId as blocked
    const existing = await prisma.userConnection.findFirst({
      where: {
        requesterId: session.userId,
        recipientId: targetId,
      },
    });

    if (existing) {
      await prisma.userConnection.update({
        where: { id: existing.id },
        data: { status: "blocked" },
      });
    } else {
      await prisma.userConnection.create({
        data: {
          requesterId: session.userId,
          recipientId: targetId,
          status: "blocked",
        },
      });
    }

    // 2. Sever any reverse connection from targetId -> session.userId
    await prisma.userConnection.deleteMany({
      where: {
        requesterId: targetId,
        recipientId: session.userId,
      },
    });

    // 3. Delete notifications between both users
    await prisma.notification.deleteMany({
      where: {
        OR: [
          {
            userId: targetId,
            actionUrl: `/inicio/public-profile?id=${session.userId}`,
          },
          {
            userId: session.userId,
            actionUrl: `/inicio/public-profile?id=${targetId}`,
          },
        ],
      },
    });

    try {
      const otherUser = await prisma.user.findUnique({
        where: { id: targetId },
        select: { email: true, profile: { select: { firstName: true, lastName: true, fullName: true } } },
      });
      const otherUserName =
        otherUser?.profile?.fullName ||
        `${otherUser?.profile?.firstName || ""} ${otherUser?.profile?.lastName || ""}`.trim() ||
        otherUser?.email ||
        "Usuario";
      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "BLOCK_USER",
          details: JSON.stringify({
            targetId,
            targetEmail: otherUser?.email,
            targetName: otherUserName,
          }),
        },
      });
    } catch (logErr) {
      console.error("Failed to log BLOCK_USER activity:", logErr);
    }

    return NextResponse.json({
      success: true,
      message: "Usuario bloqueado con éxito.",
    });
  } catch (error) {
    console.error("Block connection failed.", error);
    return NextResponse.json({ message: "No pudimos bloquear al usuario." }, { status: 500 });
  }
}
