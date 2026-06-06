import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { MOCK_USERS } from "@/utils/constants";

export const runtime = "nodejs";

export async function GET() {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (!process.env.DATABASE_URL && !useMockData) {
    return NextResponse.json({ 
      message: "DATABASE_URL is not configured and NEXT_PUBLIC_USE_MOCK_DATA is not enabled." 
    }, { status: 500 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: session.userId,
        },
        profile: {
          isOnboarded: true,
        },
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

    const serialized = users.map((user) => {
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

    return NextResponse.json({ users: serialized });
  } catch (error) {
    console.error("Failed to fetch community users.", error);
    
    if (useMockData) {
      console.warn("Database not available, falling back to MOCK_USERS (explicit bypass enabled).");
      const serializedMock = MOCK_USERS.map((user, idx) => ({
        id: `mock-user-${idx}`,
        name: user.name,
        location: user.location,
        avatar: user.avatar,
        interests: user.interests,
        profession: idx % 3 === 0 ? "Coach" : idx % 3 === 1 ? "Nutricionista" : "Instructor de Yoga",
      }));
      return NextResponse.json({ users: serializedMock });
    }
    
    return NextResponse.json({ 
      message: "No se pudieron cargar los usuarios de la comunidad. El servicio de base de datos no está disponible." 
    }, { status: 500 });
  }
}
