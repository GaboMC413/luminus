import type { PrismaClient, UserRole, UserStatus } from "@prisma/client";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function toDate(value: Date | null) {
  return value ? value.toISOString() : null;
}

export function serializeAdminUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    authProvider: user.authProvider,
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

  const userData: { role?: UserRole; status?: UserStatus } = {};
  const profileData: Record<string, string | boolean | Date | null> = {};

  if (body.role === "USER" || body.role === "ADMIN") {
    userData.role = body.role;
  }

  if (body.status === "active" || body.status === "disabled" || body.status === "deleted") {
    userData.status = body.status;
  }

  const profileFields = [
    "firstName",
    "lastName",
    "profession",
    "city",
    "country",
    "phoneNumber",
    "gender",
    "bio",
    "intention",
    "selectedPlan",
  ];

  for (const field of profileFields) {
    if (typeof body[field] === "string") {
      profileData[field] = body[field].trim() || "";
    }
  }

  if (typeof body.isOnboarded === "boolean") {
    profileData.isOnboarded = body.isOnboarded;
  }

  if (typeof body.birthdate === "string") {
    profileData.birthdate = body.birthdate ? new Date(`${body.birthdate}T00:00:00.000Z`) : null;
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
