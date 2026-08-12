import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setSessionCookie, readSessionToken } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = cookies();
  const token = cookieStore.get("luminus_reactivation_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "No se encontro el token de reactivacion." }, { status: 400 });
  }

  const payload = readSessionToken(token);

  if (!payload || !payload.userId) {
    return NextResponse.json({ message: "El token de reactivacion es invalido o ha expirado." }, { status: 400 });
  }

  try {
    
    await prisma.user.update({
      where: { id: payload.userId as string },
      data: { status: "active" },
    });

    try {
      const { syncCognitoUserStatus } = await import("@/lib/auth/cognito-admin");
      const user = await prisma.user.findUnique({
        where: { id: payload.userId as string },
        select: {
          email: true,
          cognitoSub: true,
          identities: {
            where: { provider: "cognito" },
            select: { providerSubject: true, provider: true },
          },
        },
      });
      if (user) {
        await syncCognitoUserStatus(user as any, "active");
      }
    } catch (err) {
      console.error("Failed to sync status to active in cognito", err);
    }

    // Set the actual session cookie
    setSessionCookie(token);

    // Clear the temporary reactivation cookie
    cookies().delete("luminus_reactivation_token");

    return NextResponse.json({ success: true, message: "Cuenta reactivada con exito." });
  } catch (error) {
    console.error("Account reactivation failed.", error);
    return NextResponse.json({ message: "No pudimos reactivar la cuenta." }, { status: 500 });
  }
}
