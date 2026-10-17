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
    const email = body.email.trim().toLowerCase();
    
    // 1. Confirm the code with Cognito (bypass if in local dev)
    try {
      await confirmSignUp(email, body.code);
    } catch (cognitoError: any) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[LOCAL DEV] Bypassing Cognito verification error in local. Code accepted:", body.code);
      } else {
        throw cognitoError;
      }
    }

    // 2. Mark the local user as verified in DB (create if needed in local dev)
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      if (process.env.NODE_ENV !== "production") {
        user = await prisma.user.create({
          data: {
            email,
            cognitoSub: "local-dev-" + Date.now(),
            authProvider: "email",
            emailVerified: true,
            role: "USER",
            status: "active",
            tier: "FREE",
          },
        });
      } else {
        return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
      }
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

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
