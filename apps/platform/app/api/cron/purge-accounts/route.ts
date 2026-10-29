import { NextResponse } from "next/server";
import { syncCognitoUserStatus } from "@/lib/auth/cognito-admin";
import { deleteUserS3Data } from "@/lib/storage/userStorageCleanup";

export const runtime = "nodejs";

async function executePurge(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const now = new Date();

    // Query users whose 90-day grace period has elapsed
    const usersToPurge = await prisma.user.findMany({
      where: {
        status: "deleted",
        purgeAt: { lte: now },
      },
      select: {
        id: true,
        email: true,
        cognitoSub: true,
        identities: {
          select: { provider: true, providerSubject: true },
        },
      },
      take: 50,
    });

    if (usersToPurge.length === 0) {
      return NextResponse.json({ success: true, purgedCount: 0, message: "No hay cuentas pendientes de purga." });
    }

    let purgedCount = 0;
    for (const user of usersToPurge) {
      try {
        // 1. Delete associated files from AWS S3 (avatars, feed images, resumes)
        await deleteUserS3Data(user.id).catch((err) =>
          console.error(`[cron/purge] Error cleaning S3 for ${user.id}:`, err)
        );

        // 2. Delete identity from AWS Cognito User Pool
        await syncCognitoUserStatus(user as any, "deleted").catch((err) =>
          console.error(`[cron/purge] Error removing Cognito user ${user.email}:`, err)
        );

        // 3. Remove user record and cascade relational rows in Postgres
        await prisma.user.delete({ where: { id: user.id } });
        purgedCount++;
      } catch (err) {
        console.error(`[cron/purge] Failed to purge user ${user.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      purgedCount,
      totalCandidates: usersToPurge.length,
    });
  } catch (error) {
    console.error("[cron/purge] Execution error:", error);
    return NextResponse.json({ message: "Error al ejecutar purga de cuentas." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return executePurge(req);
}

export async function POST(req: Request) {
  return executePurge(req);
}
