import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ 
      message: "DATABASE_URL is not configured." 
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
    
    return NextResponse.json({ 
      message: "No se pudieron cargar los usuarios de la comunidad. El servicio de base de datos no está disponible." 
    }, { status: 500 });
  }
}
