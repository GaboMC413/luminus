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
    const { subscriptionId, customerId, billingInterval, cardName, city, country, firstName: bodyFirstName, lastName: bodyLastName } = body || {};

    const { stripe } = await import("@/lib/stripe");
    if (stripe && subscriptionId && !String(subscriptionId).startsWith("sub_mock_")) {
      try {
        const subscription = await stripe.subscriptions.retrieve(String(subscriptionId), {
          expand: ["latest_invoice.payment_intent"],
        });

        const invoice = subscription.latest_invoice as any;
        const paymentIntent = invoice?.payment_intent;
        const isPaid = subscription.status === "active" || paymentIntent?.status === "succeeded";

        if (!isPaid) {
          return NextResponse.json(
            { message: "El pago de la suscripción aún no ha sido confirmado por Stripe." },
            { status: 400 }
          );
        }
      } catch (stripeErr: any) {
        console.error("Stripe subscription verification error:", stripeErr);
        return NextResponse.json(
          { message: stripeErr.message || "Error al verificar la suscripción con Stripe." },
          { status: 400 }
        );
      }
    }

    const nameParts = cardName ? String(cardName).trim().split(/\s+/) : [];
    const firstName = bodyFirstName ? String(bodyFirstName).trim() : (nameParts[0] || undefined);
    const lastName = bodyLastName ? String(bodyLastName).trim() : (nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined);
    const fullName = (firstName && lastName) ? `${firstName} ${lastName}` : (cardName ? String(cardName).trim() : undefined);

    const { prisma } = await import("@/lib/db");
    const now = new Date();

    const existingUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { profile: { select: { firstName: true, lastName: true } } },
    });

    const hasProfileName = Boolean(existingUser?.profile?.firstName || existingUser?.profile?.lastName);

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        tier: "MECENAS",
        memberSince: now,
        stripeCustomerId: customerId ? String(customerId) : undefined,
        stripeSubscriptionId: subscriptionId ? String(subscriptionId) : undefined,
        profile: {
          upsert: {
            create: {
              selectedPlan: billingInterval === "annual" ? "Annual" : "Monthly",
              city: city ? String(city).trim() : undefined,
              country: country ? String(country).trim() : undefined,
              firstName,
              lastName,
              fullName,
            },
            update: {
              selectedPlan: billingInterval === "annual" ? "Annual" : "Monthly",
              ...(city ? { city: String(city).trim() } : {}),
              ...(country ? { country: String(country).trim() } : {}),
              ...(!hasProfileName && firstName ? { firstName } : {}),
              ...(!hasProfileName && lastName ? { lastName } : {}),
              ...(!hasProfileName && fullName ? { fullName } : {}),
            },
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
            tier: "MECENAS",
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
