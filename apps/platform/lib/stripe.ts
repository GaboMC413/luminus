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

export interface CreateSetupIntentResult {
  clientSecret: string | null;
  customerId: string;
  isMock?: boolean;
  mode: "setup";
}

export interface CreateSubscriptionWithPmResult {
  subscriptionId: string;
  customerId: string;
  status: string;
  requiresAction: boolean;
  clientSecret: string | null;
  isMock?: boolean;
}

export async function getOrCreateMembershipPrice(interval: "month" | "year"): Promise<string> {
  if (!stripe) return interval === "year" ? "price_mock_annual" : "price_mock_monthly";

  const isAnnual = interval === "year";
  const targetUnitAmount = isAnnual ? 4500 : 500;
  const envPriceId = isAnnual
    ? process.env.STRIPE_PRICE_ID_ANNUAL_45
    : process.env.STRIPE_PRICE_ID_MONTHLY_5;

  if (envPriceId) return envPriceId;

  const prices = await stripe.prices.list({
    active: true,
    currency: "usd",
    limit: 20,
  });
  const matchingPrice = prices.data.find(
    (p) => p.unit_amount === targetUnitAmount && p.recurring?.interval === interval
  );

  if (matchingPrice) return matchingPrice.id;

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
  return newPrice.id;
}

/**
 * Retrieves an existing Stripe Customer by ID or email, or creates a new one idempotently.
 */
export async function getOrCreateStripeCustomer({
  email,
  name,
  phone,
  customerId,
  userId,
}: {
  email: string;
  name: string;
  phone?: string;
  customerId?: string | null;
  userId?: string;
}): Promise<Stripe.Customer> {
  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }

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
    customer = await stripe.customers.create({
      email: normalizedEmail,
      name,
      phone,
      metadata: {
        source: "mecenas_subscription",
        userId: userId || "",
      },
    });
  }

  return customer;
}

/**
 * Ensures a Stripe Customer exists and creates a SetupIntent so the user can enter card details
 * without generating a premature Subscription or open USD 0.00 Invoice.
 */
export async function createMembershipSetupIntent({
  email,
  name,
  phone,
  customerId,
  userId,
}: {
  email: string;
  name: string;
  phone?: string;
  customerId?: string | null;
  userId?: string;
}): Promise<CreateSetupIntentResult> {
  if (!stripe) {
    console.warn("[Stripe] STRIPE_SECRET_KEY is not defined. Using mock SetupIntent for development.");
    return {
      clientSecret: "mock_seti_secret_" + Math.random().toString(36).substring(2, 10),
      customerId: "cus_mock_" + Math.random().toString(36).substring(2, 10),
      isMock: true,
      mode: "setup",
    };
  }

  const customer = await getOrCreateStripeCustomer({
    email,
    name,
    phone,
    customerId,
    userId,
  });

  const setupIntent = await stripe.setupIntents.create({
    customer: customer.id,
    automatic_payment_methods: { enabled: true },
    usage: "off_session",
    metadata: {
      userId: userId || "",
      user_email: email.trim().toLowerCase(),
      source: "mecenas_checkout",
    },
  });

  return {
    clientSecret: setupIntent.client_secret,
    customerId: customer.id,
    isMock: false,
    mode: "setup",
  };
}

/**
 * Creates and immediately charges a Mecenas subscription using a confirmed PaymentMethod.
 * Only called when the user actually submits payment, preventing abandoned open invoices.
 */
