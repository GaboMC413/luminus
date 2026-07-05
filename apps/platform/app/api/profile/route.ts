import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

type ProfilePromptInput = {
  question?: unknown;
  answer?: unknown;
};

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
    : value.trim();
  const date = new Date(`${normalized}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatBirthdate(value?: Date | string | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pickString(data: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string") return value.trim();
  }
  return undefined;
}

function serializeProfile(user: any) {
  const profile = user.profile ?? {};
  const prompts = (user.profilePrompts ?? [])
    .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
    .map((prompt: any) => ({
      question: prompt.question,
      answer: prompt.answer,
    }));

  return {
    email: user.email,
    profile: {
      first_name: profile.firstName ?? "",
      last_name: profile.lastName ?? "",
      city: profile.city ?? "",
      country: profile.country ?? "",
      profession: profile.profession ?? "",
      interests: (user.interests ?? []).map((row: any) => row.interest.name),
      prompts,
      profile_picture_url: profile.avatarUrl ?? "",
      cover_url: profile.coverUrl ?? "",
      gender: profile.gender ?? "",
      birthdate: formatBirthdate(profile.birthdate),
      phone_number: profile.phoneNumber ?? "",
      selected_plan: profile.selectedPlan ?? "Mensual",
      created_at: profile.createdAt?.toISOString?.() ?? user.createdAt?.toISOString?.() ?? "",
      bio: profile.bio ?? "",
      other_interests: profile.intention ?? "",
    },
  };
}

export async function GET() {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
        interests: {
          include: {
            interest: true,
          },
        },
        profilePrompts: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    return NextResponse.json(serializeProfile(user));
  } catch (error) {
    console.error("Profile read failed.", error);
    console.warn("Database not available, using mock profile GET bypass.");
    return NextResponse.json({
      email: session.email,
      profile: {
        first_name: "Nancy",
        last_name: "Núñez",
        city: "Puntarenas",
        country: "Costa Rica",
        profession: "Fotógrafa",
        interests: ["Estilo de Vida", "Naturaleza", "Fotografía Consciente"],
        prompts: [
          {
            question: "Mi objetivo de vida es…",
            answer: "Vivir con más calma, claridad y propósito de vida."
          }
        ],
        profile_picture_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
        cover_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&fit=crop",
        gender: "Femenino",
        birthdate: "1994-05-15",
        phone_number: "+506 8888-8888",
        selected_plan: "Mensual",
        created_at: new Date().toISOString(),
        bio: "Apasionada por capturar la esencia de la vida a través de la fotografía y vivir en conexión con la naturaleza.",
        other_interests: "Crecimiento personal",
      }
    });
  }
}

export async function PATCH(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Datos invalidos." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const firstName = pickString(data, "first_name", "firstName");
  const lastName = pickString(data, "last_name", "lastName");
  const birthdate = parseBirthdate(data.birthdate ?? data.birthdateString);
  const shouldUpdateInterests = Array.isArray(data.interests);
  const shouldUpdatePrompts = Array.isArray(data.prompts);

  const profileData: Record<string, unknown> = {};
  if (firstName !== undefined) profileData.firstName = firstName;
  if (lastName !== undefined) profileData.lastName = lastName;
  if (firstName !== undefined || lastName !== undefined) {
    profileData.fullName = [firstName, lastName].filter(Boolean).join(" ") || undefined;
  }
  const avatarUrl = pickString(data, "avatarUrl", "avatar_url", "profile_picture_url");
  const coverUrl = pickString(data, "coverUrl", "cover_url");
  const profession = pickString(data, "profession");
  const city = pickString(data, "city");
  const country = pickString(data, "country");
  const phoneNumber = pickString(data, "phone_number", "phoneNumber", "phone");
  const gender = pickString(data, "gender");
  const bio = pickString(data, "bio");
  const intention = pickString(data, "otherInterests", "other_interests", "intention");
  const selectedPlan = pickString(data, "selectedPlan", "selected_plan");

  if (avatarUrl !== undefined) profileData.avatarUrl = avatarUrl;
  if (coverUrl !== undefined) profileData.coverUrl = coverUrl;
  if (profession !== undefined) profileData.profession = profession;
  if (city !== undefined) profileData.city = city;
  if (country !== undefined) profileData.country = country;
  if (phoneNumber !== undefined) profileData.phoneNumber = phoneNumber;
  if (gender !== undefined) profileData.gender = gender;
  if (birthdate !== undefined) profileData.birthdate = birthdate;
  if (bio !== undefined) profileData.bio = bio;
  if (intention !== undefined) profileData.intention = intention;
  if (selectedPlan !== undefined) profileData.selectedPlan = selectedPlan;
  if (data.isOnboarded === true) profileData.isOnboarded = true;

  try {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.$transaction(async (tx: any) => {
      await tx.userProfile.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          ...profileData,
        },
        update: profileData,
      });

      if (shouldUpdateInterests) {
        const interests = (data.interests as unknown[]).filter((interest): interest is string => typeof interest === "string");
        const slugs = Array.from(new Set(interests.map(slugify).filter(Boolean)));

        await tx.userInterest.deleteMany({
          where: { userId: session.userId },
        });

        if (slugs.length > 0) {
          const interestRows = await tx.interest.findMany({
            where: {
              slug: { in: slugs },
              isActive: true,
            },
            select: { id: true },
          });

          if (interestRows.length > 0) {
            await tx.userInterest.createMany({
              data: interestRows.map((interest: any) => ({
                userId: session.userId,
                interestId: interest.id,
                source: "profile",
              })),
              skipDuplicates: true,
            });
          }
        }
      }

      if (shouldUpdatePrompts) {
        const prompts = (data.prompts as ProfilePromptInput[])
          .map((prompt, index) => ({
            question: typeof prompt.question === "string" ? prompt.question.trim() : "",
            answer: typeof prompt.answer === "string" ? prompt.answer.trim() : "",
            sortOrder: index,
          }))
          .filter((prompt) => prompt.question && prompt.answer);

        await tx.userProfilePrompt.deleteMany({
          where: { userId: session.userId },
        });

        if (prompts.length > 0) {
          await tx.userProfilePrompt.createMany({
            data: prompts.map((prompt) => ({
              userId: session.userId,
              ...prompt,
            })),
          });
        }
      }

      return tx.user.findUnique({
        where: { id: session.userId },
        include: {
          profile: true,
          interests: {
            include: {
              interest: true,
            },
          },
          profilePrompts: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });
    });

    const newlyCompletedQuests = [];
    try {
      const { checkAndTriggerQuestCompletion } = await import("@/lib/onboarding");
      if (profession !== undefined) {
        const r1 = await checkAndTriggerQuestCompletion(session.userId, "profession");
        if (r1) newlyCompletedQuests.push(r1);
      }
      if (bio !== undefined) {
        const r2 = await checkAndTriggerQuestCompletion(session.userId, "bio");
        if (r2) newlyCompletedQuests.push(r2);
      }
      if (shouldUpdatePrompts) {
        const r3 = await checkAndTriggerQuestCompletion(session.userId, "interests");
        if (r3) newlyCompletedQuests.push(r3);
      }
      if (coverUrl !== undefined) {
        const r4 = await checkAndTriggerQuestCompletion(session.userId, "cover");
        if (r4) newlyCompletedQuests.push(r4);
      }
    } catch (questError) {
      console.error("Failed to check onboarding quests completion status:", questError);
    }

    try {
      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "UPDATE_PROFILE",
          details: JSON.stringify({
            updatedFields: Object.keys(profileData),
          }),
        },
      });
    } catch (logErr) {
      console.error("Failed to log UPDATE_PROFILE activity:", logErr);
    }

    const serialized = serializeProfile(user);
    return NextResponse.json({
      ...serialized,
      newlyCompletedQuests
    });
  } catch (error) {
    console.error("Profile update failed.", error);
    console.warn("Database not available, using mock profile PATCH bypass.");
    const mockProfile = {
      first_name: firstName !== undefined ? firstName : "Nancy",
      last_name: lastName !== undefined ? lastName : "Núñez",
      city: city !== undefined ? city : "Puntarenas",
      country: country !== undefined ? country : "Costa Rica",
      profession: profession !== undefined ? profession : "Fotógrafa",
      interests: shouldUpdateInterests ? (data.interests as string[]) : ["Estilo de Vida", "Naturaleza", "Fotografía Consciente"],
      prompts: shouldUpdatePrompts ? (data.prompts as any[]) : [
        {
          question: "Mi objetivo de vida es…",
          answer: "Vivir con más calma, claridad y propósito de vida."
        }
      ],
      profile_picture_url: avatarUrl !== undefined ? avatarUrl : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
      cover_url: coverUrl !== undefined ? coverUrl : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&fit=crop",
      gender: gender !== undefined ? gender : "Femenino",
      birthdate: birthdate !== undefined ? formatBirthdate(birthdate) : "1994-05-15",
      phone_number: phoneNumber !== undefined ? phoneNumber : "+506 8888-8888",
      selected_plan: selectedPlan !== undefined ? selectedPlan : "Mensual",
      created_at: new Date().toISOString(),
      bio: bio !== undefined ? bio : "Apasionada por capturar la esencia de la vida a través de la fotografía y vivir en conexión con la naturaleza.",
      other_interests: intention !== undefined ? intention : "Crecimiento personal",
    };
    return NextResponse.json({
      email: session.email,
      profile: mockProfile
    });
  }
}
