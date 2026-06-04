import { NextResponse } from "next/server";
import {
  generateRecoveryCode,
  getRecoveryCodeExpiry,
  hashRecoveryCode,
  isRecoveryDebugEnabled,
} from "@/lib/auth/recoveryTokens";
import { sendPasswordResetEmail } from "@/lib/email/passwordResetEmail";

export const runtime = "nodejs";

const GENERIC_RECOVERY_MESSAGE = "Si existe una cuenta con ese correo, enviaremos un codigo de recuperacion.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ message: "Por favor, ingresa tu correo electronico." }, { status: 400 });
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
