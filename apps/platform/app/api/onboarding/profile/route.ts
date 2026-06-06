import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

function parseBirthdate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const normalized = value.includes("/")
    ? value
        .split("/")
        .map((part) => part.trim())
        .reverse()
        .join("-")
    : value;
  const date = new Date(`${normalized}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Datos invalidos." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const firstName = typeof data.firstName === "string" ? data.firstName.trim() : undefined;
  const lastName = typeof data.lastName === "string" ? data.lastName.trim() : undefined;
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || undefined;
  const phoneCountry = data.phoneCountry as { dial?: unknown } | undefined;
  const phone = typeof data.phone === "string" ? data.phone.trim() : "";
  const phoneNumber =
    typeof phoneCountry?.dial === "string" && phone ? `${phoneCountry.dial}${phone}` : phone || undefined;
  const birthdate = parseBirthdate(data.birthdateString);
  const shouldUpdateInterests = Array.isArray(data.interests);
  const interests = shouldUpdateInterests
    ? (data.interests as unknown[]).filter((interest): interest is string => typeof interest === "string")
    : [];
  const interestSlugs = Array.from(new Set(interests.map(slugify).filter(Boolean)));
  const otherInterests =
    typeof data.otherInterests === "string" && data.otherInterests.trim()
      ? data.otherInterests.trim()
      : undefined;

  try {
    const { prisma } = await import("@/lib/db");
    const profile = await prisma.$transaction(async (tx: any) => {
      const savedProfile = await tx.userProfile.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          fullName,
          firstName,
          lastName,
          avatarUrl: typeof data.avatarUrl === "string" ? data.avatarUrl : undefined,
          city: typeof data.city === "string" ? data.city : undefined,
          country: typeof data.country === "string" ? data.country : undefined,
          phoneNumber,
          gender: typeof data.gender === "string" ? data.gender : undefined,
          birthdate,
          selectedPlan: typeof data.selectedPlan === "string" ? data.selectedPlan : undefined,
          intention: otherInterests,
          isOnboarded: data.isOnboarded === true,
        },
        update: {
          fullName,
          firstName,
          lastName,
          avatarUrl: typeof data.avatarUrl === "string" ? data.avatarUrl : undefined,
          city: typeof data.city === "string" ? data.city : undefined,
          country: typeof data.country === "string" ? data.country : undefined,
          phoneNumber,
          gender: typeof data.gender === "string" ? data.gender : undefined,
          birthdate,
          selectedPlan: typeof data.selectedPlan === "string" ? data.selectedPlan : undefined,
          intention: otherInterests,
          isOnboarded: data.isOnboarded === true ? true : undefined,
        },
      });

      if (shouldUpdateInterests) {
        await tx.userInterest.deleteMany({
          where: {
            userId: session.userId,
            source: "onboarding",
          },
        });

        if (interestSlugs.length > 0) {
          const interestRows = await tx.interest.findMany({
            where: {
              slug: {
                in: interestSlugs,
              },
              isActive: true,
            },
            select: { id: true },
          });

          if (interestRows.length > 0) {
            await tx.userInterest.createMany({
              data: interestRows.map((interest: any) => ({
                userId: session.userId,
                interestId: interest.id,
                source: "onboarding",
              })),
              skipDuplicates: true,
            });
          }
        }
      }

      return savedProfile;
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Onboarding database flow failed.", error);
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
    if (useMockData) {
      console.warn("Database not available, using mock onboarding profile bypass.");
      const mockProfile = {
        userId: session.userId,
        fullName: fullName || "Nancy Núñez",
        firstName: firstName || "Nancy",
        lastName: lastName || "Núñez",
        avatarUrl: typeof data.avatarUrl === "string" ? data.avatarUrl : null,
        city: typeof data.city === "string" ? data.city : "Lima",
        country: typeof data.country === "string" ? data.country : "Perú",
        phoneNumber: phoneNumber || null,
        gender: typeof data.gender === "string" ? data.gender : "Femenino",
        birthdate: birthdate || null,
        selectedPlan: typeof data.selectedPlan === "string" ? data.selectedPlan : "Mensual",
        intention: otherInterests || null,
        isOnboarded: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json({ profile: mockProfile });
    }
    return NextResponse.json(
      { message: "El servicio de base de datos no está disponible." },
      { status: 500 }
    );
  }
}
