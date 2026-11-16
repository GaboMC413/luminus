import type { PrismaClient } from "@prisma/client";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import type { AdminGlobalInvoice, AdminUserBilling } from "@/app/admin/types";

export async function getUserBillingSnapshot(
  prisma: PrismaClient,
  userId: string
): Promise<AdminUserBilling | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) return null;

  if (!stripe || !user.stripeCustomerId || user.stripeCustomerId.startsWith("cus_mock_")) {
    const isMecenasTier = user.tier === "MECENAS";
    const isAnnual = user.profile?.selectedPlan?.toLowerCase() === "annual";
    return {
      userId: user.id,
      stripeConfigured: isStripeConfigured,
      isMock: Boolean(user.stripeCustomerId?.startsWith("cus_mock_")) || !isStripeConfigured,
      hasActiveSubscription: isMecenasTier,
      missingPaymentMethod: false,
      subscription: isMecenasTier
        ? {
            id: user.stripeSubscriptionId || "manual_or_mock_sub",
            planName: isAnnual ? "Mecenas LUMINUS Anual" : "Mecenas LUMINUS",
            amount: isAnnual ? 45.0 : 5.0,
            currency: "usd",
            interval: isAnnual ? "year" : "month",
            currentPeriodEnd: user.paidUntil
              ? Math.floor(user.paidUntil.getTime() / 1000)
              : null,
            cancelAtPeriodEnd: false,
            scheduledPlanChange: null,
            status: "active",
          }
        : null,
      defaultPaymentMethod: null,
      invoices: [],
    };
  }

  let stripeCustomer: any = null;
  let sub: any = null;
  let paymentMethods: any[] = [];
  let invoices: any[] = [];
  let subscriptionData: AdminUserBilling["subscription"] = null;
  let defaultPmIdFromSub: string | null = null;

  const [customerRes, subRes, pmsRes, invoicesRes] = await Promise.allSettled([
    stripe.customers.retrieve(user.stripeCustomerId),
    user.stripeSubscriptionId && !user.stripeSubscriptionId.startsWith("sub_mock_")
      ? stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
          expand: ["default_payment_method", "items.data.price.product"],
        })
      : stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: "all",
          limit: 5,
          expand: ["data.default_payment_method"],
        }),
    stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    }),
    stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 24,
    }),
  ]);

  if (customerRes.status === "fulfilled" && !(customerRes.value as any).deleted) {
    stripeCustomer = customerRes.value;
  }

  if (subRes.status === "fulfilled") {
    const val: any = subRes.value;
    if (val.object === "list") {
      sub =
        val.data.find(
          (s: any) => s.status === "active" || s.status === "trialing" || s.status === "past_due"
        ) ||
        val.data[0] ||
        null;
    } else {
      sub = val;
    }
  }

  if (sub) {
    const price = sub.items?.data?.[0]?.price;
    const product = price?.product as any;
    const interval = price?.recurring?.interval || "month";
    const planName =
      (typeof product === "object" && product?.name) ||
      (interval === "year" ? "Mecenas LUMINUS Anual" : "Mecenas LUMINUS");
    const amount = (price?.unit_amount || (interval === "year" ? 4500 : 500)) / 100;

    if (sub.default_payment_method) {
      defaultPmIdFromSub =
        typeof sub.default_payment_method === "string"
          ? sub.default_payment_method
          : sub.default_payment_method.id;
    }

    const scheduledChange = sub.metadata?.scheduled_change;
    const scheduledPlanChange = scheduledChange
      ? {
          targetInterval: scheduledChange,
          targetPlanName: scheduledChange === "year" ? "Mecenas Anual" : "Mecenas Mensual",
          targetAmount: scheduledChange === "year" ? 45.0 : 5.0,
          effectiveDate: sub.current_period_end || null,
        }
      : null;

    subscriptionData = {
      id: sub.id,
      planName,
      amount,
      currency: price?.currency || "usd",
      interval,
      currentPeriodEnd:
        sub.current_period_end || sub.items?.data?.[0]?.current_period_end || null,
      cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
      scheduledPlanChange,
      status: sub.status,
    };
  }

  const defaultPmId =
    defaultPmIdFromSub || stripeCustomer?.invoice_settings?.default_payment_method || null;

  if (pmsRes.status === "fulfilled") {
    paymentMethods = pmsRes.value.data.map((pm: any) => ({
      id: pm.id,
      brand: pm.card?.brand || "unknown",
      last4: pm.card?.last4 || "****",
      expMonth: pm.card?.exp_month || 0,
      expYear: pm.card?.exp_year || 0,
      isDefault: pm.id === defaultPmId,
    }));
  }

  if (invoicesRes.status === "fulfilled") {
    invoices = invoicesRes.value.data.map((inv: any) => ({
      id: inv.id,
      number: inv.number || inv.id,
      date: inv.created,
      amount: (inv.amount_paid ?? inv.total ?? 0) / 100,
      currency: inv.currency || "usd",
      status: inv.status || "paid",
      description: inv.lines?.data?.[0]?.description || "Mecenas LUMINUS",
      pdfUrl: inv.invoice_pdf || null,
      hostedUrl: inv.hosted_invoice_url || null,
    }));
  }

  const defaultPaymentMethod =
    paymentMethods.find((p) => p.isDefault) || paymentMethods[0] || null;

  const hasActiveSubscription = Boolean(
    subscriptionData &&
      (subscriptionData.status === "active" || subscriptionData.status === "trialing")
  );

  const missingPaymentMethod = Boolean(
    hasActiveSubscription && !subscriptionData?.cancelAtPeriodEnd && paymentMethods.length === 0
  );

  return {
    userId: user.id,
    stripeConfigured: true,
    isMock: false,
    hasActiveSubscription,
    missingPaymentMethod,
    subscription: subscriptionData,
    defaultPaymentMethod,
    invoices,
  };
}

