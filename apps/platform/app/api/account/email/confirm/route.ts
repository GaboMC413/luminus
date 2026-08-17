import { NextResponse } from "next/server";
import { createSessionToken, getCurrentSession, setSessionCookie } from "@/lib/auth/session";
import { hashRecoveryCode, PASSWORD_RESET_MAX_ATTEMPTS } from "@/lib/auth/recoveryTokens";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!email || !code) {
    return NextResponse.json({ message: "Email y codigo son requeridos." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const token = await prisma.emailChangeToken.findFirst({
      where: {
        userId: session.userId,
        email,
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
      await prisma.emailChangeToken.update({
        where: { id: token.id },
        data: { attempts: { increment: 1 } },
      });

      return NextResponse.json({ message: "El codigo es incorrecto o ha expirado." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser && existingUser.id !== session.userId) {
      return NextResponse.json({ message: "Ese correo ya esta registrado." }, { status: 409 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.userId },
        data: {
          email,
          emailVerified: true,
        },
      }),
      prisma.emailChangeToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
    ]);

    setSessionCookie(createSessionToken({ userId: session.userId, email, role: session.role }));

    return NextResponse.json({ success: true, email, message: "Email actualizado con exito." });
  } catch (error) {
    console.error("Email change confirmation failed.", error);
    return NextResponse.json({ message: "No pudimos actualizar el email." }, { status: 500 });
  }
}
