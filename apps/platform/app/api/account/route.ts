import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentSession } from "@/lib/auth/session";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function DELETE(req: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No estás autenticado." }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, stripeSubscriptionId: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    let paidUntil: Date | null = null;
    if (user.stripeSubscriptionId && !user.stripeSubscriptionId.startsWith("sub_mock_") && stripe) {
      try {
        const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        if (sub.status === "active" || sub.status === "trialing") {
          await stripe.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: true,
          });
          const rawPeriodEnd = (sub as any).current_period_end || (sub as any).items?.data?.[0]?.current_period_end;
          if (rawPeriodEnd && typeof rawPeriodEnd === "number") {
            paidUntil = new Date(rawPeriodEnd * 1000);
          }
        }
      } catch (err) {
        console.error("[account/DELETE] Stripe error:", err);
      }
    }

    const now = new Date();
    const baseDate = paidUntil && paidUntil > now ? paidUntil : now;
    const purgeAt = new Date(baseDate.getTime() + 90 * 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: "deleted",
        closedAt: now,
        purgeAt,
        paidUntil,
      },
    });

    clearSessionCookie();

    return NextResponse.json({ success: true, message: "Cuenta cerrada correctamente." });
  } catch (error) {
    console.error("Account closure failed:", error);
    return NextResponse.json({ message: "No pudimos procesar el cierre de la cuenta." }, { status: 500 });
  }
}
