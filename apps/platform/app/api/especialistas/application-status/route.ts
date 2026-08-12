import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = getCurrentSession();
  if (!session) {
    return NextResponse.json({ hasApplication: false, status: null });
  }

  try {

    // Fetch user details for email
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true },
    });

    // Fetch latest postulation/application
    const postulation = await prisma.specialistPostulation.findFirst({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    if (!postulation) {
      return NextResponse.json({
        hasApplication: false,
        status: null,
        email: user?.email || null,
      });
    }

    // Map Prisma enum status to application status strings
    let statusString = "pending_review";
    if (postulation.status === "accepted") {
      statusString = "approved";
    } else if (postulation.status === "declined") {
      statusString = "rejected";
    }

    return NextResponse.json({
      hasApplication: true,
      status: statusString,
      createdAt: postulation.createdAt.toISOString(),
      email: user?.email || null,
    });
  } catch (error) {
    console.error("Failed to fetch application status:", error);
    return NextResponse.json({ hasApplication: false, status: null }, { status: 500 });
  }
}
