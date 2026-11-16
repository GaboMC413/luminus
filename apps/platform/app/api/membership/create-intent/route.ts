import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { createMembershipSetupIntent } from "@/lib/stripe";
import { handleApiError } from "@/lib/errors/server-error";

export const runtime = "nodejs";

export async function POST(request: Request) {
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

    // Check if user already has an active subscription
    if (user.tier === "MECENAS" && user.stripeSubscriptionId) {
      return NextResponse.json({
        alreadySubscribed: true,
        message: "Ya tienes una membresía activa.",
      });
    }

    const body = await request.json().catch(() => null);
    const interval: "month" | "year" = body?.interval === "year" ? "year" : "month";

    const setupData = await createMembershipSetupIntent({
      email: user.email,
      name: user.profile?.fullName || `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() || user.email,
      phone: user.profile?.phoneNumber || undefined,
      customerId: user.stripeCustomerId,
      userId: user.id,
    });

    // Persist resolved customer ID to database if missing or replaced (e.g. deleted in Stripe)
    if (setupData.customerId && setupData.customerId !== user.stripeCustomerId && !setupData.isMock) {
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: setupData.customerId },
      }).catch((updateErr) => {
        console.warn("[create-intent] Could not persist stripeCustomerId:", updateErr);
      });
    }

    return NextResponse.json({ ...setupData, interval });
  } catch (error: unknown) {
    return handleApiError(error, {
      context: "[membership/create-intent] POST",
      message: "Error al inicializar la suscripción de membresía.",
    });
  }
}
