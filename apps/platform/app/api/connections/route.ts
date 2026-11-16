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
      slug: otherUser.slug || null,
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

function deduplicateByUserId(items: any[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const uid = item?.user?.id;
    if (!uid || seen.has(uid)) return false;
    seen.add(uid);
    return true;
  });
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

    const contacts = deduplicateByUserId(
      serialized.filter((c: any) => c.status === "accepted")
    );
    const pendingIncoming = serialized.filter(
      (c: any) => c.direction === "incoming" && c.status === "pending"
    );
    const pendingOutgoing = serialized.filter(
      (c: any) => c.direction === "outgoing" && c.status === "pending"
    );
    const blocked = serialized.filter(
      (c: any) => c.direction === "outgoing" && c.status === "blocked"
    );

    return NextResponse.json({
      connections: serialized,
      contacts,
      pendingIncoming,
      pendingOutgoing,
      blocked,
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
    return NextResponse.json({ message: "No puedes conectarte contigo mismo." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const [recipient, existingConnections, requesterProfile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: recipientId },
        select: {
          id: true,
          status: true,
          email: true,
          profile: { select: { firstName: true, lastName: true, fullName: true } },
        },
      }),
      prisma.userConnection.findMany({
        where: {
          OR: [
            { requesterId: session.userId, recipientId },
            { requesterId: recipientId, recipientId: session.userId },
          ],
        },
      }),
      prisma.userProfile.findUnique({
        where: { userId: session.userId },
        select: { firstName: true, lastName: true, fullName: true, avatarUrl: true },
      }),
    ]);

    if (!recipient || recipient.status !== "active") {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    const blockedByRecipient = existingConnections.find(
      (c: any) => c.requesterId === recipientId && c.status === "blocked"
    );
    if (blockedByRecipient) {
      return NextResponse.json({ message: "No puedes conectarte con este usuario." }, { status: 403 });
    }

    const blockedByMe = existingConnections.find(
      (c: any) => c.requesterId === session.userId && c.status === "blocked"
    );
    if (blockedByMe) {
      return NextResponse.json({ message: "Debes desbloquear a este usuario primero." }, { status: 400 });
    }

    const existingAccepted = existingConnections.find((c: any) => c.status === "accepted");
    if (existingAccepted) {
      return NextResponse.json({
        success: true,
        connection: {
          id: existingAccepted.id,
          status: "accepted",
          direction: existingAccepted.requesterId === session.userId ? "outgoing" : "incoming",
        },
        message: "Este usuario ya es parte de tus contactos.",
      });
    }

    const existingOutgoingPending = existingConnections.find(
      (c: any) => c.requesterId === session.userId && c.status === "pending"
    );
    if (existingOutgoingPending) {
      return NextResponse.json({
        success: true,
        connection: {
          id: existingOutgoingPending.id,
          status: "pending",
          direction: "outgoing",
        },
        message: "Ya enviaste una solicitud de conexión a este usuario.",
      });
    }

    const requesterName =
      requesterProfile?.fullName ||
      `${requesterProfile?.firstName || ""} ${requesterProfile?.lastName || ""}`.trim() ||
      "Un usuario";
    const requesterAvatar = requesterProfile?.avatarUrl || "";

    // If the recipient already sent a pending request to the current user, auto-accept it
    const existingIncomingPending = existingConnections.find(
      (c: any) => c.requesterId === recipientId && c.status === "pending"
    );
    if (existingIncomingPending) {
      const [accepted] = await Promise.all([
        prisma.userConnection.update({
          where: { id: existingIncomingPending.id },
          data: { status: "accepted", updatedAt: new Date() },
        }),
        prisma.notification.deleteMany({
          where: {
            userId: session.userId,
            type: "connection_request",
            actionUrl: `/perfil/${recipientId}`,
          },
        }).catch(() => {}),
        prisma.notification.create({
          data: {
            userId: recipientId,
            type: "connection_accepted",
            title: "Conexión aceptada",
            actorName: requesterName,
            actorAvatarUrl: requesterAvatar,
            body: "aceptó tu solicitud de conexión.",
            actionUrl: `/perfil/${session.userId}`,
          },
        }).catch((err) => console.error("Failed to create connection_accepted notification:", err)),
      ]);

      return NextResponse.json({
        success: true,
        connection: {
          id: accepted.id,
          status: "accepted",
          direction: "incoming",
        },
        message: "Solicitud aceptada. Ahora son contactos.",
      });
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

    const sendRequestNotification = async () => {
      try {
        await prisma.notification.deleteMany({
          where: {
            userId: recipientId,
            type: { in: ["network_add", "connection_request", "connection_accepted"] },
            actionUrl: `/perfil/${session.userId}`,
          },
        });

        await prisma.notification.create({
          data: {
            userId: recipientId,
            type: "connection_request",
            title: "Solicitud de conexión",
            actorName: requesterName,
            actorAvatarUrl: requesterAvatar,
            body: "te envió una solicitud de conexión.",
            actionUrl: `/perfil/${session.userId}`,
          },
        });
      } catch (notifErr) {
        console.error("Failed to create connection_request notification:", notifErr);
      }
    };

    const existingDeclined = existingConnections.find(
      (c: any) => c.requesterId === session.userId && c.status === "declined"
    );

    const [connection] = await Promise.all([
      existingDeclined
        ? prisma.userConnection.update({
            where: { id: existingDeclined.id },
            data: { status: "pending", updatedAt: new Date() },
          })
        : prisma.userConnection.create({
            data: {
              requesterId: session.userId,
              recipientId,
              status: "pending",
            },
          }),
      sendRequestNotification(),
      prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "SEND_CONNECTION_REQUEST",
          details: targetDetails,
        },
      }).catch((logError) => console.error("Failed to log SEND_CONNECTION_REQUEST activity:", logError)),
    ]);

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
        status: "pending",
        direction: "outgoing",
      },
      message: "Solicitud de conexión enviada.",
      newlyCompletedQuests,
    });
  } catch (error) {
    console.error("Send connection request failed.", error);
    return NextResponse.json({ message: "No pudimos enviar la solicitud de conexión." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const targetId = typeof body?.recipientId === "string" ? body.recipientId.trim() : "";

  if (!targetId || !isUuid(targetId)) {
    return NextResponse.json({ message: "Usuario de origen inválido." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");

    const [pending, acceptorProfile] = await Promise.all([
      prisma.userConnection.findFirst({
        where: {
          requesterId: targetId,
          recipientId: session.userId,
          status: "pending",
        },
      }),
      prisma.userProfile.findUnique({
        where: { userId: session.userId },
        select: { firstName: true, lastName: true, fullName: true, avatarUrl: true },
      }),
    ]);

    if (!pending) {
      return NextResponse.json({ message: "No encontramos una solicitud pendiente de este usuario." }, { status: 404 });
    }

    const acceptorName =
      acceptorProfile?.fullName ||
      `${acceptorProfile?.firstName || ""} ${acceptorProfile?.lastName || ""}`.trim() ||
      "Un usuario";
    const acceptorAvatar = acceptorProfile?.avatarUrl || "";

    const [updated] = await Promise.all([
      prisma.userConnection.update({
        where: { id: pending.id },
        data: { status: "accepted", updatedAt: new Date() },
      }),
      prisma.notification.deleteMany({
        where: {
          userId: session.userId,
          type: "connection_request",
          actionUrl: `/perfil/${targetId}`,
        },
      }).catch(() => {}),
      prisma.notification.create({
        data: {
          userId: targetId,
          type: "connection_accepted",
          title: "Conexión aceptada",
          actorName: acceptorName,
          actorAvatarUrl: acceptorAvatar,
          body: "aceptó tu solicitud de conexión.",
          actionUrl: `/perfil/${session.userId}`,
        },
      }).catch((notifErr) => console.error("Failed to create connection_accepted notification:", notifErr)),
    ]);

    return NextResponse.json({
      success: true,
      connection: {
        id: updated.id,
        status: "accepted",
        direction: "incoming",
      },
      message: "Solicitud de conexión aceptada.",
    });
  } catch (error) {
    console.error("Accept connection failed.", error);
    return NextResponse.json({ message: "No pudimos aceptar la solicitud." }, { status: 500 });
  }
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

    const [connections, otherUser] = await Promise.all([
      prisma.userConnection.findMany({
        where: {
          OR: [
            { requesterId: session.userId, recipientId: targetId },
            { requesterId: targetId, recipientId: session.userId },
          ],
          status: { not: "blocked" },
        },
      }),
      prisma.user.findUnique({
        where: { id: targetId },
        select: { email: true, profile: { select: { firstName: true, lastName: true, fullName: true } } },
      }),
    ]);

    if (!connections || connections.length === 0) {
      return NextResponse.json({ message: "No tienes una conexión o solicitud con este usuario." }, { status: 404 });
    }

    const otherUserName =
      otherUser?.profile?.fullName ||
      `${otherUser?.profile?.firstName || ""} ${otherUser?.profile?.lastName || ""}`.trim() ||
      otherUser?.email ||
      "Usuario";

    await Promise.all([
      prisma.userConnection.deleteMany({
        where: { id: { in: connections.map((c: any) => c.id) } },
      }),
      prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "REMOVE_FROM_NETWORK",
          details: JSON.stringify({
            targetId,
            targetEmail: otherUser?.email,
            targetName: otherUserName,
          }),
        },
      }).catch((logErr) => console.error("Failed to log REMOVE_FROM_NETWORK activity:", logErr)),
      prisma.notification.deleteMany({
        where: {
          OR: [
            {
              userId: targetId,
              type: { in: ["network_add", "connection_request", "connection_accepted"] },
              actionUrl: `/perfil/${session.userId}`,
            },
            {
              userId: session.userId,
              type: { in: ["network_add", "connection_request", "connection_accepted"] },
              actionUrl: `/perfil/${targetId}`,
            },
          ],
        },
      }).catch((notifDeleteError) => console.error("Failed to clean up notification on removal:", notifDeleteError)),
    ]);

    return NextResponse.json({
      success: true,
      message: "Conexión eliminada con éxito.",
    });
  } catch (error) {
    console.error("Remove from network failed.", error);
    return NextResponse.json({ message: "No pudimos eliminar la conexión." }, { status: 500 });
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

    // Sever reverse connection and any follow relationships between the two users
    await Promise.all([
      prisma.userConnection.deleteMany({
        where: {
          requesterId: targetId,
          recipientId: session.userId,
        },
      }),
      prisma.userFollow.deleteMany({
        where: {
          OR: [
            { followerId: session.userId, followingId: targetId },
            { followerId: targetId, followingId: session.userId },
          ],
        },
      }),
      prisma.notification.deleteMany({
        where: {
          OR: [
            { userId: targetId, actionUrl: `/perfil/${session.userId}` },
            { userId: session.userId, actionUrl: `/perfil/${targetId}` },
          ],
        },
      }),
    ]);

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
