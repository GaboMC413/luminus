import { NextResponse } from "next/server";
import { resendConfirmationCode } from "@/lib/auth/cognito-password";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  
  if (!body?.email) {
    return NextResponse.json({ message: "El correo es requerido." }, { status: 400 });
  }

  try {
    await resendConfirmationCode(body.email);
    return NextResponse.json({ success: true, message: "Código reenviado." }, { status: 200 });
  } catch (error: any) {
    console.error("Cognito resend code failed.", error);
    
    if (error.code === "LimitExceededException") {
      return NextResponse.json({ message: "Has excedido el límite de intentos. Por favor, intenta más tarde." }, { status: 429 });
    }
    
    return NextResponse.json(
      { message: error.message || "No pudimos reenviar el código." },
      { status: error.status || 500 }
    );
  }
}
