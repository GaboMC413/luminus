import Stripe from "stripe";

// Initialize Stripe instance if STRIPE_SECRET_KEY is present
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20" as any,
      typescript: true,
    })
  : null;

export const isStripeConfigured = Boolean(stripeSecretKey);

export interface CreateSubscriptionResult {
  clientSecret: string | null;
  subscriptionId: string;
  customerId: string;
  isMock?: boolean;
}

/**
 * Creates or retrieves a Stripe Customer and creates a monthly $5 or annual $45 Mecenas subscription.
 * Uses payment_behavior: 'default_incomplete' so the frontend can confirm it via Stripe Elements.
 */
export async function createMembershipSubscription({
  email,
  name,
  phone,
  interval = "month",
  existingSubscriptionId,
  customerId,
  userId,
}: {
  email: string;
  name: string;
  phone?: string;
  interval?: "month" | "year";
  existingSubscriptionId?: string;
  customerId?: string | null;
  userId?: string;
}): Promise<CreateSubscriptionResult> {
  // Graceful fallback for local development if Stripe keys are not yet provided
  if (!stripe) {
    console.warn("[Stripe] STRIPE_SECRET_KEY is not defined. Using mock subscription for development.");
    return {
      clientSecret: "mock_pi_secret_" + Math.random().toString(36).substring(2, 10),
      subscriptionId: "sub_mock_" + Math.random().toString(36).substring(2, 10),
      customerId: "cus_mock_" + Math.random().toString(36).substring(2, 10),
      isMock: true,
    };
  }

  // 1. Resolve Price ID for USD 5/month or USD 45/year
  const isAnnual = interval === "year";
  const targetUnitAmount = isAnnual ? 4500 : 500; // $45.00 or $5.00 USD
  const envPriceId = isAnnual
    ? process.env.STRIPE_PRICE_ID_ANNUAL_45
    : process.env.STRIPE_PRICE_ID_MONTHLY_5;

  let finalPriceId = envPriceId;
  if (!finalPriceId) {
    const prices = await stripe.prices.list({
      active: true,
      currency: "usd",
      limit: 20,
    });
    const matchingPrice = prices.data.find(
      (p) => p.unit_amount === targetUnitAmount && p.recurring?.interval === interval
    );

    if (matchingPrice) {
      finalPriceId = matchingPrice.id;
    } else {
      const product = await stripe.products.create({
        name: isAnnual ? "Mecenas LUMINUS Anual" : "Mecenas LUMINUS",
        description: isAnnual
          ? "Acceso anual como Mecenas a la red LUMINUS con ahorro de USD 15"
          : "Acceso como Mecenas y apoyo al desarrollo de la red LUMINUS",
      });
      const newPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: targetUnitAmount,
        currency: "usd",
        recurring: { interval },
      });
      finalPriceId = newPrice.id;
    }
  }

  // 2. If an existing incomplete subscription exists, UPDATE IT instead of spamming new ones
  if (existingSubscriptionId && !existingSubscriptionId.startsWith("sub_mock_")) {
    try {
      const existingSub = await stripe.subscriptions.retrieve(existingSubscriptionId, {
        expand: ["latest_invoice.payment_intent"],
      });

      if (existingSub.status === "incomplete" && existingSub.items?.data?.[0]?.id) {
        const updatedSub = await stripe.subscriptions.update(existingSubscriptionId, {
          items: [{
            id: existingSub.items.data[0].id,
            price: finalPriceId,
          }],
          proration_behavior: "none",
          payment_behavior: "default_incomplete",
          expand: ["latest_invoice.payment_intent"],
          metadata: {
            user_email: email,
            type: isAnnual ? "mecenas_annual" : "mecenas_monthly",
          },
        });

        const invoice = updatedSub.latest_invoice as any;
        const paymentIntent = invoice?.payment_intent;
        const clientSecret =
          typeof paymentIntent === "object" && paymentIntent !== null
            ? (paymentIntent.client_secret as string)
            : null;

        return {
          clientSecret: clientSecret || null,
          subscriptionId: updatedSub.id,
          customerId: typeof updatedSub.customer === "string" ? updatedSub.customer : updatedSub.customer.id,
          isMock: false,
        };
      }
    } catch (updateErr) {
      console.warn("[Stripe] Could not update existing subscription, falling back to create:", updateErr);
    }
  }

  // 3. Find or create Customer
  const normalizedEmail = email.trim().toLowerCase();
  let customer: Stripe.Customer | null = null;

  if (customerId && !customerId.startsWith("cus_mock_")) {
    try {
      const retrieved = await stripe.customers.retrieve(customerId);
      if (!retrieved.deleted) {
        customer = retrieved as Stripe.Customer;
      }
    } catch (err) {
      console.warn("[Stripe] Failed to retrieve customer by id, falling back to lookup:", err);
    }
  }

  if (!customer) {
    const existingCustomers = await stripe.customers.list({
      email: normalizedEmail,
      limit: 5,
    });
    customer = (existingCustomers.data.find((c) => !c.deleted) as Stripe.Customer) || null;
  }

  if (!customer) {
    const idempotencyKey = `create-customer-${userId || normalizedEmail.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    customer = await stripe.customers.create(
      {
        email: normalizedEmail,
        name,
        phone,
        metadata: {
          source: "mecenas_subscription",
          userId: userId || "",
        },
      },
      { idempotencyKey }
    );
  }

  // 3. Create Subscription with default_incomplete payment behavior
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: finalPriceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
    metadata: {
      user_email: email,
      type: isAnnual ? "mecenas_annual" : "mecenas_monthly",
    },
  });

  const invoice = subscription.latest_invoice as any;
  const paymentIntent = invoice?.payment_intent;
  const clientSecret =
    typeof paymentIntent === "object" && paymentIntent !== null
      ? (paymentIntent.client_secret as string)
      : null;

  return {
    clientSecret: clientSecret || null,
    subscriptionId: subscription.id,
    customerId: customer.id,
    isMock: false,
  };
}

/**
 * Creates a Stripe Customer Portal session for self-service payment method updates and invoice downloads.
 */
export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<{ url: string; isMock: boolean }> {
  if (!stripe) {
    return { url: returnUrl, isMock: true };
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return { url: portalSession.url, isMock: false };
}
