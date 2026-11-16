import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { isUuid } from "@/utils/validation";
import { isRateLimited, RATE_LIMITS } from "@/utils/rateLimit";

export const runtime = "nodejs";

function serializeFollowUser(user: any, createdAt?: Date) {
  const profile = user?.profile ?? {};
  const fullName = profile.fullName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

  const userCategoriesMap = new Map();
  (user?.interests ?? []).forEach((row: any) => {
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
    id: user.id,
    slug: user.slug || null,
    name: fullName || "Usuario sin nombre",
    avatar: profile.avatarUrl || "",
    profession: profile.profession || "",
    location: `${profile.city || ""}, ${profile.country || ""}`.replace(/^,\s*|,\s*$/, "").trim(),
    interests: (user?.interests ?? []).map((row: any) => row.interest?.name).filter(Boolean),
    categories: Array.from(userCategoriesMap.values()),
    isSpecialist: Boolean(user?.specialistProfile),
    specialty: user?.specialistProfile?.specialty || user?.specialistProfile?.title || "",
    created_at: createdAt?.toISOString?.() ?? "",
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
    const [followingRows, followerRows] = await Promise.all([
      prisma.userFollow.findMany({
        where: { followerId: session.userId },
        include: {
          following: {
            include: {
              profile: true,
              specialistProfile: true,
              interests: { include: { interest: { include: { category: true } } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.userFollow.findMany({
        where: { followingId: session.userId },
        include: {
          follower: {
            include: {
              profile: true,
              specialistProfile: true,
              interests: { include: { interest: { include: { category: true } } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      following: followingRows.map((row: any) => ({
        id: row.id,
        user: serializeFollowUser(row.following, row.createdAt),
        created_at: row.createdAt?.toISOString?.() ?? "",
      })),
      followers: followerRows.map((row: any) => ({
        id: row.id,
        user: serializeFollowUser(row.follower, row.createdAt),
        created_at: row.createdAt?.toISOString?.() ?? "",
      })),
    });
  } catch (error) {
    console.error("Follows read failed.", error);
    return NextResponse.json({ message: "No pudimos cargar los especialistas que sigues." }, { status: 500 });
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
  const followingId = typeof body?.followingId === "string" ? body.followingId.trim() : "";

  if (!followingId || !isUuid(followingId)) {
    return NextResponse.json({ message: "Especialista destino inválido." }, { status: 400 });
  }

  if (followingId === session.userId) {
    return NextResponse.json({ message: "No puedes seguirte a ti mismo." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const [target, blockedConnection, existingFollow, followerProfile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: followingId },
        select: {
          id: true,
          status: true,
          specialistProfile: { select: { userId: true } },
        },
      }),
      prisma.userConnection.findFirst({
        where: {
          OR: [
            { requesterId: followingId, recipientId: session.userId, status: "blocked" },
            { requesterId: session.userId, recipientId: followingId, status: "blocked" },
          ],
        },
      }),
      prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.userId,
            followingId,
          },
        },
      }),
      prisma.userProfile.findUnique({
        where: { userId: session.userId },
        select: { firstName: true, lastName: true, fullName: true, avatarUrl: true },
      }),
    ]);

    if (!target || target.status !== "active") {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    if (!target.specialistProfile) {
      return NextResponse.json(
        { message: "Solo puedes seguir directamente a especialistas. Envía una solicitud de conexión." },
        { status: 400 }
      );
    }

    if (blockedConnection) {
      return NextResponse.json({ message: "No puedes seguir a este usuario." }, { status: 403 });
    }

    if (existingFollow) {
      return NextResponse.json({
        success: true,
        follow: { id: existingFollow.id, followingId },
        message: "Ya sigues a este especialista.",
      });
    }

    const followerName =
      followerProfile?.fullName ||
      `${followerProfile?.firstName || ""} ${followerProfile?.lastName || ""}`.trim() ||
      "Un usuario";
    const followerAvatar = followerProfile?.avatarUrl || "";

    const [follow] = await Promise.all([
      prisma.userFollow.create({
        data: {
          followerId: session.userId,
          followingId,
        },
      }),
      prisma.notification
        .deleteMany({
          where: {
            userId: followingId,
            type: "specialist_follow",
            actionUrl: `/perfil/${session.userId}`,
          },
        })
        .then(() =>
          prisma.notification.create({
            data: {
              userId: followingId,
              type: "specialist_follow",
              title: "Nuevo seguidor",
              actorName: followerName,
              actorAvatarUrl: followerAvatar,
              body: "empezó a seguirte.",
              actionUrl: `/perfil/${session.userId}`,
            },
          })
        )
        .catch((err) => console.error("Failed to create specialist_follow notification:", err)),
    ]);

    return NextResponse.json({
      success: true,
      follow: { id: follow.id, followingId },
      message: "Ahora sigues a este especialista.",
    });
  } catch (error) {
    console.error("Follow specialist failed.", error);
    return NextResponse.json({ message: "No pudimos seguir a este especialista." }, { status: 500 });
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
  let followingId = searchParams.get("followingId") || "";

  if (!followingId) {
    const body = await request.json().catch(() => null);
    followingId = typeof body?.followingId === "string" ? body.followingId.trim() : "";
  }

  if (!followingId || !isUuid(followingId)) {
    return NextResponse.json({ message: "Especialista destino inválido." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const existing = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.userId,
          followingId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ message: "No sigues a este especialista." }, { status: 404 });
    }

    await Promise.all([
      prisma.userFollow.delete({ where: { id: existing.id } }),
      prisma.notification
        .deleteMany({
          where: {
            userId: followingId,
            type: "specialist_follow",
            actionUrl: `/perfil/${session.userId}`,
          },
        })
        .catch(() => {}),
    ]);

    return NextResponse.json({
      success: true,
      message: "Dejaste de seguir a este especialista.",
    });
  } catch (error) {
    console.error("Unfollow specialist failed.", error);
    return NextResponse.json({ message: "No pudimos dejar de seguir a este especialista." }, { status: 500 });
  }
}
