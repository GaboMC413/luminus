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
    },
    created_at: connection.createdAt?.toISOString?.() ?? "",
    updated_at: connection.updatedAt?.toISOString?.() ?? "",
  };
}

export async function GET() {
  const session = getCurrentSession();

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
        requester: { include: { profile: true } },
        recipient: { include: { profile: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      connections: connections.map((connection: any) => serializeConnection(connection, session.userId)),
    });
  } catch (error) {
    console.error("Connections read failed.", error);
    return NextResponse.json({ message: "No pudimos cargar tus conexiones." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = getCurrentSession();

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
    return NextResponse.json({ message: "Usuario destino invalido." }, { status: 400 });
  }

  if (recipientId === session.userId) {
    return NextResponse.json({ message: "No puedes conectarte contigo mismo." }, { status: 400 });
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

    const targetName = recipient.profile?.fullName || `${recipient.profile?.firstName || ""} ${recipient.profile?.lastName || ""}`.trim() || recipient.email || "Usuario";
    const targetDetails = JSON.stringify({
      recipientId,
      recipientEmail: recipient.email,
      recipientName: targetName,
    });

    const existingConnection = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: session.userId, recipientId },
          { requesterId: recipientId, recipientId: session.userId },
        ],
      },
    });

    if (existingConnection) {
      if (existingConnection.status === "blocked") {
        if (existingConnection.requesterId !== session.userId) {
          return NextResponse.json({ message: "No puedes enviar una solicitud a este usuario." }, { status: 403 });
        }
        return NextResponse.json({ message: "Debes desbloquear a este usuario primero." }, { status: 400 });
      }

      if (existingConnection.status === "declined") {
        const requester = await prisma.user.findUnique({
          where: { id: session.userId },
          select: { tier: true, trialExpiresAt: true },
        });
        const isPremium = requester && (requester.tier === "BASIC" || (requester.trialExpiresAt && new Date(requester.trialExpiresAt) > new Date()));

        if (!isPremium) {
          const diffMs = Date.now() - new Date(existingConnection.updatedAt).getTime();
          const cooldownMs = 24 * 60 * 60 * 1000;

          if (diffMs < cooldownMs) {
            const hoursLeft = Math.ceil((cooldownMs - diffMs) / (60 * 60 * 1000));
            return NextResponse.json({
              message: `Debes esperar ${hoursLeft} horas antes de enviar otra solicitud a este usuario.`
            }, { status: 429 });
          }
        }

        const updated = await prisma.userConnection.update({
          where: { id: existingConnection.id },
          data: {
            requesterId: session.userId,
            recipientId,
            status: "pending",
            updatedAt: new Date(),
          },
        });

        try {
          await prisma.activityLog.create({
            data: {
              userId: session.userId,
              action: "REQUEST_CONNECTION",
              details: targetDetails,
            },
          });
        } catch (logError) {
          console.error("Failed to log REQUEST_CONNECTION activity:", logError);
        }

        try {
          const requesterProfile = await prisma.userProfile.findUnique({
            where: { userId: session.userId },
            select: { firstName: true, lastName: true, fullName: true, avatarUrl: true },
          });
          const requesterName = requesterProfile?.fullName || `${requesterProfile?.firstName || ""} ${requesterProfile?.lastName || ""}`.trim() || "Un usuario";
          const requesterAvatar = requesterProfile?.avatarUrl || "";

          await prisma.notification.deleteMany({
            where: {
              userId: recipientId,
              type: "connection_request",
              actionUrl: `/comunidad/public-profile?id=${session.userId}`
            }
          });

          await prisma.notification.create({
            data: {
              userId: recipientId,
              type: "connection_request",
              title: "Nueva solicitud",
              actorName: requesterName,
              actorAvatarUrl: requesterAvatar,
              body: "quiere agregarte a su red.",
              actionUrl: `/comunidad/public-profile?id=${session.userId}`,
            },
          });
        } catch (notifError) {
          console.error("Failed to create connection request notification:", notifError);
        }

        return NextResponse.json({
          success: true,
          connection: {
            id: updated.id,
            status: updated.status,
            direction: "outgoing",
          },
          message: "Solicitud de conexion enviada.",
        });
      }

      return NextResponse.json({
        success: true,
        connection: {
          id: existingConnection.id,
          status: existingConnection.status,
          direction: existingConnection.requesterId === session.userId ? "outgoing" : "incoming",
        },
        message: "La conexion ya existe.",
      });
    }

    const connection = await prisma.userConnection.create({
      data: {
        requesterId: session.userId,
        recipientId,
        status: "pending",
      },
    });

    try {
      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "REQUEST_CONNECTION",
          details: targetDetails,
        },
      });
    } catch (logError) {
      console.error("Failed to log REQUEST_CONNECTION activity:", logError);
    }

    // Create a connection request notification for the recipient user
    try {
      const requesterProfile = await prisma.userProfile.findUnique({
        where: { userId: session.userId },
        select: { firstName: true, lastName: true, fullName: true, avatarUrl: true },
      });
      const requesterName = requesterProfile?.fullName || `${requesterProfile?.firstName || ""} ${requesterProfile?.lastName || ""}`.trim() || "Un usuario";
      const requesterAvatar = requesterProfile?.avatarUrl || "";

      // Ensure we don't create multiple notifications for the same request
      await prisma.notification.deleteMany({
        where: {
          userId: recipientId,
          type: "connection_request",
          actionUrl: `/comunidad/public-profile?id=${session.userId}`
        }
      });

      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: "connection_request",
          title: "Nueva solicitud",
          actorName: requesterName,
          actorAvatarUrl: requesterAvatar,
          body: "quiere agregarte a su red.",
          actionUrl: `/comunidad/public-profile?id=${session.userId}`,
        },
      });
    } catch (notifError) {
      console.error("Failed to create connection request notification:", notifError);
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
        status: connection.status,
        direction: "outgoing",
      },
      message: "Solicitud de conexion enviada.",
      newlyCompletedQuests,
    });
  } catch (error) {
    console.error("Connection request failed.", error);
    return NextResponse.json({ message: "No pudimos enviar la solicitud de conexion." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const rateLimitResult = isRateLimited(
    session.userId,
    "ACCEPT_CONNECTION",
    RATE_LIMITS.ACCEPT_CONNECTION.limit,
    RATE_LIMITS.ACCEPT_CONNECTION.windowMs
  );
  if (rateLimitResult.success) {
    return NextResponse.json({ message: "Demasiadas solicitudes. Inténtalo de nuevo más tarde." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const requesterId = typeof body?.recipientId === "string" ? body.recipientId.trim() : "";

  if (!requesterId || !isUuid(requesterId)) {
    return NextResponse.json({ message: "Usuario origen invalido." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const connection = await prisma.userConnection.findFirst({
      where: {
        requesterId,
        recipientId: session.userId,
        status: "pending",
      },
    });

    if (!connection) {
      return NextResponse.json({ message: "No se encontró ninguna solicitud de conexión pendiente." }, { status: 404 });
    }

    const updated = await prisma.userConnection.update({
      where: { id: connection.id },
      data: { status: "accepted" },
    });

    try {
      const requesterUser = await prisma.user.findUnique({
        where: { id: requesterId },
        select: { email: true, profile: { select: { firstName: true, lastName: true, fullName: true } } },
      });
      if (requesterUser) {
        const requesterName = requesterUser.profile?.fullName || `${requesterUser.profile?.firstName || ""} ${requesterUser.profile?.lastName || ""}`.trim() || requesterUser.email || "Usuario";
        await prisma.activityLog.create({
          data: {
            userId: session.userId,
            action: "ACCEPT_CONNECTION",
            details: JSON.stringify({
              requesterId,
              requesterEmail: requesterUser.email,
              requesterName,
            }),
          },
        });
      }
    } catch (logError) {
      console.error("Failed to log ACCEPT_CONNECTION activity:", logError);
    }

    // Create a connection accepted notification for the requester (original sender)
    try {
      const accepterProfile = await prisma.userProfile.findUnique({
        where: { userId: session.userId },
        select: { firstName: true, lastName: true, fullName: true, avatarUrl: true },
      });
      const accepterName = accepterProfile?.fullName || `${accepterProfile?.firstName || ""} ${accepterProfile?.lastName || ""}`.trim() || "Un usuario";
      const accepterAvatar = accepterProfile?.avatarUrl || "";

      await prisma.notification.create({
        data: {
          userId: requesterId,
          type: "connection_accepted",
          title: "Solicitud aceptada",
          actorName: accepterName,
          actorAvatarUrl: accepterAvatar,
          body: "aceptó tu solicitud de conexión.",
          actionUrl: `/comunidad/public-profile?id=${session.userId}`,
        },
      });
    } catch (notifCreateError) {
      console.error("Failed to create connection accepted notification:", notifCreateError);
    }

    // Delete any pending connection_request notifications for this connection
    try {
      await prisma.notification.deleteMany({
        where: {
          OR: [
            {
              userId: session.userId,
              type: "connection_request",
              actionUrl: `/comunidad/public-profile?id=${requesterId}`
            },
            {
              userId: requesterId,
              type: "connection_request",
              actionUrl: `/comunidad/public-profile?id=${session.userId}`
            }
          ]
        }
      });
    } catch (notifDeleteError) {
      console.error("Failed to delete notification on accept:", notifDeleteError);
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
        id: updated.id,
        status: updated.status,
        direction: "incoming",
      },
      message: "Solicitud de conexión aceptada.",
      newlyCompletedQuests,
    });
  } catch (error) {
    console.error("Accept connection failed.", error);
    return NextResponse.json({ message: "No pudimos aceptar la solicitud de conexión." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = getCurrentSession();

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
    const connection = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: session.userId, recipientId: targetId },
          { requesterId: targetId, recipientId: session.userId },
        ],
      },
    });

    if (!connection) {
      return NextResponse.json({ message: "No existe ninguna conexión activa o pendiente." }, { status: 404 });
    }

    if (connection.status === "pending") {
      await prisma.userConnection.update({
        where: { id: connection.id },
        data: { status: "declined" },
      });

      try {
        const isRecipient = connection.recipientId === session.userId;
        const otherUserId = isRecipient ? connection.requesterId : connection.recipientId;
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: { email: true, profile: { select: { firstName: true, lastName: true, fullName: true } } },
        });
        const otherUserName = otherUser?.profile?.fullName || `${otherUser?.profile?.firstName || ""} ${otherUser?.profile?.lastName || ""}`.trim() || otherUser?.email || "Usuario";
        
        await prisma.activityLog.create({
          data: {
            userId: session.userId,
            action: isRecipient ? "NETWORK_REJECT" : "CANCEL_CONNECTION_REQUEST",
            details: JSON.stringify({
              targetId: otherUserId,
              targetEmail: otherUser?.email,
              targetName: otherUserName,
            }),
          },
        });
      } catch (logErr) {
        console.error("Failed to log NETWORK_REJECT activity:", logErr);
      }
    } else {
      await prisma.userConnection.delete({
        where: { id: connection.id },
      });

      try {
        const otherUserId = connection.requesterId === session.userId ? connection.recipientId : connection.requesterId;
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: { email: true, profile: { select: { firstName: true, lastName: true, fullName: true } } },
        });
        const otherUserName = otherUser?.profile?.fullName || `${otherUser?.profile?.firstName || ""} ${otherUser?.profile?.lastName || ""}`.trim() || otherUser?.email || "Usuario";

        await prisma.activityLog.create({
          data: {
            userId: session.userId,
            action: "NETWORK_DELETION",
            details: JSON.stringify({
              targetId: otherUserId,
              targetEmail: otherUser?.email,
              targetName: otherUserName,
            }),
          },
        });
      } catch (logErr) {
        console.error("Failed to log NETWORK_DELETION activity:", logErr);
      }
    }

    // Delete any pending connection_request notifications between these two users
    try {
      await prisma.notification.deleteMany({
        where: {
          OR: [
            {
              userId: connection.recipientId,
              type: "connection_request",
              actionUrl: `/comunidad/public-profile?id=${connection.requesterId}`
            },
            {
              userId: connection.requesterId,
              type: "connection_request",
              actionUrl: `/comunidad/public-profile?id=${connection.recipientId}`
            }
          ]
        }
      });
    } catch (notifDeleteError) {
      console.error("Failed to delete connection request notifications:", notifDeleteError);
    }

    return NextResponse.json({
      success: true,
      message: "Conexión eliminada/cancelada con éxito.",
    });
  } catch (error) {
    console.error("Delete connection failed.", error);
    return NextResponse.json({ message: "No pudimos eliminar la conexión." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = getCurrentSession();

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
        const otherUserName = otherUser?.profile?.fullName || `${otherUser?.profile?.firstName || ""} ${otherUser?.profile?.lastName || ""}`.trim() || otherUser?.email || "Usuario";
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
    
    // Find if a connection exists in any direction
    const existing = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: session.userId, recipientId: targetId },
          { requesterId: targetId, recipientId: session.userId }
        ]
      }
    });

    let connection;
    if (existing) {
      // Update existing connection status to blocked
      connection = await prisma.userConnection.update({
        where: { id: existing.id },
        data: { status: "blocked", requesterId: session.userId, recipientId: targetId }
      });
    } else {
      // Create a new blocked connection
      connection = await prisma.userConnection.create({
        data: {
          requesterId: session.userId,
          recipientId: targetId,
          status: "blocked"
        }
      });
    }

    try {
      const otherUser = await prisma.user.findUnique({
        where: { id: targetId },
        select: { email: true, profile: { select: { firstName: true, lastName: true, fullName: true } } },
      });
      const otherUserName = otherUser?.profile?.fullName || `${otherUser?.profile?.firstName || ""} ${otherUser?.profile?.lastName || ""}`.trim() || otherUser?.email || "Usuario";
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

    // Delete any pending notifications between them
    try {
      await prisma.notification.deleteMany({
        where: {
          OR: [
            {
              userId: session.userId,
              type: "connection_request",
              actionUrl: `/comunidad/public-profile?id=${targetId}`
            },
            {
              userId: targetId,
              type: "connection_request",
              actionUrl: `/comunidad/public-profile?id=${session.userId}`
            }
          ]
        }
      });
    } catch (notifErr) {
      console.error("Failed to delete notifications on block:", notifErr);
    }

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        status: connection.status,
      },
      message: "Usuario bloqueado con éxito."
    });
  } catch (error) {
    console.error("Block connection failed.", error);
    return NextResponse.json({ message: "No pudimos bloquear la conexión." }, { status: 500 });
  }
}
