import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { createMembershipSubscription } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
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

    // Check if user already has an active subscription
    if (user.tier === "MECENAS" && user.stripeSubscriptionId) {
      return NextResponse.json({
        alreadySubscribed: true,
        message: "Ya tienes una membresía activa.",
      });
    }

    const body = await request.json().catch(() => null);
    const interval: "month" | "year" = body?.interval === "year" ? "year" : "month";
    const existingSubscriptionId: string | undefined = body?.existingSubscriptionId;

    const subscriptionData = await createMembershipSubscription({
      email: user.email,
      name: user.profile?.fullName || `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() || user.email,
      phone: user.profile?.phoneNumber || undefined,
      interval,
      existingSubscriptionId,
    });

    return NextResponse.json({ ...subscriptionData, interval });
  } catch (error: any) {
    console.error("Create membership subscription intent failed:", error);
    return NextResponse.json(
      { message: error.message || "Error al inicializar la suscripción de membresía." },
      { status: 500 }
    );
  }
}
