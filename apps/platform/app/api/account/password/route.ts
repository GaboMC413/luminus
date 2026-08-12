import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!newPassword) {
    return NextResponse.json({ message: "La nueva contrasena es requerida." }, { status: 400 });
  }

  if (newPassword.length < 12) {
    return NextResponse.json({ message: "La contrasena debe tener al menos 12 caracteres." }, { status: 400 });
  }

  if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return NextResponse.json({ message: "La contrasena debe incluir al menos una letra y un numero." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        cognitoSub: true,
        identities: {
          select: {
            provider: true,
            providerSubject: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    const { updateCognitoUserPassword } = await import("@/lib/auth/cognito-admin");
    await updateCognitoUserPassword(user, newPassword);

    await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash: hashPassword(newPassword) },
    });

    return NextResponse.json({ success: true, message: "Contrasena actualizada con exito." });
  } catch (error) {
    console.error("Authenticated password change failed.", error);
    const { getCognitoErrorMessage, getCognitoErrorStatus } = await import("@/lib/auth/cognito-password");
    return NextResponse.json(
      { message: getCognitoErrorMessage(error, "No pudimos actualizar la contrasena.") },
      { status: getCognitoErrorStatus(error, 500) }
    );
  }
}
