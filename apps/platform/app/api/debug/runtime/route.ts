import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeError(message: string): string {
  let sanitized = message
    .replace(/postgresql:\/\/[^\s"']+/gi, "postgresql://[REDACTED]")
    .replace(/postgres:\/\/[^\s"']+/gi, "postgres://[REDACTED]")
    .replace(/password=[^\s&"']+/gi, "password=[REDACTED]");

  if (process.env.DATABASE_URL) {
    sanitized = sanitized.split(process.env.DATABASE_URL).join("[REDACTED_DATABASE_URL]");
  }

  return sanitized;
}

export async function GET() {
  if (process.env.ENABLE_RUNTIME_DEBUG !== "true") {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  let prismaConnection = {
    success: false,
    errorName: null as string | null,
    errorCode: null as string | null,
    errorMessage: null as string | null,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    prismaConnection.success = true;
  } catch (err: any) {
    prismaConnection.success = false;
    prismaConnection.errorName = err?.name || err?.constructor?.name || "Error";
    prismaConnection.errorCode = err?.code || null;
    const rawMessage = err?.message || String(err);
    prismaConnection.errorMessage = sanitizeError(rawMessage);
  }

  return NextResponse.json({
    databaseUrl: {
      configured: Boolean(process.env.DATABASE_URL),
    },
    prismaConnection,
  });
}

