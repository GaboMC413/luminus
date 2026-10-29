import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { createCustomerPortalSession } from "@/lib/stripe";

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
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({
        message: "No tienes una suscripción registrada en Stripe para gestionar.",
        url: null,
      });
    }

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const returnUrl = `${protocol}://${host}/perfil-usuario/configuracion?tab=membership`;

    const portal = await createCustomerPortalSession({
      customerId: user.stripeCustomerId,
      returnUrl,
    });

    return NextResponse.json(portal);
  } catch (error: any) {
    console.error("Error creating customer portal session:", error);
    return NextResponse.json(
      { message: error.message || "Error al conectar con la pasarela de Stripe." },
      { status: 500 }
    );
  }
}
