import { NextResponse } from "next/server";
import { getCognitoErrorMessage, getCognitoErrorStatus, signUpWithCognito } from "@/lib/auth/cognito-password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { serializeUser, validateAuthInput } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const validation = validateAuthInput(body);

  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const existingUser = await prisma.user.findUnique({
      where: { email: validation.email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Ya existe una cuenta registrada con este correo." },
        { status: 409 },
      );
    }

    const cognitoUser = await signUpWithCognito(validation.email, validation.password);
    const user = await prisma.user.create({
      data: {
        email: validation.email,
        cognitoSub: cognitoUser.userSub,
        authProvider: "email",
        emailVerified: cognitoUser.userConfirmed,
        trialExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months trial
        identities: {
          create: {
            provider: "cognito",
            providerSubject: cognitoUser.userSub,
            email: validation.email,
          },
        },
        profile: {
          create: {},
        },
      },
      include: { profile: true },
    });

    try {
      const { sendWelcomeMessage } = await import("@/lib/auth/welcome");
      await sendWelcomeMessage(prisma, user.id);
    } catch (welcomeError) {
      console.error("Welcome message setup failed, proceeding with registration.", welcomeError);
    }

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
          action: "USER_CREATED",
          details: JSON.stringify({ email: user.email }),
        },
      });
    } catch (logError) {
      console.error("Failed to log USER_CREATED activity:", logError);
    }

    return NextResponse.json({ user: serializeUser(user) }, { status: 201 });
  } catch (error) {
    console.error("Cognito registration flow failed.", error);
    return NextResponse.json(
      { message: getCognitoErrorMessage(error, "No pudimos crear tu cuenta en este momento.") },
      { status: getCognitoErrorStatus(error) },
    );
  }
}
