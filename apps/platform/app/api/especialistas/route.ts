import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const profiles = await prisma.specialistProfile.findMany({
      where: {
        user: { status: "active", profile: { isOnboarded: true } },
      },
      select: {
        userId: true,
        specialty: true,
        title: true,
        user: {
          select: {
            profile: {
              select: {
                fullName: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                city: true,
                country: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const specialists = profiles.map((specialist) => {
      const profile = specialist.user.profile;
      const fallbackName = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
      return {
        id: specialist.userId,
        name: profile?.fullName || fallbackName || "Especialista LUMINUS",
        avatar: profile?.avatarUrl || "",
        city: profile?.city || "",
        country: profile?.country || "",
        specialty: specialist.specialty || specialist.title,
      };
    });

    return NextResponse.json(
      { specialists },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("Failed to fetch specialists.", error);
    return NextResponse.json(
      { message: "No pudimos cargar los especialistas. Intenta nuevamente." },
      { status: 500 },
    );
  }
}
