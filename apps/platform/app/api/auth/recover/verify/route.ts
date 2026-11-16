import { NextResponse } from "next/server";
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
  const rateCheck = isRateLimited(ip, "AUTH_RECOVER_VERIFY", 10, 15 * 60 * 1000);
  if (rateCheck.success) {
    return NextResponse.json(
      { message: "Demasiados intentos. Por favor espera unos minutos." },
      { status: 429 }
    );
  }

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

    const isValid = verifyRecoveryCodeHash(token.codeHash, email, code);

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
