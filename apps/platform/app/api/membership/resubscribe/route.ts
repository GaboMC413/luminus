import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { stripe, getOrCreateMembershipPrice } from "@/lib/stripe";
import type Stripe from "stripe";
import { handleApiError } from "@/lib/errors/server-error";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const interval = body?.interval === "year" ? "year" : "month";
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    const newPlanName = interval === "year" ? "Annual" : "Monthly";

    if (!stripe) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          tier: "MECENAS",
          profile: {
            update: { selectedPlan: newPlanName },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "¡Bienvenido nuevamente a Mecenas LUMINUS!",
        isMock: true,
      });
    }

    if (!user.stripeCustomerId || user.stripeCustomerId.startsWith("cus_mock_")) {
      return NextResponse.json(
        { message: "No tienes una tarjeta guardada. Por favor suscríbete ingresando un método de pago." },
        { status: 400 }
      );
    }

    // 1. Get customer's default payment method or list their cards
    const customer = (await stripe.customers.retrieve(user.stripeCustomerId)) as Stripe.Customer;
    let defaultPm = customer?.invoice_settings?.default_payment_method;

    if (!defaultPm) {
      const pms = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: "card",
        limit: 1,
      });
      if (pms.data.length > 0) {
        defaultPm = pms.data[0].id;
      }
    }

    if (!defaultPm) {
      return NextResponse.json(
        { message: "No tienes una tarjeta guardada. Por favor suscríbete ingresando un método de pago." },
        { status: 400 }
      );
    }

    const targetPriceId = await getOrCreateMembershipPrice(interval);

    // 2. Create active subscription charging default card immediately
    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [{ price: targetPriceId }],
      default_payment_method: typeof defaultPm === "string" ? defaultPm : (defaultPm as any).id,
      payment_behavior: "error_if_incomplete",
      metadata: {
        userId: user.id,
        user_email: user.email,
        type: interval === "year" ? "mecenas_annual" : "mecenas_monthly",
      },
    });

    if (subscription.status !== "active" && subscription.status !== "trialing") {
      return NextResponse.json(
        { message: "No pudimos procesar el cobro con tu tarjeta guardada. Por favor intenta con otro método de pago." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        tier: "MECENAS",
        stripeSubscriptionId: subscription.id,
        profile: {
          update: { selectedPlan: newPlanName },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "¡Bienvenido nuevamente a Mecenas LUMINUS!",
      subscriptionId: subscription.id,
    });
  } catch (error: unknown) {
    return handleApiError(error, {
      context: "[membership/resubscribe] POST",
      message: "Error al procesar la suscripción.",
    });
  }
}
