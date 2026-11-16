import { NextResponse } from "next/server";
import {
  generateRecoveryCode,
  getRecoveryCodeExpiry,
  hashRecoveryCode,
  isRecoveryDebugEnabled,
} from "@/lib/auth/recoveryTokens";
import { sendPasswordResetEmail } from "@/lib/mails/sender";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { isRateLimited } from "@/utils/rateLimit";

export const runtime = "nodejs";

const GENERIC_RECOVERY_MESSAGE = "Si existe una cuenta con ese correo, enviaremos un codigo de recuperacion.";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "unknown-ip";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateCheck = isRateLimited(ip, "AUTH_RECOVER_REQ", 5, 15 * 60 * 1000);
  if (rateCheck.success) {
    return NextResponse.json(
      { message: "Demasiados intentos. Por favor espera unos minutos." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ message: "Por favor, ingresa tu correo electronico." }, { status: 400 });
  }

  const turnstileResult = await verifyTurnstileToken(body?.turnstileToken);
  if (!turnstileResult.success) {
    return NextResponse.json({ message: turnstileResult.error }, { status: 400 });
  }

  const code = generateRecoveryCode();

  try {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ success: true, message: GENERIC_RECOVERY_MESSAGE });
    }

    // Cooldown: prevent email flooding if a token was created within the last 60 seconds
    const recentToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
      select: { id: true },
    });

    if (recentToken) {
      return NextResponse.json({ success: true, message: GENERIC_RECOVERY_MESSAGE });
    }

    await prisma.$transaction([
      prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      }),
      prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          codeHash: hashRecoveryCode(email, code),
          expiresAt: getRecoveryCodeExpiry(),
        },
      }),
    ]);

    if (isRecoveryDebugEnabled()) {
      console.log(`[RECOVERY CODE FOR ${email}]: ${code}`);
    }

    await sendPasswordResetEmail(email, code);

    return NextResponse.json({
      success: true,
      message: GENERIC_RECOVERY_MESSAGE,
      code: isRecoveryDebugEnabled() ? code : undefined,
    });
  } catch (error) {
    console.error("Password recovery request database flow failed.", error);
    return NextResponse.json(
      { message: "No pudimos procesar la solicitud de recuperacion." },
      { status: 500 },
    );
  }
}
