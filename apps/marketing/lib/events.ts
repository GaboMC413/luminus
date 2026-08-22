import { prisma } from "./db";

export { prisma };

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
