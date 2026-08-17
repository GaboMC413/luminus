import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { generateRecoveryCode, getRecoveryCodeExpiry, hashRecoveryCode } from "@/lib/auth/recoveryTokens";
import { sendEmailChangeVerificationEmail } from "@/lib/email/passwordResetEmail";

export const runtime = "nodejs";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ message: "Ingresa un correo electronico valido." }, { status: 400 });
  }

  if (email === session.email.trim().toLowerCase()) {
    return NextResponse.json({ message: "Ese ya es tu correo actual." }, { status: 400 });
  }

  const code = generateRecoveryCode();

  try {
    const { prisma } = await import("@/lib/db");
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Ese correo ya esta registrado." }, { status: 409 });
    }

    await prisma.$transaction([
      prisma.emailChangeToken.updateMany({
        where: {
          userId: session.userId,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      }),
      prisma.emailChangeToken.create({
        data: {
          userId: session.userId,
          email,
          codeHash: hashRecoveryCode(email, code),
          expiresAt: getRecoveryCodeExpiry(),
        },
      }),
    ]);

    await sendEmailChangeVerificationEmail(email, code);

    return NextResponse.json({ success: true, message: "Enviamos un codigo de confirmacion." });
  } catch (error) {
    console.error("Email change request failed.", error);
    return NextResponse.json({ message: "No pudimos enviar el codigo de confirmacion." }, { status: 500 });
  }
}
