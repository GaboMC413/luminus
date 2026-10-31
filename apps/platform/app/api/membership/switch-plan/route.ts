import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { stripe, getOrCreateMembershipPrice } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const targetInterval = body?.targetInterval === "year" ? "year" : body?.targetInterval === "month" ? "month" : null;

    if (!targetInterval) {
      return NextResponse.json({ message: "Intervalo inválido. Debe ser 'month' o 'year'." }, { status: 400 });
    }

    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, stripeSubscriptionId: true, tier: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    const newPlanName = targetInterval === "year" ? "Annual" : "Monthly";

    // Handle mock mode
    if (!stripe || !user.stripeSubscriptionId || user.stripeSubscriptionId.startsWith("sub_mock_")) {
      return NextResponse.json({
        success: true,
        message: targetInterval === "year"
          ? "Tu plan cambiará a Mecenas Anual al finalizar tu ciclo actual."
          : "Tu plan cambiará a Mecenas Mensual al finalizar tu ciclo actual.",
        scheduledChange: targetInterval,
        isMock: true,
      });
    }

    // Retrieve active subscription from Stripe
    const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

    if (sub.status !== "active" && sub.status !== "trialing" && sub.status !== "past_due") {
      return NextResponse.json({
        message: "No se puede cambiar el plan de una membresía inactiva.",
      }, { status: 400 });
    }

    const targetPriceId = await getOrCreateMembershipPrice(targetInterval);

    // Option 1: Schedule transition at period end via Stripe Subscription Schedules
    try {
      let scheduleId = typeof sub.schedule === "string" ? sub.schedule : (sub.schedule as any)?.id;
      if (!scheduleId) {
        const createdSched = await stripe.subscriptionSchedules.create({
          from_subscription: sub.id,
        });
        scheduleId = createdSched.id;
      }

      const currentSched = await stripe.subscriptionSchedules.retrieve(scheduleId);
      const currentPhase = currentSched.phases[0];

      await stripe.subscriptionSchedules.update(scheduleId, {
        end_behavior: "release",
        phases: [
          {
            start_date: currentPhase.start_date,
            end_date: currentPhase.end_date,
            items: currentPhase.items.map((it) => ({
              price: typeof it.price === "string" ? it.price : it.price.id,
              quantity: it.quantity,
            })),
          },
          {
            start_date: currentPhase.end_date,
            items: [{ price: targetPriceId, quantity: 1 }],
            proration_behavior: "none",
          },
        ],
      });
    } catch (schedErr) {
      console.warn("[switch-plan] Could not configure Stripe schedule phases, updating metadata:", schedErr);
    }

    // Update metadata on subscription to track the scheduled transition
    // Note: Do not pass cancel_at_period_end here because Stripe forbids direct cancellation updates when a subscription schedule is attached
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      metadata: {
        ...sub.metadata,
        scheduled_change: targetInterval,
      },
    });

    return NextResponse.json({
      success: true,
      message: targetInterval === "year"
        ? "Tu membresía cambiará a Mecenas Anual al finalizar tu ciclo actual."
        : "Tu membresía cambiará a Mecenas Mensual al finalizar tu ciclo actual.",
      scheduledChange: targetInterval,
    });
  } catch (error: any) {
    console.error("[switch-plan] Error:", error);
    return NextResponse.json(
      { message: error?.message || "Error al programar el cambio de plan." },
      { status: 500 }
    );
  }
}
