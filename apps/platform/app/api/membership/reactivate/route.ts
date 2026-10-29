import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  const session = getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, stripeCustomerId: true, stripeSubscriptionId: true, tier: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    // Handle mock mode
    if (!stripe || !user.stripeSubscriptionId || user.stripeSubscriptionId.startsWith("sub_mock_")) {
      await prisma.user.update({
        where: { id: user.id },
        data: { tier: "MECENAS" },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: "¡Tu membresía Mecenas ha sido reactivada exitosamente!",
        isMock: true,
      });
    }

    // Stripe is the single source of truth: Verify customer has a valid payment method
    if (user.stripeCustomerId && !user.stripeCustomerId.startsWith("cus_mock_")) {
      const pms = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: "card",
      });

      if (pms.data.length === 0) {
        return NextResponse.json(
          {
            requiresPaymentMethod: true,
            message: "Debes agregar una tarjeta antes de reactivar tu membresía.",
          },
          { status: 400 }
        );
      }
    }

    const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

    if (sub.status === "canceled") {
      await prisma.user.update({
        where: { id: user.id },
        data: { tier: "FREE" },
      }).catch(() => {});

      return NextResponse.json({
        canReactivate: false,
        message: "Tu membresía ya ha finalizado. Puedes adquirir una nueva membresía en cualquier momento.",
      }, { status: 400 });
    }

    // Resolve default payment method from customer or first card
    let defaultPmId: string | undefined = undefined;
    if (user.stripeCustomerId) {
      try {
        const customer = (await stripe.customers.retrieve(user.stripeCustomerId)) as any;
        defaultPmId = customer?.invoice_settings?.default_payment_method;
      } catch (custErr) {
        console.warn("[reactivate] Could not retrieve customer default PM:", custErr);
      }

      if (!defaultPmId) {
        const pms = await stripe.paymentMethods.list({
          customer: user.stripeCustomerId,
          type: "card",
          limit: 1,
        });
        defaultPmId = pms.data[0]?.id;
      }
    }

    // If subscription is attached to a schedule, release it before updating cancel_at_period_end
    const scheduleId = typeof sub.schedule === "string" ? sub.schedule : (sub.schedule as any)?.id;
    if (scheduleId) {
      try {
        await stripe.subscriptionSchedules.release(scheduleId);
      } catch (schedErr) {
        console.warn("[reactivate] Could not release subscription schedule:", schedErr);
      }
    }

    // Remove scheduled cancellation in Stripe and bind default payment method
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: false,
      ...(defaultPmId ? { default_payment_method: defaultPmId } : {}),
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { tier: "MECENAS" },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "¡Tu membresía Mecenas se renovará automáticamente como antes!",
    });
  } catch (error: any) {
    console.error("[reactivate] Error:", error);
    return NextResponse.json(
      { message: error?.message || "Error al reactivar la membresía." },
      { status: 500 }
    );
  }
}