export async function listGlobalStripeInvoices(
  prisma: PrismaClient,
  limit = 50
): Promise<{ invoices: AdminGlobalInvoice[]; stripeConfigured: boolean }> {
  if (!stripe) {
    return { invoices: [], stripeConfigured: false };
  }

  try {
    const [stripeInvoices, usersWithStripe] = await Promise.all([
      stripe.invoices.list({ limit }),
      prisma.user.findMany({
        where: { stripeCustomerId: { not: null } },
        select: {
          id: true,
          email: true,
          stripeCustomerId: true,
          profile: { select: { fullName: true, firstName: true, lastName: true } },
        },
      }),
    ]);

    const userByCustomerId = new Map<string, (typeof usersWithStripe)[number]>();
    for (const u of usersWithStripe) {
      if (u.stripeCustomerId) userByCustomerId.set(u.stripeCustomerId, u);
    }

    const invoices: AdminGlobalInvoice[] = stripeInvoices.data.map((inv: any) => {
      const custId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id || null;
      const matchedUser = custId ? userByCustomerId.get(custId) : undefined;
      const matchedName = matchedUser
        ? matchedUser.profile?.fullName ||
          `${matchedUser.profile?.firstName || ""} ${matchedUser.profile?.lastName || ""}`.trim() ||
          matchedUser.email
        : inv.customer_name || null;

      return {
        id: inv.id,
        number: inv.number || inv.id,
        date: inv.created,
        amount: (inv.amount_paid ?? inv.total ?? 0) / 100,
        currency: inv.currency || "usd",
        status: inv.status || "open",
        description: inv.lines?.data?.[0]?.description || "Mecenas LUMINUS",
        customerId: custId,
        customerEmail: matchedUser?.email || inv.customer_email || null,
        customerName: matchedName,
        userId: matchedUser?.id || null,
        pdfUrl: inv.invoice_pdf || null,
        hostedUrl: inv.hosted_invoice_url || null,
      };
    });

    return { invoices, stripeConfigured: true };
  } catch (error) {
    console.error("[admin/billing] Failed to list global Stripe invoices:", error);
    return { invoices: [], stripeConfigured: true };
  }
}
