import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setSessionCookie, readSessionToken } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = cookies();
  const token = cookieStore.get("luminus_reactivation_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "No se encontró el token de reactivación." }, { status: 400 });
  }

  const payload = readSessionToken(token);

  if (!payload || !payload.userId) {
    return NextResponse.json({ message: "El token de reactivación es inválido o ha expirado." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");

    const userToReactivate = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        purgeAt: true,
        paidUntil: true,
        tier: true,
        email: true,
        cognitoSub: true,
      },
    });

    if (!userToReactivate) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    if (userToReactivate.purgeAt && new Date() > userToReactivate.purgeAt) {
      return NextResponse.json(
        { message: "Esta cuenta ha superado el periodo de gracia de 90 días y ha sido eliminada permanentemente." },
        { status: 403 }
      );
    }

    const isStillPaid = userToReactivate.paidUntil && new Date() < userToReactivate.paidUntil;
    const targetTier = isStillPaid ? userToReactivate.tier : "FREE";

    await prisma.user.update({
      where: { id: payload.userId as string },
      data: {
        status: "active",
        tier: targetTier,
        closedAt: null,
        purgeAt: null,
        paidUntil: isStillPaid ? userToReactivate.paidUntil : null,
      },
    });

    try {
      const { syncCognitoUserStatus } = await import("@/lib/auth/cognito-admin");
      await syncCognitoUserStatus(userToReactivate as any, "active");
    } catch (err) {
      console.error("Failed to sync status to active in cognito", err);
    }

    // Set the actual session cookie
    setSessionCookie(token);

    // Clear the temporary reactivation cookie
    cookies().delete("luminus_reactivation_token");

    return NextResponse.json({ success: true, message: "Cuenta reactivada con éxito." });
  } catch (error) {
    console.error("Account reactivation failed.", error);
    return NextResponse.json({ message: "No pudimos reactivar la cuenta." }, { status: 500 });
  }
}
