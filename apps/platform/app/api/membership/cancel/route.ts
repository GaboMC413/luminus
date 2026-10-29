import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const reason = typeof body?.reason === "string" ? body.reason : undefined;
    if (reason) {
      console.log(`[cancel] User ${session.userId} cancellation reason:`, reason);
    }

    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, stripeSubscriptionId: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    if (user.stripeSubscriptionId && !user.stripeSubscriptionId.startsWith("sub_mock_") && stripe) {
      try {
        const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

        // If subscription is already fully canceled in Stripe
        if (sub.status === "canceled") {
          await prisma.user.update({
            where: { id: user.id },
            data: { tier: "FREE" },
          }).catch(() => {});

          return NextResponse.json({
            success: true,
            alreadyCanceled: true,
            message: "Tu membresía ya ha sido cancelada.",
          });
        }

        // If subscription is already scheduled to cancel at period end
        if (sub.cancel_at_period_end) {
          if (reason) {
            await stripe.subscriptions.update(user.stripeSubscriptionId, {
              metadata: { cancellation_reason: reason },
            }).catch(() => {});
          }
          return NextResponse.json({
            success: true,
            alreadyScheduled: true,
            message: "Tu membresía ya está configurada para no renovarse.",
          });
        }

        // If subscription is attached to a schedule, release it before setting cancel_at_period_end
        const scheduleId = typeof sub.schedule === "string" ? sub.schedule : (sub.schedule as any)?.id;
        if (scheduleId) {
          try {
            await stripe.subscriptionSchedules.release(scheduleId);
          } catch (schedErr) {
            console.warn("[cancel] Could not release subscription schedule:", schedErr);
          }
        }

        // Active subscription: schedule cancellation at the end of the current period
        await stripe.subscriptions.update(user.stripeSubscriptionId, {
          cancel_at_period_end: true,
          metadata: reason ? { cancellation_reason: reason } : undefined,
        });
      } catch (stripeErr: any) {
        // If Stripe indicates it's already canceled
        if (
          stripeErr?.message?.includes("canceled subscription") ||
          stripeErr?.code === "resource_missing"
        ) {
          await prisma.user.update({
            where: { id: user.id },
            data: { tier: "FREE" },
          }).catch(() => {});

          return NextResponse.json({
            success: true,
            alreadyCanceled: true,
            message: "Tu membresía ya ha sido cancelada.",
          });
        }
        throw stripeErr;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Tu membresía no se renovará al finalizar tu ciclo actual.",
    });
  } catch (error: any) {
    console.error("[cancel] Error:", error);
    const rawMsg = error?.message || "";
    let friendlyMessage = "Error al procesar la cancelación. Por favor, intenta de nuevo.";
    if (rawMsg.includes("canceled subscription")) {
      friendlyMessage = "Esta membresía ya se encuentra cancelada.";
    }
    return NextResponse.json(
      { message: friendlyMessage },
      { status: 500 }
    );
  }
}
