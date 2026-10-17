import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const { subscriptionId, customerId } = body || {};

    const { prisma } = await import("@/lib/db");
    const now = new Date();

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        tier: "BASIC",
        memberSince: now,
        stripeCustomerId: customerId ? String(customerId) : undefined,
        stripeSubscriptionId: subscriptionId ? String(subscriptionId) : undefined,
        profile: {
          update: {
            selectedPlan: "Monthly",
          },
        },
      },
      include: { profile: true },
    });

    try {
      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "MEMBERSHIP_ACTIVATED",
          details: JSON.stringify({
            tier: "BASIC",
            subscriptionId,
            timestamp: now.toISOString(),
          }),
        },
      });
    } catch (logErr) {
      console.error("Failed to log membership activation:", logErr);
    }

    return NextResponse.json({
      success: true,
      tier: updatedUser.tier,
      memberSince: updatedUser.memberSince,
    });
  } catch (error: any) {
    console.error("Confirm membership failed:", error);
    return NextResponse.json(
      { message: error.message || "Error al confirmar la membresía." },
      { status: 500 }
    );
  }
}
