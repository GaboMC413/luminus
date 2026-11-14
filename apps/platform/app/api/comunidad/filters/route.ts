import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country")?.trim() || "";

  try {
    const { prisma } = await import("@/lib/db");

    const cityWhere: any = {
      isOnboarded: true,
      user: {
        status: "active",
        isGhost: false,
      },
      city: {
        not: null,
        notIn: [""],
      },
    };
    if (country) {
      cityWhere.country = country;
    }

    const [countryGroups, cityGroups, activeInterests, activeProfiles] = await Promise.all([
      prisma.userProfile.groupBy({
        by: ["country"],
        where: {
          isOnboarded: true,
          user: {
            status: "active",
            isGhost: false,
          },
          country: {
            not: null,
            notIn: [""],
          },
        },
      }),
      prisma.userProfile.groupBy({
        by: ["city"],
        where: cityWhere,
      }),
      prisma.interest.findMany({
        where: {
          isActive: true,
          userInterests: {
            some: {},
          },
        },
        select: {
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.userProfile.findMany({
        where: {
          isOnboarded: true,
          avatarUrl: {
            not: null,
            notIn: ["", " "],
          },
          user: {
            id: { not: session.userId },
            status: "active",
            isGhost: false,
          },
        },
        select: {
          fullName: true,
          firstName: true,
          lastName: true,
        },
        take: 250,
      }),
    ]);

    const countries = countryGroups.map((g: any) => g.country).sort();
    const cities = cityGroups.map((g: any) => g.city).sort();
    const interests = activeInterests.map((i: any) => i.name);
    const names = Array.from(
      new Set(
        activeProfiles
          .map((p: any) => p.fullName || `${p.firstName || ""} ${p.lastName || ""}`.trim())
          .filter(Boolean)
      )
    ).sort();

    return NextResponse.json({
      countries,
      cities,
      interests,
      names,
    });
  } catch (error) {
    console.error("Failed to fetch filter options.", error);
    return NextResponse.json({ message: "No se pudieron cargar las opciones de filtrado." }, { status: 500 });
  }
}
