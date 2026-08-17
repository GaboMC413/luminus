import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country")?.trim() || "";

  try {
    const { prisma } = await import("@/lib/db");

    // Group countries of active onboarded users
    const countryGroups = await prisma.userProfile.groupBy({
      by: ["country"],
      where: {
        isOnboarded: true,
        country: {
          not: null,
          notIn: [""],
        },
      },
    });

    // Group cities of active onboarded users
    const cityWhere: any = {
      isOnboarded: true,
      city: {
        not: null,
        notIn: [""],
      },
    };
    if (country) {
      cityWhere.country = country;
    }

    const cityGroups = await prisma.userProfile.groupBy({
      by: ["city"],
      where: cityWhere,
    });

    // Fetch all active interests that have users
    const activeInterests = await prisma.interest.findMany({
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
    });

    const countries = countryGroups.map((g: any) => g.country).sort();
    const cities = cityGroups.map((g: any) => g.city).sort();
    const interests = activeInterests.map((i: any) => i.name);

    return NextResponse.json({
      countries,
      cities,
      interests,
    });
  } catch (error) {
    console.error("Failed to fetch filter options.", error);
    return NextResponse.json({ message: "No se pudieron cargar las opciones de filtrado." }, { status: 500 });
  }
}
