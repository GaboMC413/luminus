import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { hashRecoveryCode, PASSWORD_RESET_MAX_ATTEMPTS } from "@/lib/auth/recoveryTokens";
import { adminSetUserPassword } from "@/lib/auth/cognito-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!email || !code || !newPassword) {
    return NextResponse.json({ message: "Todos los campos son requeridos." }, { status: 400 });
  }

  if (newPassword.length < 12) {
    return NextResponse.json({ message: "La contrasena debe tener al menos 12 caracteres." }, { status: 400 });
  }

  if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return NextResponse.json({ message: "La contrasena debe incluir al menos una letra y un numero." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        cognitoSub: true,
        identities: {
          where: { provider: "cognito" },
          select: { providerSubject: true, provider: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "El codigo es incorrecto o ha expirado." }, { status: 400 });
    }

    const token = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!token || token.attempts >= PASSWORD_RESET_MAX_ATTEMPTS) {
      return NextResponse.json({ message: "El codigo es incorrecto o ha expirado." }, { status: 400 });
    }

    const isValid = token.codeHash === hashRecoveryCode(email, code);

    if (!isValid) {
      await prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { attempts: { increment: 1 } },
      });

      return NextResponse.json({ message: "El codigo es incorrecto o ha expirado." }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashPassword(newPassword) },
      }),
      prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
    ]);

    try {
      if (user.cognitoSub) {
        await adminSetUserPassword(user as any, newPassword, true);
      }
    } catch (cognitoError) {
      console.error("Failed to sync new password to Cognito", cognitoError);
      // We don't fail the request here, but log it. They might have a local fallback if needed.
    }

    return NextResponse.json({ success: true, message: "Contrasena actualizada con exito." });
  } catch (error) {
    console.error("Password reset database flow failed.", error);
    return NextResponse.json({ message: "No pudimos actualizar la contrasena." }, { status: 500 });
  }
}
