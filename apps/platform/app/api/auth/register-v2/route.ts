import { NextResponse } from "next/server";
import { getCognitoErrorMessage, getCognitoErrorStatus, signUpWithCognito } from "@/lib/auth/cognito-password";
import { adminConfirmUser, adminCreateAndConfirmUser, adminDeleteCognitoUser } from "@/lib/auth/cognito-admin";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { validateAuthInput } from "@/lib/auth/validation";
import { verifyTurnstileToken } from "@/lib/turnstile";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
    }

    const { action } = body;

    if (action !== "start_registration") {
      return NextResponse.json({ message: "Invalid action." }, { status: 400 });
    }

    const validation = validateAuthInput(body);
    if (!validation.ok) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const turnstileResult = await verifyTurnstileToken(body?.turnstileToken);
    if (!turnstileResult.success) {
      return NextResponse.json({ message: turnstileResult.error }, { status: 400 });
    }

    const email = validation.email;
    const password = validation.password;
    const plan = body.plan === "free" ? "FREE" : "MEMBERSHIP";
    const billing = body.billing === "annual" ? "annual" : "monthly";

    const { prisma } = await import("@/lib/db");
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, emailVerified: true, status: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Ya existe una cuenta con este correo. Iniciar sesión.", code: "EMAIL_EXISTS" },
        { status: 409 }
      );
    }

    let userSub = "";
    try {
      userSub = await adminCreateAndConfirmUser(email, password);
    } catch (cognitoErr: any) {
      const isUsernameExists =
        cognitoErr?.name === "UsernameExistsException" ||
        cognitoErr?.code === "UsernameExistsException";

      if (isUsernameExists) {
        // User does not exist in PostgreSQL (checked above), so this is an orphaned Cognito record.
        try {
          await adminDeleteCognitoUser(email);
          userSub = await adminCreateAndConfirmUser(email, password);
        } catch (recreateErr: any) {
          return NextResponse.json(
            { message: getCognitoErrorMessage(recreateErr, "No pudimos crear la cuenta.") },
            { status: getCognitoErrorStatus(recreateErr, 400) }
          );
        }
      } else {
        // If admin creation fails (e.g. IAM permission), fallback to signUpWithCognito + adminConfirmUser
        try {
          const fallbackUser = await signUpWithCognito(email, password);
          userSub = fallbackUser.userSub;
          await adminConfirmUser(email);
        } catch (fallbackErr: any) {
          if (
            fallbackErr?.name === "UsernameExistsException" ||
            fallbackErr?.code === "UsernameExistsException"
          ) {
            try {
              await adminDeleteCognitoUser(email);
              const retried = await signUpWithCognito(email, password);
              userSub = retried.userSub;
              await adminConfirmUser(email);
            } catch (retryErr: any) {
              return NextResponse.json(
                { message: getCognitoErrorMessage(retryErr, "No pudimos crear la cuenta.") },
                { status: getCognitoErrorStatus(retryErr, 400) }
              );
            }
          } else if (process.env.NODE_ENV !== "production") {
            console.warn("[LOCAL DEV] Bypassing Cognito error in local dev:", fallbackErr?.message || fallbackErr);
            userSub = "local-sub-" + Date.now();
          } else {
            return NextResponse.json(
              { message: getCognitoErrorMessage(cognitoErr || fallbackErr, "No pudimos crear la cuenta.") },
              { status: getCognitoErrorStatus(cognitoErr || fallbackErr, 400) }
            );
          }
        }
      }
    }

    const selectedPlan = plan === "MEMBERSHIP" ? (billing === "annual" ? "Annual" : "Monthly") : "Free";

    // Create local user record in PostgreSQL
    const user = await prisma.user.create({
      data: {
        email,
        cognitoSub: userSub,
        authProvider: "email",
        emailVerified: true,
        role: "USER",
        status: "active",
        tier: "FREE",
        trialExpiresAt: null,
        identities: {
          create: {
            provider: "cognito",
            providerSubject: userSub,
            email,
          },
        },
        profile: {
          create: {
            selectedPlan,
            isOnboarded: false,
          },
        },
      },
      select: { id: true, email: true, role: true },
    });

    // Establish session cookie immediately
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    await setSessionCookie(token);

    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "USER_CREATED",
          details: JSON.stringify({ email: user.email, plan: selectedPlan }),
        },
      });
    } catch (logErr) {
      console.error("Failed to log USER_CREATED activity:", logErr);
    }

    return NextResponse.json({
      success: true,
      requiresVerification: false,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("register-v2 error:", error);
    return NextResponse.json(
      { message: getCognitoErrorMessage(error, "No pudimos completar tu solicitud en este momento.") },
      { status: getCognitoErrorStatus(error) }
    );
  }
}