export async function createSubscriptionWithPaymentMethod({
  customerId,
  paymentMethodId,
  interval = "month",
  userId,
  email,
}: {
  customerId: string;
  paymentMethodId: string;
  interval?: "month" | "year";
  userId?: string;
  email: string;
}): Promise<CreateSubscriptionWithPmResult> {
  if (!stripe) {
    return {
      subscriptionId: "sub_mock_" + Math.random().toString(36).substring(2, 10),
      customerId: customerId || "cus_mock_" + Math.random().toString(36).substring(2, 10),
      status: "active",
      requiresAction: false,
      clientSecret: null,
      isMock: true,
    };
  }

  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  const pmCustomerId = typeof pm.customer === "string" ? pm.customer : pm.customer?.id;
  if (pmCustomerId && pmCustomerId !== customerId) {
    throw new Error("El método de pago no pertenece a esta cuenta.");
  }
  if (!pmCustomerId) {
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
  }

  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  const isAnnual = interval === "year";
  const finalPriceId = await getOrCreateMembershipPrice(interval);
  const normalizedEmail = email.trim().toLowerCase();

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: finalPriceId }],
    default_payment_method: paymentMethodId,
    payment_behavior: "allow_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
    metadata: {
      userId: userId || "",
      user_email: normalizedEmail,
      type: isAnnual ? "mecenas_annual" : "mecenas_monthly",
    },
  });

  if (subscription.status === "active" || subscription.status === "trialing") {
    return {
      subscriptionId: subscription.id,
      customerId,
      status: subscription.status,
      requiresAction: false,
      clientSecret: null,
      isMock: false,
    };
  }

  const invoice = subscription.latest_invoice as any;
  const paymentIntent = invoice?.payment_intent;
  if (
    paymentIntent &&
    typeof paymentIntent === "object" &&
    paymentIntent.status === "requires_action" &&
    paymentIntent.client_secret
  ) {
    return {
      subscriptionId: subscription.id,
      customerId,
      status: subscription.status,
      requiresAction: true,
      clientSecret: paymentIntent.client_secret as string,
      isMock: false,
    };
  }

  // Payment did not succeed and does not require 3DS: cancel the incomplete subscription so no open invoice lingers
  await stripe.subscriptions.cancel(subscription.id).catch((cancelErr) => {
    console.warn("[Stripe] Failed to cancel incomplete subscription after payment failure:", cancelErr);
  });

  const declineMessage =
    paymentIntent?.last_payment_error?.message ||
    "Tu tarjeta fue rechazada. Verifica los datos o intenta con otro método.";
  throw new Error(declineMessage);
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
  const finalPriceId = await getOrCreateMembershipPrice(interval);

  // 2. If an existing incomplete subscription exists, reuse it if interval matches or cancel it before creating a fresh one for the new interval
  if (existingSubscriptionId && !existingSubscriptionId.startsWith("sub_mock_")) {
    try {
      const existingSub = await stripe.subscriptions.retrieve(existingSubscriptionId, {
        expand: ["latest_invoice.payment_intent"],
      });

      const existingSubCustomerId =
        typeof existingSub.customer === "string"
          ? existingSub.customer
          : existingSub.customer?.id;
      const metaUserId = existingSub.metadata?.userId?.trim();
      const metaEmail = existingSub.metadata?.user_email?.trim().toLowerCase();
      const normalizedCallerEmail = email.trim().toLowerCase();

      const isOwnedByCaller =
        Boolean(customerId && existingSubCustomerId === customerId) ||
        Boolean(userId && metaUserId && metaUserId === userId) ||
        Boolean(metaEmail && metaEmail === normalizedCallerEmail);

      if (isOwnedByCaller && existingSub.status === "incomplete") {
        const currentPriceId = existingSub.items?.data?.[0]?.price?.id;
        if (currentPriceId === finalPriceId) {
          const invoice = existingSub.latest_invoice as any;
          const paymentIntent = invoice?.payment_intent;
          const clientSecret =
            typeof paymentIntent === "object" && paymentIntent !== null
              ? (paymentIntent.client_secret as string)
              : null;

          if (clientSecret && existingSubCustomerId) {
            return {
              clientSecret,
              subscriptionId: existingSub.id,
              customerId: existingSubCustomerId,
              isMock: false,
            };
          }
        }

        await stripe.subscriptions.cancel(existingSubscriptionId);
      }
    } catch (updateErr) {
      console.warn("[Stripe] Could not inspect/cancel existing subscription, falling back to create:", updateErr);
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
    customer = await stripe.customers.create({
      email: normalizedEmail,
      name,
      phone,
      metadata: {
        source: "mecenas_subscription",
        userId: userId || "",
      },
    });
  }

  // 4. Create Subscription with default_incomplete payment behavior
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: finalPriceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
    metadata: {
      userId: userId || "",
      user_email: normalizedEmail,
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
