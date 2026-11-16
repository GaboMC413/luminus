import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { verifyRecoveryCodeHash, PASSWORD_RESET_MAX_ATTEMPTS } from "@/lib/auth/recoveryTokens";
import { isRateLimited } from "@/utils/rateLimit";

export const runtime = "nodejs";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "unknown-ip";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateCheck = isRateLimited(ip, "AUTH_RECOVER_RESET", 10, 15 * 60 * 1000);
  if (rateCheck.success) {
    return NextResponse.json(
      { message: "Demasiados intentos. Por favor espera unos minutos." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!email || !code || !newPassword) {
    return NextResponse.json({ message: "Todos los campos son requeridos." }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ message: "La contrasena debe tener al menos 8 caracteres." }, { status: 400 });
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
          select: {
            provider: true,
            providerSubject: true,
          },
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

    const isValid = verifyRecoveryCodeHash(token.codeHash, email, code);

    if (!isValid) {
      await prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { attempts: { increment: 1 } },
      });

      return NextResponse.json({ message: "El codigo es incorrecto o ha expirado." }, { status: 400 });
    }

    const { updateCognitoUserPassword } = await import("@/lib/auth/cognito-admin");
    await updateCognitoUserPassword(user, newPassword);

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



    return NextResponse.json({ success: true, message: "Contrasena actualizada con exito." });
  } catch (error) {
    console.error("Password reset flow failed.", error);
    const { getCognitoErrorMessage, getCognitoErrorStatus } = await import("@/lib/auth/cognito-password");
    return NextResponse.json(
      { message: getCognitoErrorMessage(error, "No pudimos actualizar la contrasena.") },
      { status: getCognitoErrorStatus(error, 500) }
    );
  }
}
