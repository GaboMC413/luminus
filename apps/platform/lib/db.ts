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

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
