import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

// PUT: Set payment method as default
export async function PUT(request: Request) {
  const session = getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { paymentMethodId } = await request.json().catch(() => ({}));
    if (!paymentMethodId) {
      return NextResponse.json({ message: "ID de método de pago requerido." }, { status: 400 });
    }

    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { stripeCustomerId: true, stripeSubscriptionId: true },
    });

    if (!user?.stripeCustomerId || !stripe) {
      return NextResponse.json({ success: true, isMock: true });
    }

    // 1. Update customer default payment method
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // 2. Update active subscription default payment method if present
    if (user.stripeSubscriptionId && !user.stripeSubscriptionId.startsWith("sub_mock_")) {
      try {
        await stripe.subscriptions.update(user.stripeSubscriptionId, {
          default_payment_method: paymentMethodId,
        });
      } catch (subErr) {
        console.warn("[payment-methods] Could not update subscription default PM:", subErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[payment-methods] PUT Error:", error);
    return NextResponse.json(
      { message: error.message || "Error al actualizar el método de pago predeterminado." },
      { status: 500 }
    );
  }
}

// DELETE: Detach a payment method
export async function DELETE(request: Request) {
  const session = getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get("id");

    if (!paymentMethodId) {
      return NextResponse.json({ message: "ID de método de pago requerido." }, { status: 400 });
    }

    if (!stripe) {
      return NextResponse.json({ success: true, isMock: true });
    }

    // Detach payment method from customer
    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[payment-methods] DELETE Error:", error);
    return NextResponse.json(
      { message: error.message || "Error al eliminar el método de pago." },
      { status: 500 }
    );
  }
}
