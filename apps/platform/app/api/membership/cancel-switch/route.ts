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
      select: { id: true, stripeSubscriptionId: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    if (!stripe || !user.stripeSubscriptionId || user.stripeSubscriptionId.startsWith("sub_mock_")) {
      return NextResponse.json({
        success: true,
        message: "El cambio programado de plan ha sido cancelado.",
        isMock: true,
      });
    }

    const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

    // Release any active schedule
    const scheduleId = typeof sub.schedule === "string" ? sub.schedule : (sub.schedule as any)?.id;
    if (scheduleId) {
      try {
        await stripe.subscriptionSchedules.release(scheduleId);
      } catch (schedErr) {
        console.warn("[cancel-switch] Failed to release schedule:", schedErr);
      }
    }

    // Clear metadata
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      metadata: {
        ...sub.metadata,
        scheduled_change: "",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Se canceló el cambio de plan programado. Continuarás con tu plan actual.",
    });
  } catch (error: any) {
    console.error("[cancel-switch] Error:", error);
    return NextResponse.json(
      { message: error?.message || "Error al cancelar el cambio de plan." },
      { status: 500 }
    );
  }
}
