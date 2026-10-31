import { PrismaClient } from "@prisma/client";

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

if (!process.env.DATABASE_URL && !isBuildPhase) {
  console.error("❌ DATABASE_URL no está definida en runtime");
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
