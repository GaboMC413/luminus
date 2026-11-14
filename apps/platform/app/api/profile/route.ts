import { NextResponse, after } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { ensureS3AvatarUrl } from "@/lib/ensureS3AvatarUrl";
import { deleteS3FileByUrl } from "@/lib/storage/s3FileCleanup";
import {
  normalizeInstagramInput,
  normalizeLinkedinInput,
  normalizeWebsiteUrl,
} from "@/utils/socialLinks";

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
    tier: user.tier ?? "FREE",
    memberSince: user.memberSince?.toISOString?.() ?? null,
    member_since: user.memberSince?.toISOString?.() ?? null,
    stripeSubscriptionId: user.stripeSubscriptionId ?? null,
    stripeCustomerId: user.stripeCustomerId ?? null,
    role: user.role ?? "USER",
    profile: {
      role: user.role ?? "USER",
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
      member_since: user.memberSince?.toISOString?.() ?? null,
      tier: user.tier ?? "FREE",
      bio: profile.bio ?? "",
      other_interests: profile.intention ?? "",
      isOnboarded: profile.isOnboarded ?? false,
      is_onboarded: profile.isOnboarded ?? false,
      specialistProfile: user.specialistProfile || null,
    },
  };
}

export async function GET() {
  const session = await getCurrentSession();

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
        specialistProfile: {
          include: {
            courses: {
              where: { isActive: true },
            },
            spaces: {
              where: { isActive: true },
              include: {
                category: true,
                spaceCategories: {
                  include: { category: true },
                },
                services: {
                  include: { category: true },
                },
                availability: {
                  where: { isActive: true },
                  orderBy: { dayOfWeek: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    return NextResponse.json(serializeProfile(user));
  } catch (error) {
    console.error("Profile read failed.", error);
    return NextResponse.json({ message: "No fue posible cargar el perfil." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();

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

  if ((data.first_name !== undefined || data.firstName !== undefined) && !firstName) {
    return NextResponse.json({ message: "El nombre no puede estar vacío." }, { status: 400 });
  }
  if ((data.last_name !== undefined || data.lastName !== undefined) && !lastName) {
    return NextResponse.json({ message: "El apellido no puede estar vacío." }, { status: 400 });
  }
  if (data.city !== undefined && !pickString(data, "city")) {
    return NextResponse.json({ message: "La ciudad no puede estar vacía." }, { status: 400 });
  }
  if ((data.birthdate !== undefined || data.birthdateString !== undefined) && !birthdate) {
    return NextResponse.json({ message: "La fecha de nacimiento es inválida o no puede estar vacía." }, { status: 400 });
  }

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

  if (avatarUrl !== undefined) {
    profileData.avatarUrl = await ensureS3AvatarUrl(avatarUrl, session.userId);
  }
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

    const existingProfile = prisma.userProfile?.findUnique
      ? await prisma.userProfile.findUnique({
          where: { userId: session.userId },
          select: { avatarUrl: true },
        })
      : null;

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

      if (intention) {
        await tx.categorySuggestion.create({
          data: {
            userId: session.userId,
            type: "USER_INTEREST",
            name: intention,
            status: "pending",
          },
        });
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

      if (data.specialistProfile && typeof data.specialistProfile === "object") {
        const sp = data.specialistProfile as Record<string, unknown>;
        const spUpdate: Record<string, unknown> = {};
        if (typeof sp.specialty === "string") spUpdate.specialty = sp.specialty.trim() || null;
        if (typeof sp.title === "string") spUpdate.title = sp.title.trim() || null;
        if (typeof sp.bio === "string") spUpdate.bio = sp.bio.trim() || null;
        if (typeof sp.institution === "string") spUpdate.institution = sp.institution.trim() || null;
        if (typeof sp.instagramUrl === "string") {
          const val = sp.instagramUrl.trim();
          spUpdate.instagramUrl = val ? (normalizeInstagramInput(val) ?? val) : null;
        }
        if (typeof sp.linkedinUrl === "string") {
          const val = sp.linkedinUrl.trim();
          spUpdate.linkedinUrl = val ? (normalizeLinkedinInput(val) ?? val) : null;
        }
        if (typeof sp.websiteUrl === "string") {
          const val = sp.websiteUrl.trim();
          spUpdate.websiteUrl = val ? (normalizeWebsiteUrl(val) ?? val) : null;
        }
        if (Array.isArray(sp.selectedAreas)) {
          spUpdate.selectedAreas = sp.selectedAreas
            .filter((area): area is string => typeof area === "string" && area.trim().length > 0)
            .map((area) => area.trim());
        }

        const existingSp = await tx.specialistProfile.findUnique({
          where: { userId: session.userId },
          select: { userId: true },
        });

        if (existingSp) {
          if (Object.keys(spUpdate).length > 0) {
            await tx.specialistProfile.update({
              where: { userId: session.userId },
              data: spUpdate,
            });
          }

          if (Array.isArray(sp.spaces)) {
            const incomingSpaces = sp.spaces as Array<Record<string, unknown>>;
            const keptIds: string[] = [];

            const allDbCategories = await tx.interestCategory.findMany();
            const categoryMap = new Map<string, string>();
            for (const cat of allDbCategories) {
              categoryMap.set(cat.name.toLowerCase(), cat.id);
            }

            for (const item of incomingSpaces) {
              const name = typeof item.name === "string" ? item.name.trim() : "";
              if (!name) continue;

              const rawCategories = Array.isArray(item.spaceCategories)
                ? (item.spaceCategories as unknown[]).filter((c): c is string => typeof c === "string" && c.trim() !== "")
                : [];
              const primaryCategoryName =
                rawCategories[0] ||
                (typeof item.categoryArea === "string" ? item.categoryArea.trim() || null : null);
              const primaryCategoryId = primaryCategoryName
                ? categoryMap.get(primaryCategoryName.toLowerCase()) || null
                : null;

              const spaceData = {
                name,
                spaceType: typeof item.spaceType === "string" ? item.spaceType.trim() || "Consultorio" : "Consultorio",
                customSpaceType: typeof item.customSpaceType === "string" ? item.customSpaceType.trim() || null : null,
                categoryArea: primaryCategoryName,
                categoryId: primaryCategoryId,
                description: typeof item.description === "string" ? item.description.trim() || null : null,
                address: typeof item.address === "string" ? item.address.trim() || null : null,
                city: typeof item.city === "string" ? item.city.trim() || null : null,
                country: typeof item.country === "string" ? item.country.trim() || null : null,
                lat: item.lat !== null && item.lat !== undefined && !Number.isNaN(Number(item.lat)) ? Number(item.lat) : null,
                lng: item.lng !== null && item.lng !== undefined && !Number.isNaN(Number(item.lng)) ? Number(item.lng) : null,
                googlePlaceId: typeof item.googlePlaceId === "string" ? item.googlePlaceId.trim() || null : null,
                phone: typeof item.phone === "string" ? item.phone.trim() || null : null,
                website: typeof item.website === "string" ? item.website.trim() || null : null,
                googleMapsUrl: typeof item.googleMapsUrl === "string" ? item.googleMapsUrl.trim() || null : null,
                coverUrl: typeof item.coverUrl === "string" ? item.coverUrl.trim() || null : null,
                isActive: true,
              };

              let spaceId: string | null = null;
              if (typeof item.id === "string" && item.id) {
                const owned = await tx.specialistSpace.findFirst({
                  where: { id: item.id, userId: session.userId },
                  select: { id: true },
                });
                if (owned) {
                  await tx.specialistSpace.update({
                    where: { id: owned.id },
                    data: spaceData,
                  });
                  spaceId = owned.id;
                }
              }

              if (!spaceId) {
                const created = await tx.specialistSpace.create({
                  data: {
                    userId: session.userId,
                    ...spaceData,
                  },
                  select: { id: true },
                });
                spaceId = created.id;
              }

              keptIds.push(spaceId as string);

              if (Array.isArray(item.spaceCategories)) {
                await tx.specialistSpaceCategory.deleteMany({ where: { spaceId } });
                const categoryIds = rawCategories
                  .map((c) => categoryMap.get(c.trim().toLowerCase()))
                  .filter((id): id is string => Boolean(id));
                if (categoryIds.length > 0) {
                  await tx.specialistSpaceCategory.createMany({
                    data: categoryIds.map((catId) => ({ spaceId, categoryId: catId })),
                    skipDuplicates: true,
                  });
                }
              }

              if (Array.isArray(item.spaceServices)) {
                await tx.specialistSpaceService.deleteMany({ where: { spaceId } });
                const rawServices = item.spaceServices as Array<{ name?: unknown; categoryName?: unknown; isCustom?: unknown }>;
                const servicesToInsert = rawServices
                  .map((svc) => {
                    const svcName = typeof svc.name === "string" ? svc.name.trim() : "";
                    const catName = typeof svc.categoryName === "string" ? svc.categoryName.trim() : "";
                    const matchedId = categoryMap.get(catName.toLowerCase()) || primaryCategoryId;
                    if (!svcName || !matchedId) return null;
                    return {
                      spaceId,
                      categoryId: matchedId,
                      name: svcName,
                      isCustom: Boolean(svc.isCustom),
                    };
                  })
                  .filter((svc): svc is { spaceId: string; categoryId: string; name: string; isCustom: boolean } => Boolean(svc));
                if (servicesToInsert.length > 0) {
                  await tx.specialistSpaceService.createMany({
                    data: servicesToInsert,
                    skipDuplicates: true,
                  });
                }
              }
            }

            await tx.specialistSpace.updateMany({
              where: {
                userId: session.userId,
                isActive: true,
                ...(keptIds.length > 0 ? { id: { notIn: keptIds } } : {}),
              },
              data: { isActive: false },
            });
          }

          if (Array.isArray(sp.courses)) {
            const incomingCourses = (sp.courses as Array<Record<string, unknown>>)
              .map((c) => ({
                name: typeof c.name === "string" ? c.name.trim() : "",
                type: typeof c.type === "string" ? c.type.trim() || "CURSO" : "CURSO",
                description: typeof c.description === "string" ? c.description.trim() || null : null,
                modality: typeof c.modality === "string" ? c.modality.trim() || null : null,
                url: typeof c.url === "string" ? c.url.trim() || null : null,
                coverUrl: typeof c.coverUrl === "string" ? c.coverUrl.trim() || null : null,
                institution: typeof c.institution === "string" ? c.institution.trim() || null : null,
                isActive: true,
              }))
              .filter((c) => c.name.length > 0);

            await tx.specialistCourse.deleteMany({
              where: { userId: session.userId },
            });

            if (incomingCourses.length > 0) {
              await tx.specialistCourse.createMany({
                data: incomingCourses.map((c) => ({
                  userId: session.userId,
                  ...c,
                })),
              });
            }
          }

          if (Array.isArray(sp.availability)) {
            const slots = (sp.availability as Array<Record<string, unknown>>)
              .map((slot) => ({
                dayOfWeek: typeof slot.dayOfWeek === "number" ? slot.dayOfWeek : -1,
                startTime: typeof slot.startTime === "string" ? slot.startTime.trim() : "",
                endTime: typeof slot.endTime === "string" ? slot.endTime.trim() : "",
              }))
              .filter((slot) => slot.dayOfWeek >= 0 && slot.dayOfWeek <= 6 && slot.startTime && slot.endTime);

            let primarySpace = await tx.specialistSpace.findFirst({
              where: { userId: session.userId, isActive: true },
              orderBy: { createdAt: "asc" },
              select: { id: true },
            });

            if (!primarySpace && slots.length > 0) {
              primarySpace = await tx.specialistSpace.create({
                data: {
                  userId: session.userId,
                  name: "Atención Online / Consultorio",
                  spaceType: "CONSULTORIO",
                  isActive: true,
                },
                select: { id: true },
              });
            }

            if (primarySpace) {
              const allSpaces = await tx.specialistSpace.findMany({
                where: { userId: session.userId },
                select: { id: true },
              });
              const spaceIds = allSpaces.map((item: { id: string }) => item.id);
              if (spaceIds.length > 0) {
                await tx.specialistAvailability.deleteMany({
                  where: { spaceId: { in: spaceIds } },
                });
              }

              if (slots.length > 0) {
                await tx.specialistAvailability.createMany({
                  data: slots.map((slot) => ({
                    spaceId: primarySpace!.id,
                    dayOfWeek: slot.dayOfWeek,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    isActive: true,
                  })),
                });
              }
            }
          }
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
          specialistProfile: {
            include: {
              courses: {
                where: { isActive: true },
              },
              spaces: {
                where: { isActive: true },
                include: {
                  category: true,
                  spaceCategories: {
                    include: { category: true },
                  },
                  services: {
                    include: { category: true },
                  },
                  availability: {
                    where: { isActive: true },
                    orderBy: { dayOfWeek: "asc" },
                  },
                },
              },
            },
          },
        },
      });
    }, { maxWait: 10000, timeout: 15000 });

    const newlyCompletedQuests: any[] = [];
    try {
      const { checkAndTriggerQuestsCompletion } = await import("@/lib/onboarding");
      const questCandidates: string[] = [];
      if (profession !== undefined) questCandidates.push("profession");
      if (bio !== undefined) questCandidates.push("bio");
      if (shouldUpdatePrompts) questCandidates.push("interests");
      if (coverUrl !== undefined) questCandidates.push("cover");
      if (shouldUpdateInterests || intention !== undefined) questCandidates.push("user_interests");

      if (questCandidates.length > 0) {
        const completed = await checkAndTriggerQuestsCompletion(session.userId, questCandidates, user);
        newlyCompletedQuests.push(...completed);
      }
    } catch (questError) {
      console.error("Failed to check onboarding quests completion status:", questError);
    }

    const runSideEffects = async () => {
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

      if (
        profileData.avatarUrl !== undefined &&
        existingProfile?.avatarUrl &&
        existingProfile.avatarUrl !== profileData.avatarUrl
      ) {
        try {
          await deleteS3FileByUrl(existingProfile.avatarUrl, {
            expectedUserId: session.userId,
            expectedFolder: "avatars",
          });
        } catch (s3Err) {
          console.error("Failed to clean up old avatar from S3:", s3Err);
        }
      }
    };
    try { after(runSideEffects); } catch { void runSideEffects(); }

    const serialized = serializeProfile(user);
    return NextResponse.json({
      ...serialized,
      newlyCompletedQuests
    });
  } catch (error) {
    console.error("Profile update failed.", error);
    const detail =
      process.env.NODE_ENV !== "production" && error instanceof Error
        ? error.message
        : undefined;
    return NextResponse.json(
      { message: "No fue posible actualizar el perfil.", ...(detail ? { detail } : {}) },
      { status: 500 }
    );
  }
}
