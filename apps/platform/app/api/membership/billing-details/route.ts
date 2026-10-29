import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET() {
  const session = getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    const defaultCustomerData = {
      name:
        user.profile?.fullName ||
        `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() ||
        user.email,
      email: user.email,
      phone: user.profile?.phoneNumber || "",
    };

    if (!stripe || !user.stripeCustomerId || user.stripeCustomerId.startsWith("cus_mock_")) {
      return NextResponse.json({
        hasActiveSubscription: user.tier === "MECENAS",
        subscription: user.tier === "MECENAS" ? {
          id: user.stripeSubscriptionId || "mock_sub",
          planName: user.profile?.selectedPlan === "Annual" ? "Mecenas LUMINUS Anual" : "Mecenas LUMINUS",
          amount: user.profile?.selectedPlan === "Annual" ? 45.0 : 5.0,
          currency: "usd",
          interval: user.profile?.selectedPlan === "Annual" ? "year" : "month",
          currentPeriodEnd: Math.floor(Date.now() / 1000) + 30 * 86400,
          cancelAtPeriodEnd: false,
          status: "active",
        } : null,
        defaultPaymentMethod: null,
        paymentMethods: [],
        customer: defaultCustomerData,
        invoices: [],
      });
    }

    // 1. Fetch Stripe Customer
    let stripeCustomer: any = null;
    try {
      const retrieved = await stripe.customers.retrieve(user.stripeCustomerId);
      if (!retrieved.deleted) stripeCustomer = retrieved;
    } catch (e) {
      console.warn("[billing-details] Could not retrieve stripe customer:", e);
    }

    // 2. Fetch Active Subscription
    let subscriptionData: any = null;
    let defaultPmIdFromSub: string | null = null;
    if (user.stripeSubscriptionId && !user.stripeSubscriptionId.startsWith("sub_mock_")) {
      try {
        const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
          expand: ["default_payment_method", "items.data.price.product"],
        });

        if (sub.status === "active" || sub.status === "trialing" || sub.status === "past_due") {
          const price = sub.items?.data?.[0]?.price;
          const product = price?.product as any;
          const planName = product?.name || "Mecenas LUMINUS";
          const interval = price?.recurring?.interval || "month";
          const amount = (price?.unit_amount || (interval === "year" ? 4500 : 500)) / 100;

          if (sub.default_payment_method) {
            defaultPmIdFromSub = typeof sub.default_payment_method === "string"
              ? sub.default_payment_method
              : sub.default_payment_method.id;
          }

          subscriptionData = {
            id: sub.id,
            planName,
            amount,
            currency: price?.currency || "usd",
            interval,
            currentPeriodEnd: (sub as any).current_period_end || (sub as any).items?.data?.[0]?.current_period_end || null,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            status: sub.status,
          };

          // Synchronize PostgreSQL database if selectedPlan is out of sync with authoritative Stripe subscription
          const expectedPlan = interval === "year" ? "Annual" : "Monthly";
          if (user.profile && user.profile.selectedPlan !== expectedPlan) {
            await prisma.userProfile.update({
              where: { userId: user.id },
              data: { selectedPlan: expectedPlan },
            }).catch((syncErr) => {
              console.warn("[billing-details] Failed to sync selectedPlan:", syncErr);
            });
          }
        } else if (sub.status === "canceled") {
          if (user.tier === "MECENAS") {
            await prisma.user.update({
              where: { id: user.id },
              data: { tier: "FREE" },
            }).catch(() => {});
          }
        }
      } catch (subErr) {
        console.warn("[billing-details] Could not retrieve stripe subscription:", subErr);
      }
    }

    // 3. Fetch Saved Payment Methods
    let paymentMethods: any[] = [];
    const defaultPmId = defaultPmIdFromSub || stripeCustomer?.invoice_settings?.default_payment_method || null;

    try {
      const pms = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: "card",
      });

      paymentMethods = pms.data.map((pm) => ({
        id: pm.id,
        brand: pm.card?.brand || "unknown",
        last4: pm.card?.last4 || "****",
        expMonth: pm.card?.exp_month || 0,
        expYear: pm.card?.exp_year || 0,
        isDefault: pm.id === defaultPmId,
      }));
    } catch (pmErr) {
      console.warn("[billing-details] Could not retrieve payment methods:", pmErr);
    }

    const defaultPaymentMethod = paymentMethods.find((p) => p.isDefault) || paymentMethods[0] || null;

    // 4. Fetch Invoices
    let invoices: any[] = [];
    try {
      const invList = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 12,
      });

      invoices = invList.data.map((inv) => ({
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
    } catch (invErr) {
      console.warn("[billing-details] Could not retrieve invoices:", invErr);
    }

    const customerData = {
      name: stripeCustomer?.name || defaultCustomerData.name,
      email: stripeCustomer?.email || defaultCustomerData.email,
      phone: stripeCustomer?.phone || defaultCustomerData.phone,
    };

    return NextResponse.json({
      hasActiveSubscription: Boolean(subscriptionData || user.tier === "MECENAS"),
      subscription: subscriptionData,
      defaultPaymentMethod,
      paymentMethods,
      customer: customerData,
      invoices,
    });
  } catch (error: any) {
    console.error("[billing-details] Error:", error);
    return NextResponse.json(
      { message: error.message || "Error al obtener la información de facturación." },
      { status: 500 }
    );
  }
}
