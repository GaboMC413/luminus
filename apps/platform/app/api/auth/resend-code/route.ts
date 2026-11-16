import { NextResponse } from "next/server";
import { resendConfirmationCode } from "@/lib/auth/cognito-password";
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
  const rateCheck = isRateLimited(ip, "AUTH_RESEND_CODE", 5, 15 * 60 * 1000);
  if (rateCheck.success) {
    return NextResponse.json(
      { message: "Has excedido el límite de intentos. Por favor, intenta más tarde." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  
  if (!body?.email) {
    return NextResponse.json({ message: "El correo es requerido." }, { status: 400 });
  }

  try {
    try {
      await resendConfirmationCode(body.email);
    } catch (cognitoErr: any) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[LOCAL DEV] Bypassing Cognito resendConfirmationCode error in local dev");
      } else {
        throw cognitoErr;
      }
    }
    return NextResponse.json({ success: true, message: "Código reenviado." }, { status: 200 });
  } catch (error: any) {
    console.error("Cognito resend code failed.", error);
    
    if (error.code === "LimitExceededException") {
      return NextResponse.json({ message: "Has excedido el límite de intentos. Por favor, intenta más tarde." }, { status: 429 });
    }
    
    return NextResponse.json(
      { message: "No pudimos reenviar el código en este momento." },
      { status: error.status || 500 }
    );
  }
}
