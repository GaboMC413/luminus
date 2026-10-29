import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const session = getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { name, email, phone } = await request.json().catch(() => ({}));

    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, stripeCustomerId: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    // 1. Update Stripe customer if exists
    if (user.stripeCustomerId && !user.stripeCustomerId.startsWith("cus_mock_") && stripe) {
      const updateData: any = {};
      if (typeof name === "string") updateData.name = name.trim();
      if (typeof email === "string" && email.includes("@")) updateData.email = email.trim().toLowerCase();
      if (typeof phone === "string") updateData.phone = phone.trim();

      if (Object.keys(updateData).length > 0) {
        await stripe.customers.update(user.stripeCustomerId, updateData);
      }
    }

    // 2. Update local DB profile
    const nameParts = typeof name === "string" ? name.trim().split(/\s+/) : [];
    const firstName = nameParts[0] || undefined;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined;

    await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: typeof name === "string" ? name.trim() : undefined,
        firstName,
        lastName,
        phoneNumber: typeof phone === "string" ? phone.trim() : undefined,
      },
      update: {
        fullName: typeof name === "string" ? name.trim() : undefined,
        firstName,
        lastName,
        phoneNumber: typeof phone === "string" ? phone.trim() : undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[customer] PATCH Error:", error);
    return NextResponse.json(
      { message: error.message || "Error al actualizar los datos de facturación." },
      { status: 500 }
    );
  }
}
