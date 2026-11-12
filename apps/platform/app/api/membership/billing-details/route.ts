import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentSession();
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

    // 1-4. Concurrent Fetch from Stripe (Single Roundtrip)
    let stripeCustomer: any = null;
    let sub: any = null;
    let paymentMethods: any[] = [];
    let invoices: any[] = [];
    let subscriptionData: any = null;
    let defaultPmIdFromSub: string | null = null;

    if (user.stripeCustomerId && stripe) {
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
              expand: ["data.default_payment_method", "data.items.data.price.product"],
            }),
        stripe.paymentMethods.list({
          customer: user.stripeCustomerId,
          type: "card",
        }),
        stripe.invoices.list({
          customer: user.stripeCustomerId,
          limit: 12,
        }),
      ]);

      if (customerRes.status === "fulfilled" && !customerRes.value.deleted) {
        stripeCustomer = customerRes.value;
      }

      if (subRes.status === "fulfilled") {
        const val: any = subRes.value;
        if (val.object === "list") {
          sub = val.data.find(
            (s: any) => s.status === "active" || s.status === "trialing" || s.status === "past_due"
          ) || val.data[0] || null;
        } else {
          sub = val;
        }
      }

      // Fallback: If retrieved sub was canceled or missing, query list directly
      if (!sub || sub.status === "canceled") {
        try {
          const customerSubs = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: "all",
            limit: 5,
            expand: ["data.default_payment_method", "data.items.data.price.product"],
          });
          const liveSub = customerSubs.data.find(
            (s) => s.status === "active" || s.status === "trialing" || s.status === "past_due"
          );
          if (liveSub) {
            sub = liveSub;
            void prisma.user.update({
              where: { id: user.id },
              data: { stripeSubscriptionId: liveSub.id },
            }).catch(() => {});
          } else if (customerSubs.data.length > 0) {
            sub = customerSubs.data[0];
          }
        } catch (listErr) {
          console.warn("[billing-details] Could not list customer subscriptions fallback:", listErr);
        }
      }

      if (sub && (sub.status === "active" || sub.status === "trialing" || sub.status === "past_due")) {
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

        const scheduledChange = sub.metadata?.scheduled_change;
        const scheduledPlanChange = scheduledChange
          ? {
              targetInterval: scheduledChange,
              targetPlanName: scheduledChange === "year" ? "Mecenas Anual" : "Mecenas Mensual",
              targetAmount: scheduledChange === "year" ? 45.0 : 5.0,
              effectiveDate: (sub as any).current_period_end || null,
            }
          : null;

        subscriptionData = {
          id: sub.id,
          planName,
          amount,
          currency: price?.currency || "usd",
          interval,
          currentPeriodEnd: (sub as any).current_period_end || (sub as any).items?.data?.[0]?.current_period_end || null,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          scheduledPlanChange,
          status: sub.status,
        };

        if (user.tier !== "MECENAS") {
          void prisma.user.update({
            where: { id: user.id },
            data: { tier: "MECENAS", stripeSubscriptionId: sub.id },
          }).catch(() => {});
        }

        const expectedPlan = interval === "year" ? "Annual" : "Monthly";
        if (user.profile && user.profile.selectedPlan !== expectedPlan) {
          void prisma.userProfile.update({
            where: { userId: user.id },
            data: { selectedPlan: expectedPlan },
          }).catch(() => {});
        }
      } else if (user.tier === "MECENAS") {
        void prisma.user.update({
          where: { id: user.id },
          data: { tier: "FREE" },
        }).catch(() => {});
      }

      const defaultPmId = defaultPmIdFromSub || stripeCustomer?.invoice_settings?.default_payment_method || null;

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
    }

    const defaultPaymentMethod = paymentMethods.find((p) => p.isDefault) || paymentMethods[0] || null;

    const customerData = {
      name: stripeCustomer?.name || defaultCustomerData.name,
      email: stripeCustomer?.email || defaultCustomerData.email,
      phone: stripeCustomer?.phone || defaultCustomerData.phone,
    };

    const hasActiveSubscription = Boolean(
      subscriptionData &&
      (subscriptionData.status === "active" || subscriptionData.status === "trialing")
    );

    const missingPaymentMethod = Boolean(
      hasActiveSubscription &&
      !subscriptionData?.cancelAtPeriodEnd &&
      paymentMethods.length === 0
    );

    return NextResponse.json({
      hasActiveSubscription,
      missingPaymentMethod,
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
