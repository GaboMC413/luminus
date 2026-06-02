import { NextResponse } from "next/server";
import { hashRecoveryCode, PASSWORD_RESET_MAX_ATTEMPTS } from "@/lib/auth/recoveryTokens";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!email || !code) {
    return NextResponse.json({ message: "El correo y el codigo son requeridos." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ message: "El codigo ingresado es incorrecto o ha expirado." }, { status: 400 });
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
      return NextResponse.json({ message: "El codigo ingresado es incorrecto o ha expirado." }, { status: 400 });
    }

    const isValid = token.codeHash === hashRecoveryCode(email, code);

    if (!isValid) {
      await prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { attempts: { increment: 1 } },
      });

      return NextResponse.json({ message: "El codigo ingresado es incorrecto o ha expirado." }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Codigo verificado con exito." });
  } catch (error) {
    console.error("Password recovery verify failed.", error);
    return NextResponse.json({ message: "No pudimos verificar el codigo." }, { status: 500 });
  }
}
