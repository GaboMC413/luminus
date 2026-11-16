import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { withServerCache } from "@/lib/serverCache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const specialists = await withServerCache(
      "specialists-directory",
      async () => {
        const profiles = await prisma.specialistProfile.findMany({
          where: {
            user: { status: "active", profile: { isOnboarded: true } },
          },
          select: {
            userId: true,
            specialty: true,
            title: true,
            selectedAreas: true,
            user: {
              select: {
                slug: true,
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

        return profiles.map((specialist) => {
          const profile = specialist.user.profile;
          const fallbackName = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
          const rawAreas = Array.isArray(specialist.selectedAreas)
            ? specialist.selectedAreas.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
            : [];
          return {
            id: specialist.userId,
            slug: specialist.user.slug || null,
            name: profile?.fullName || fallbackName || "Especialista LUMINUS",
            avatar: profile?.avatarUrl || "",
            city: profile?.city || "",
            country: profile?.country || "",
            specialty: specialist.specialty || "",
            title: specialist.title || specialist.specialty || "",
            areas: rawAreas,
          };
        });
      },
      { ttlMs: 60_000, tags: ["specialists"] }
    );

    return NextResponse.json({ specialists });
  } catch (error) {
    console.error("Failed to fetch specialists.", error);
    return NextResponse.json(
      { message: "No pudimos cargar los especialistas. Intenta nuevamente." },
      { status: 500 },
    );
  }
}
