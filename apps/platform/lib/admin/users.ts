import type { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import { isUuid } from "@/utils/validation";

export { isUuid };

function toDate(value: Date | null) {
  return value ? value.toISOString() : null;
}

export function serializeAdminUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    isGhost: user.isGhost ?? false,
    emailVerified: user.emailVerified,
    authProvider: user.authProvider,
    tier: user.tier ?? "FREE",
    stripeCustomerId: user.stripeCustomerId ?? null,
    stripeSubscriptionId: user.stripeSubscriptionId ?? null,
    memberSince: toDate(user.memberSince),
    createdAt: toDate(user.createdAt),
    updatedAt: toDate(user.updatedAt),
    lastLoginAt: toDate(user.lastLoginAt),
    profile: {
      firstName: user.profile?.firstName ?? "",
      lastName: user.profile?.lastName ?? "",
      fullName: user.profile?.fullName ?? "",
      avatarUrl: user.profile?.avatarUrl ?? "",
      profession: user.profile?.profession ?? "",
      city: user.profile?.city ?? "",
      country: user.profile?.country ?? "",
      phoneNumber: user.profile?.phoneNumber ?? "",
      gender: user.profile?.gender ?? "",
      birthdate: user.profile?.birthdate ? user.profile.birthdate.toISOString().slice(0, 10) : "",
      bio: user.profile?.bio ?? "",
      intention: user.profile?.intention ?? "",
      selectedPlan: user.profile?.selectedPlan ?? "",
      isOnboarded: user.profile?.isOnboarded ?? false,
    },
    interests: (user.interests || []).map((item: any) => ({
      id: item.interest.id,
      name: item.interest.name,
      slug: item.interest.slug,
      category: item.interest.category?.name ?? "",
    })),
    prompts: (user.profilePrompts || []).map((p: any) => ({
      id: p.id,
      question: p.question,
      answer: p.answer,
    })),
  };
}

export async function listAdminUsers(prisma: PrismaClient, search = "") {
  const query = search.trim();

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { profile: { firstName: { contains: query, mode: "insensitive" } } },
            { profile: { lastName: { contains: query, mode: "insensitive" } } },
            { profile: { profession: { contains: query, mode: "insensitive" } } },
            { profile: { city: { contains: query, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      profile: true,
      interests: {
        include: {
          interest: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      profilePrompts: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return users.map(serializeAdminUser);
}

export function normalizeAdminUserPatch(input: unknown) {
  if (!input || typeof input !== "object") {
    return { ok: false as const, message: "Datos invalidos." };
  }

  const body = input as Record<string, unknown>;

  if (!isUuid(body.id)) {
    return { ok: false as const, message: "Usuario invalido." };
  }

  const rawUserData =
    body.userData && typeof body.userData === "object"
      ? (body.userData as Record<string, unknown>)
      : body;
  const rawProfileData =
    body.profileData && typeof body.profileData === "object"
      ? (body.profileData as Record<string, unknown>)
      : body;

  const userData: { role?: UserRole; status?: UserStatus; isGhost?: boolean; email?: string } = {};
  const profileData: Record<string, string | boolean | Date | null> = {};

  const roleCandidate = rawUserData.role ?? body.role;
  if (roleCandidate === "USER" || roleCandidate === "ADMIN") {
    userData.role = roleCandidate;
  }

  const statusCandidate = rawUserData.status ?? body.status;
  if (statusCandidate === "active" || statusCandidate === "disabled" || statusCandidate === "deleted") {
    userData.status = statusCandidate;
  }

  const ghostCandidate = rawUserData.isGhost ?? body.isGhost;
  if (typeof ghostCandidate === "boolean") {
    userData.isGhost = ghostCandidate;
  }

  const emailCandidate = rawUserData.email ?? body.email;
  if (typeof emailCandidate === "string" && emailCandidate.trim()) {
    const cleanEmail = emailCandidate.trim().toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      userData.email = cleanEmail;
    }
  }

  const profileFields = [
    "firstName",
    "lastName",
    "avatarUrl",
    "profession",
    "city",
    "country",
    "phoneNumber",
    "bio",
    "intention",
    "selectedPlan",
  ];

  for (const field of profileFields) {
    const val = rawProfileData[field] ?? body[field];
    if (typeof val === "string") {
      profileData[field] = val.trim() || "";
    }
  }

  const onboardedCandidate = rawProfileData.isOnboarded ?? body.isOnboarded;
  if (typeof onboardedCandidate === "boolean") {
    profileData.isOnboarded = onboardedCandidate;
  }

  const birthdateCandidate = rawProfileData.birthdate ?? body.birthdate;
  if (typeof birthdateCandidate === "string") {
    profileData.birthdate = birthdateCandidate ? new Date(`${birthdateCandidate}T00:00:00.000Z`) : null;
  }

  if (typeof profileData.firstName === "string" || typeof profileData.lastName === "string") {
    const firstName = typeof profileData.firstName === "string" ? profileData.firstName : "";
    const lastName = typeof profileData.lastName === "string" ? profileData.lastName : "";
    profileData.fullName = `${firstName} ${lastName}`.trim();
  }

  return {
    ok: true as const,
    id: body.id as string,
    userData,
    profileData,
  };
}
