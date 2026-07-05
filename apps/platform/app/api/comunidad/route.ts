import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { isUuid } from "@/utils/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ 
      message: "DATABASE_URL is not configured." 
    }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = parseInt(searchParams.get("limit") || "24", 10);
  const limit = Math.min(Math.max(limitParam, 1), 100);
  const cursor = searchParams.get("cursor") || undefined;
  
  const query = searchParams.get("query")?.trim() || "";
  const country = searchParams.get("country")?.trim() || "";
  const city = searchParams.get("city")?.trim() || "";
  const category = searchParams.get("category")?.trim() || "";
  
  const interestsParam = searchParams.get("interests") || "";
  const interestList = interestsParam
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);

  try {
    const { prisma } = await import("@/lib/db");
    
    const blockedConnections = await prisma.userConnection.findMany({
      where: {
        status: "blocked",
        OR: [
          { requesterId: session.userId },
          { recipientId: session.userId },
        ],
      },
      select: {
        requesterId: true,
        recipientId: true,
      },
    });

    const blockedUserIds = blockedConnections.map((conn: any) =>
      conn.requesterId === session.userId ? conn.recipientId : conn.requesterId
    );

    const where: any = {
      id: {
        not: session.userId,
        notIn: blockedUserIds,
      },
      profile: {
        isOnboarded: true,
      },
    };

    if (country) {
      where.profile.country = country;
    }

    if (city) {
      where.profile.city = city;
    }

    if (query) {
      where.OR = [
        { profile: { fullName: { contains: query, mode: "insensitive" } } },
        { profile: { firstName: { contains: query, mode: "insensitive" } } },
        { profile: { lastName: { contains: query, mode: "insensitive" } } },
        { profile: { profession: { contains: query, mode: "insensitive" } } },
        { profile: { country: { contains: query, mode: "insensitive" } } },
        { profile: { city: { contains: query, mode: "insensitive" } } },
        { interests: { some: { interest: { name: { contains: query, mode: "insensitive" } } } } },
      ];
    }

    const interestFilters: any[] = [];
    if (interestList.length > 0) {
      interestFilters.push({
        some: {
          interest: {
            name: { in: interestList, mode: "insensitive" }
          }
        }
      });
    }
    if (category) {
      interestFilters.push({
        some: {
          interest: {
            category: {
              name: { equals: category, mode: "insensitive" }
            }
          }
        }
      });
    }
    if (interestFilters.length > 0) {
      where.interests = {
        AND: interestFilters
      };
    }

    let cursorUser = null;
    if (cursor && isUuid(cursor)) {
      cursorUser = await prisma.user.findUnique({
        where: { id: cursor },
        select: { createdAt: true },
      });
    }

    if (cursorUser) {
      where.createdAt = {
        lt: cursorUser.createdAt,
      };
    }

    const users = await prisma.user.findMany({
      where,
      take: limit + 1, // Fetch one extra to determine if hasMore is true
      orderBy: {
        createdAt: "desc",
      },
      include: {
        profile: true,
        interests: {
          include: {
            interest: true,
          },
        },
      },
    });

    const hasMore = users.length > limit;
    const paginatedUsers = hasMore ? users.slice(0, limit) : users;
    const nextCursor = hasMore ? paginatedUsers[paginatedUsers.length - 1].id : null;

    const serialized = paginatedUsers.map((user: any) => {
      const profile = (user.profile ?? {}) as any;
      const fullName = profile.fullName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
      return {
        id: user.id,
        name: fullName || "Usuario sin nombre",
        location: `${profile.city || ""}, ${profile.country || ""}`.replace(/^,\s*|,\s*$/, "").trim() || "Ubicación no definida",
        avatar: profile.avatarUrl || "",
        interests: (user.interests ?? []).map((row: any) => row.interest.name),
        profession: profile.profession || "",
      };
    });

    return NextResponse.json({
      users: serialized,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Failed to fetch community users.", error);
    
    return NextResponse.json({ 
      message: "No se pudieron cargar los usuarios de la comunidad. El servicio de base de datos no está disponible." 
    }, { status: 500 });
  }
}
