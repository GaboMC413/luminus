import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentSession } from "@/lib/auth/session";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No estás autenticado." }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const reason = typeof body?.reason === "string" ? body.reason.trim() : null;
    const feedback = typeof body?.feedback === "string" ? body.feedback.trim() : null;

    const { prisma } = await import("@/lib/db");

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        tier: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    let paidUntil: Date | null = null;

    // 1. If user has an active Stripe subscription, cancel future renewals at period end
    if (user.stripeSubscriptionId && !user.stripeSubscriptionId.startsWith("sub_mock_") && stripe) {
      try {
        const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

        if (sub.status === "active" || sub.status === "trialing") {
          await stripe.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: true,
            metadata: {
              account_closed_at: new Date().toISOString(),
              closure_reason: reason || "No especificado",
            },
          });

          const rawPeriodEnd = (sub as any).current_period_end || (sub as any).items?.data?.[0]?.current_period_end;
          if (rawPeriodEnd && typeof rawPeriodEnd === "number") {
            paidUntil = new Date(rawPeriodEnd * 1000);
          }
        }
      } catch (stripeErr) {
        console.error("[account/close] Failed to cancel subscription renewal in Stripe:", stripeErr);
      }
    }

    // 2. Compute 90-day grace period
    const now = new Date();
    // If user has paid time remaining, the 90 days grace starts after their paid period ends
    const baseDate = paidUntil && paidUntil > now ? paidUntil : now;
    const purgeAt = new Date(baseDate.getTime() + 90 * 24 * 60 * 60 * 1000);

    // 3. Mark user as soft-deleted / closed
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: "deleted",
        closedAt: now,
        purgeAt,
        paidUntil,
        closureReason: reason,
        closureFeedback: feedback,
      },
    });

    // 4. Log out user immediately
    await clearSessionCookie();

    return NextResponse.json({
      success: true,
      message: "Tu cuenta ha sido cerrada correctamente.",
      paidUntil: paidUntil ? paidUntil.toISOString() : null,
      purgeAt: purgeAt.toISOString(),
    });
  } catch (error) {
    console.error("[account/close] Account closure failed:", error);
    return NextResponse.json(
      { message: "No pudimos procesar el cierre de tu cuenta. Por favor intenta de nuevo." },
      { status: 500 }
    );
  }
}
