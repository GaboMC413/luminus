import { NextResponse } from "next/server";
import { setRecoveryCode } from "@/lib/auth/recoveryStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ message: "Por favor, ingresa tu correo electrónico." }, { status: 400 });
  }

  // Generate 6-digit numeric verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "No encontramos ninguna cuenta con este correo." }, { status: 404 });
    }

    setRecoveryCode(email, code);
    console.log(`[RECOVERY CODE FOR ${email}]: ${code}`);

    return NextResponse.json({ 
      success: true, 
      message: "Código de recuperación enviado.",
      // Return code in response for local testing/development convenience
      code: process.env.NODE_ENV === "development" ? code : undefined 
    });
  } catch (error) {
    console.error("Password recovery request database flow failed.", error);
    console.warn("Database not available, using mock recovery request bypass.");
    
    // In mock mode, we accept any email and store code
    setRecoveryCode(email, code);
    console.log(`[MOCK RECOVERY CODE FOR ${email}]: ${code}`);

    return NextResponse.json({ 
      success: true, 
      message: "Código de recuperación enviado (Modo de prueba).",
      code 
    });
  }
}
