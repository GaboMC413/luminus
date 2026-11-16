import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getUserBillingSnapshot } from "@/lib/admin/billing";
import { isUuid } from "@/utils/validation";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getCurrentSession();
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: "No autorizado." }, { status: 401 }),
    };
  }
  if (session.role !== "ADMIN") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "No tienes permisos de administrador." },
        { status: 403 }
      ),
    };
  }
  return { ok: true as const, session };
}

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { id } = await props.params;
  if (!isUuid(id)) {
    return NextResponse.json({ message: "Usuario inválido." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const snapshot = await getUserBillingSnapshot(prisma, id);
    if (!snapshot) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("[admin/users/billing] GET error:", error);
    return NextResponse.json(
      { message: "No pudimos cargar la información de facturación." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { id } = await props.params;
  if (!isUuid(id)) {
    return NextResponse.json({ message: "Usuario inválido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const action = typeof body?.action === "string" ? body.action.trim() : "";
  if (!["sync", "cancel_at_period_end", "reactivate"].includes(action)) {
    return NextResponse.json({ message: "Acción no válida." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    if (!stripe || !user.stripeCustomerId || user.stripeCustomerId.startsWith("cus_mock_")) {
      return NextResponse.json(
        { message: "Este usuario no tiene un cliente real de Stripe vinculado." },
        { status: 400 }
      );
    }

    if (action === "cancel_at_period_end" || action === "reactivate") {
      if (!user.stripeSubscriptionId || user.stripeSubscriptionId.startsWith("sub_mock_")) {
        return NextResponse.json(
          { message: "Este usuario no tiene una suscripción real de Stripe." },
          { status: 400 }
        );
      }

      const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      if (sub.status === "canceled") {
        await prisma.user.update({
          where: { id: user.id },
          data: { tier: "FREE" },
        });
        return NextResponse.json(
          { message: "La suscripción ya se encontraba cancelada en Stripe." },
          { status: 400 }
        );
      }

      const scheduleId =
        typeof sub.schedule === "string" ? sub.schedule : (sub.schedule as any)?.id;
      if (scheduleId && action === "cancel_at_period_end") {
        await stripe.subscriptionSchedules.release(scheduleId).catch(() => {});
      }

      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: action === "cancel_at_period_end",
      });
    }

    // Sync local DB state with Stripe live state
    const snapshot = await getUserBillingSnapshot(prisma, id);
    if (snapshot) {
      const nextTier = snapshot.hasActiveSubscription ? "MECENAS" : "FREE";
      const nextPlan = snapshot.subscription
        ? snapshot.subscription.interval === "year"
          ? "Annual"
          : "Monthly"
        : user.profile?.selectedPlan || "Free";

      await prisma.user.update({
        where: { id: user.id },
        data: {
          tier: nextTier,
          ...(snapshot.subscription?.id &&
          !snapshot.subscription.id.startsWith("manual_")
            ? { stripeSubscriptionId: snapshot.subscription.id }
            : {}),
          ...(snapshot.subscription?.currentPeriodEnd
            ? { paidUntil: new Date(snapshot.subscription.currentPeriodEnd * 1000) }
            : {}),
          profile: {
            upsert: {
              create: { selectedPlan: nextPlan },
              update: { selectedPlan: nextPlan },
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      billing: snapshot,
    });
  } catch (error: any) {
    console.error("[admin/users/billing] POST error:", error);
    return NextResponse.json(
      { message: error?.message || "No se pudo ejecutar la acción en Stripe." },
      { status: 500 }
    );
  }
}
