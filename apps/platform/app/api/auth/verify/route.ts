import { NextResponse } from "next/server";
import { confirmSignUp } from "@/lib/auth/cognito-password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  
  if (!body?.email || !body?.code) {
    return NextResponse.json({ message: "El correo y el código son requeridos." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    
    // 1. Confirm the code with Cognito
    await confirmSignUp(body.email, body.code);

    // 2. Mark the local user as verified in DB
    const user = await prisma.user.update({
      where: { email: body.email.trim().toLowerCase() },
      data: { emailVerified: true },
    });

    // 3. Create session and cookie
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    setSessionCookie(token);

    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "EMAIL_VERIFIED",
          details: JSON.stringify({ email: user.email }),
        },
      });
    } catch (logError) {
      console.error("Failed to log EMAIL_VERIFIED activity:", logError);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Cognito verification failed.", error);
    
    if (error.code === "CodeMismatchException") {
      return NextResponse.json({ message: "El código ingresado es incorrecto." }, { status: 400 });
    }
    
    if (error.code === "ExpiredCodeException") {
      return NextResponse.json({ message: "El código ha expirado. Por favor, solicita uno nuevo." }, { status: 400 });
    }
    
    if (error.code === "NotAuthorizedException") {
      // Sometimes returned if already confirmed
      return NextResponse.json({ message: "El usuario ya ha sido verificado u ocurrió un error de autorización." }, { status: 400 });
    }
    
    return NextResponse.json(
      { message: error.message || "No pudimos verificar tu correo en este momento." },
      { status: error.status || 500 }
    );
  }
}
