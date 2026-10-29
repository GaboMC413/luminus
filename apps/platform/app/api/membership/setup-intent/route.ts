import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
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

    if (!stripe) {
      return NextResponse.json({
        clientSecret: "mock_setup_secret_" + Math.random().toString(36).substring(2, 10),
        isMock: true,
      });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId || customerId.startsWith("cus_mock_")) {
      const name =
        user.profile?.fullName ||
        `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() ||
        user.email;
      const createdCustomer = await stripe.customers.create({
        email: user.email.toLowerCase().trim(),
        name,
        metadata: { userId: user.id, source: "setup_intent" },
      });
      customerId = createdCustomer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      usage: "off_session",
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      isMock: false,
    });
  } catch (error: any) {
    console.error("[setup-intent] Error:", error);
    return NextResponse.json(
      { message: error.message || "Error al inicializar la configuración de tarjeta." },
      { status: 500 }
    );
  }
}
