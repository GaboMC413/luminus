import { NextResponse } from "next/server";
import { verifyRecoveryCode } from "@/lib/auth/recoveryStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  const code = body?.code?.trim();

  if (!email || !code) {
    return NextResponse.json({ message: "El correo y el código son requeridos." }, { status: 400 });
  }

  const isValid = verifyRecoveryCode(email, code);

  if (!isValid) {
    return NextResponse.json({ message: "El código ingresado es incorrecto o ha expirado." }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: "Código verificado con éxito." });
}
