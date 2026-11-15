import type { PrismaClient } from "@prisma/client";

const RESERVED_PROFILE_SLUGS = new Set([
  "completar",
  "editar",
  "configuracion",
  "me",
  "mi-perfil",
]);

/**
 * Converts a user's first and last name into a URL-safe kebab-case slug.
 * Falls back to "miembro" if no alphanumeric characters remain.
 */
export function slugifyProfileName(firstName?: string | null, lastName?: string | null): string {
  const raw = `${firstName || ""} ${lastName || ""}`.trim();
  const normalized = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!normalized || RESERVED_PROFILE_SLUGS.has(normalized)) {
    return normalized ? `${normalized}-perfil` : "miembro";
  }

  return normalized;
}

/**
 * Generates a unique slug for a user, appending -2, -3, ... on collisions.
 */
export async function generateUniqueUserSlug(
  prisma: Pick<PrismaClient, "user">,
  firstName?: string | null,
  lastName?: string | null,
  excludeUserId?: string
): Promise<string> {
  const baseSlug = slugifyProfileName(firstName, lastName);

  const existing = await prisma.user.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: { slug: true },
  });

  const taken = new Set(existing.map((row) => row.slug).filter(Boolean));
  if (!taken.has(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  while (taken.has(`${baseSlug}-${counter}`)) {
    counter += 1;
  }

  return `${baseSlug}-${counter}`;
}
