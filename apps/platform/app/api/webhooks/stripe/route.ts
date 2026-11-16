import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import { handleApiError, logServerError } from "@/lib/errors/server-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function findUserForSubscription(
  prisma: any,
  customerId: string | null,
  subscriptionId: string | null,
  metadata?: Stripe.Metadata | null
) {
  const metaUserId = metadata?.userId?.trim();
  const metaEmail = metadata?.user_email?.trim().toLowerCase();

  if (subscriptionId) {
    const bySub = await prisma.user.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
      include: { profile: true },
    });
    if (bySub) return bySub;
  }

  if (customerId) {
    const byCustomer = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      include: { profile: true },
    });
    if (byCustomer) return byCustomer;
  }

  if (metaUserId) {
    const byId = await prisma.user.findUnique({
      where: { id: metaUserId },
      include: { profile: true },
    });
    if (byId) return byId;
  }

  if (metaEmail) {
    const byEmail = await prisma.user.findUnique({
      where: { email: metaEmail },
      include: { profile: true },
    });
    if (byEmail) return byEmail;
  }

  return null;
}

async function syncSubscriptionState(prisma: any, sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null;
  const user = await findUserForSubscription(prisma, customerId, sub.id, sub.metadata);
  if (!user) return;

  const isActive = sub.status === "active" || sub.status === "trialing";
  const isTerminal =
    sub.status === "canceled" ||
    sub.status === "unpaid" ||
    sub.status === "incomplete_expired";

  const priceInterval = sub.items?.data?.[0]?.price?.recurring?.interval;
  const selectedPlan = priceInterval === "year" ? "Annual" : "Monthly";

  if (isActive) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        tier: "MECENAS",
        memberSince: user.memberSince ?? new Date(),
        ...(customerId ? { stripeCustomerId: customerId } : {}),
        stripeSubscriptionId: sub.id,
        profile: {
          upsert: {
            create: { selectedPlan },
            update: { selectedPlan },
          },
        },
      },
    });
  } else if (isTerminal) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        tier: "FREE",
        profile: {
          upsert: {
            create: { selectedPlan: "Free" },
            update: { selectedPlan: "Free" },
          },
        },
      },
    });
  }
}

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ message: "Stripe is not configured." }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret || !signature) {
    return NextResponse.json(
      { message: "Missing Stripe webhook signature or secret." },
      { status: 400 }
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    logServerError("[webhooks/stripe] Signature verification failed", err);
    return NextResponse.json(
      { message: "Invalid Stripe webhook signature." },
      { status: 400 }
    );
  }

  try {
    const { prisma } = await import("@/lib/db");

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscriptionState(prisma, sub);
        break;
      }

      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
        const subId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id || null;

        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscriptionState(prisma, sub);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    return handleApiError(err, {
      context: "[webhooks/stripe] Handler error",
      message: "Webhook handler failed.",
    });
  }
}
