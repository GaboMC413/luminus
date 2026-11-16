import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { listGlobalStripeInvoices } from "@/lib/admin/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { message: "No tienes permisos de administrador." },
      { status: 403 }
    );
  }

  try {
    const { prisma } = await import("@/lib/db");
    const result = await listGlobalStripeInvoices(prisma, 50);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin/subscriptions] GET error:", error);
    return NextResponse.json(
      { message: "No pudimos cargar los pagos de Stripe." },
      { status: 500 }
    );
  }
}
