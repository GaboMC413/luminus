import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { createCustomerPortalSession } from "@/lib/stripe";
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
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({
        message: "No tienes una suscripción registrada en Stripe para gestionar.",
        url: null,
      });
    }

    const baseOrigin = (
      process.env.AUTH_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NODE_ENV === "production" ? "https://app.luminuslatam.com" : "http://localhost:3000")
    )
      .trim()
      .replace(/\/$/, "");
    const returnUrl = `${baseOrigin}/perfil-usuario/configuracion/membresia`;

    const portal = await createCustomerPortalSession({
      customerId: user.stripeCustomerId,
      returnUrl,
    });

    return NextResponse.json(portal);
  } catch (error: unknown) {
    return handleApiError(error, {
      context: "[membership/portal] POST",
      message: "Error al conectar con la pasarela de Stripe.",
    });
  }
}
