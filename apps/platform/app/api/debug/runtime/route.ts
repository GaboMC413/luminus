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

async function runTest(testFn: () => Promise<any>) {
  try {
    await testFn();
    return {
      success: true,
      errorName: null as string | null,
      errorCode: null as string | null,
      errorMessage: null as string | null,
    };
  } catch (err: any) {
    return {
      success: false,
      errorName: (err?.name || err?.constructor?.name || "Error") as string | null,
      errorCode: (err?.code || null) as string | null,
      errorMessage: sanitizeError(err?.message || String(err)),
    };
  }
}

export async function GET() {
  if (process.env.ENABLE_RUNTIME_DEBUG !== "true") {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const prismaConnection = await runTest(() => prisma.$queryRaw`SELECT 1`);

  const userProfileTest = await runTest(() =>
    prisma.userProfile.findFirst({
      select: { userId: true },
    })
  );

  const userConnectionTest = await runTest(() =>
    prisma.userConnection.findFirst({
      select: { id: true },
    })
  );

  const communityUserQueryTest = await runTest(() =>
    prisma.user.findFirst({
      select: {
        id: true,
        profile: {
          select: { userId: true },
        },
        interests: {
          take: 1,
          select: {
            interest: {
              select: {
                id: true,
                category: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    })
  );

  return NextResponse.json({
    databaseUrl: {
      configured: Boolean(process.env.DATABASE_URL),
    },
    prismaConnection,
    schemaTests: {
      userProfile: userProfileTest,
      userConnection: userConnectionTest,
      communityUserQuery: communityUserQueryTest,
    },
  });
}


