import { PrismaClient } from "@prisma/client";

function getDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }
  if (process.env.secrets) {
    try {
      const parsed = JSON.parse(process.env.secrets);
      if (parsed.DATABASE_URL?.trim()) {
        return parsed.DATABASE_URL.trim();
      }
    } catch {
      // Ignore JSON parse error
    }
  }
  return undefined;
}

const dbUrl = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function getDbEvents(options?: { type?: "upcoming" | "past"; slug?: string; id?: string }) {
  try {
    if (options?.slug || options?.id) {
      const event = await prisma.event.findFirst({
        where: options.id
          ? { id: options.id }
          : { slug: options.slug },
      });
      return event;
    }

    const now = new Date();
    let where: Record<string, unknown> = {};

    if (options?.type === "upcoming") {
      where = {
        OR: [
          { isUpcoming: true },
          { date: { gte: now } },
        ],
      };
    } else if (options?.type === "past") {
      where = {
        isUpcoming: false,
        date: { lt: now },
      };
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: options?.type === "upcoming" ? "asc" : "desc" },
    });

    return events;
  } catch (error) {
    console.warn("[getDbEvents] Error querying Prisma events:", error);
    return [];
  }
}
