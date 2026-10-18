import { NextResponse } from "next/server";
import { getCognitoErrorMessage, getCognitoErrorStatus, signUpWithCognito, resendConfirmationCode } from "@/lib/auth/cognito-password";
import { adminConfirmUser } from "@/lib/auth/cognito-admin";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { serializeUser } from "@/lib/auth/validation";
import { createMembershipSubscription } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
    }

    const { prisma } = await import("@/lib/db");
    const { action } = body;

    // ACTION: Start Registration (Screen 2: creates Cognito user and sends 6-digit code)
    if (action === "start_registration") {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const password = typeof body.password === "string" ? body.password : "";
      const plan = body.plan === "free" ? "FREE" : "MEMBERSHIP";

      if (!email || !password || password.length < 8) {
        return NextResponse.json(
          { message: "Por favor proporciona un correo válido y una contraseña de al menos 8 caracteres." },
          { status: 400 }
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, role: true, emailVerified: true, status: true },
      });

      // LOCAL DEV BYPASS: In local development, bypass email verification and auto-login!
      if (process.env.NODE_ENV !== "production") {
        let user = existingUser;
        if (!user) {
          const userSub = "local-sub-" + Date.now();
          const createdUser = await prisma.user.create({
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
                  selectedPlan: plan === "MEMBERSHIP" ? "Monthly" : "Free",
                  isOnboarded: false,
                },
              },
            },
            select: { id: true, email: true, role: true },
          });
          user = { ...createdUser, emailVerified: true, status: "active" as any };
        } else {
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true },
          });
        }

        return NextResponse.json({
          success: true,
          requiresVerification: true,
          message: "Hemos enviado un código a tu correo.",
        });
      }

      if (existingUser && existingUser.emailVerified) {
        return NextResponse.json(
          { message: "Ya existe una cuenta con este correo. Iniciar sesión.", code: "EMAIL_EXISTS" },
          { status: 409 }
        );
      }

      let userSub = "";
      try {
        const cognitoUser = await signUpWithCognito(email, password);
        userSub = cognitoUser.userSub;
      } catch (cognitoErr: any) {
        if (cognitoErr.code === "UsernameExistsException") {
          try {
            await resendConfirmationCode(email);
            return NextResponse.json({
              success: true,
              requiresVerification: true,
              message: "Hemos enviado un código a tu correo.",
            });
          } catch {
            return NextResponse.json(
              { message: "Ya existe una cuenta con este correo. Iniciar sesión.", code: "EMAIL_EXISTS" },
              { status: 409 }
            );
          }
        }
        if (process.env.NODE_ENV !== "production") {
          console.warn("[LOCAL DEV] Bypassing Cognito signUp error in local dev:", cognitoErr.message || cognitoErr);
          userSub = "local-sub-" + Date.now();
        } else {
          return NextResponse.json(
            { message: getCognitoErrorMessage(cognitoErr, "No pudimos crear la cuenta.") },
            { status: getCognitoErrorStatus(cognitoErr, 400) }
          );
        }
      }

      // Create or update local user record
      if (!existingUser) {
        await prisma.user.create({
          data: {
            email,
            cognitoSub: userSub,
            authProvider: "email",
            emailVerified: false,
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
                selectedPlan: plan === "MEMBERSHIP" ? "Monthly" : "Free",
                isOnboarded: false,
              },
            },
          },
        });
      }

      return NextResponse.json({
        success: true,
        requiresVerification: true,
        message: "Código de verificación enviado.",
      });
    }

    // ACTION 1: Quick check if email is already in use
    if (action === "check_email") {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      if (!email) {
        return NextResponse.json({ message: "Email is required." }, { status: 400 });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, status: true },
      });

      return NextResponse.json({
        exists: Boolean(existingUser),
        message: existingUser ? "Este correo ya está registrado en LUMINUS." : null,
      });
    }

    // ACTION 2: Initialize Stripe Subscription Checkout Intent ($5/mo)
    if (action === "create_subscription_intent") {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const phone = typeof body.phone === "string" ? body.phone.trim() : "";

      if (!email || !name) {
        return NextResponse.json({ message: "Name and email are required for membership." }, { status: 400 });
      }

      // Check if email already exists before opening Stripe
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "Ya existe una cuenta con este correo. Por favor inicia sesión.", code: "EMAIL_EXISTS" },
          { status: 409 }
        );
      }

      const subscriptionData = await createMembershipSubscription({
        email,
        name,
        phone,
      });

      return NextResponse.json(subscriptionData);
    }

    // ACTION 3: Finalize Account Creation & Direct Login
    if (action === "finalize_registration") {
      const {
        email: rawEmail,
        password,
        firstName,
        lastName,
        phoneNumber,
        city,
        country,
        plan = "MEMBERSHIP", // 'MEMBERSHIP' | 'FREE'
        stripeCustomerId,
        stripeSubscriptionId,
      } = body;

      const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

      if (!email || !password || password.length < 8) {
        return NextResponse.json(
          { message: "Por favor proporciona un correo válido y una contraseña de al menos 8 caracteres." },
          { status: 400 }
        );
      }

      // Check user existence
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "Ya existe una cuenta registrada con este correo.", code: "EMAIL_EXISTS" },
          { status: 409 }
        );
      }

      // 1. Create Cognito user
      const cognitoUser = await signUpWithCognito(email, password);

      // 2. Auto-confirm in Cognito so direct entry without blocking OTP modal is achieved
      await adminConfirmUser(email);

      // 3. Create User in PostgreSQL (Zero free trials, explicit tier, immediate onboarding)
      const isPaidMember = plan === "MEMBERSHIP";
      const now = new Date();
      const cleanFirstName = typeof firstName === "string" ? firstName.trim() : "";
      const cleanLastName = typeof lastName === "string" ? lastName.trim() : "";
      const fullName = [cleanFirstName, cleanLastName].filter(Boolean).join(" ") || null;

      const user = await prisma.user.create({
        data: {
          email,
          cognitoSub: cognitoUser.userSub,
          authProvider: "email",
          emailVerified: true,
          role: "USER",
          status: "active",
          tier: isPaidMember ? "BASIC" : "FREE",
          trialExpiresAt: null, // No 3-month trial
          memberSince: isPaidMember ? now : null,
          stripeCustomerId: isPaidMember && stripeCustomerId ? String(stripeCustomerId) : null,
          stripeSubscriptionId: isPaidMember && stripeSubscriptionId ? String(stripeSubscriptionId) : null,
          identities: {
            create: {
              provider: "cognito",
              providerSubject: cognitoUser.userSub,
              email,
            },
          },
          profile: {
            create: {
              firstName: cleanFirstName || null,
              lastName: cleanLastName || null,
              fullName,
              phoneNumber: typeof phoneNumber === "string" ? phoneNumber.trim() : null,
              city: typeof city === "string" ? city.trim() : null,
              country: typeof country === "string" ? country.trim() : null,
              selectedPlan: isPaidMember ? "Monthly" : "Free",
              isOnboarded: true, // Direct entry, no further mandatory steps
            },
          },
        },
        include: { profile: true },
      });

      // 4. Send background welcome messages
      try {
        const { sendWelcomeMessage } = await import("@/lib/auth/welcome");
        await sendWelcomeMessage(prisma, user.id);
        const { sendWelcomeEmail } = await import("@/lib/mails/sender");
        await sendWelcomeEmail(user.email, user.profile?.firstName || undefined);
      } catch (welcomeError) {
        console.error("Welcome communications error (non-fatal):", welcomeError);
      }

      // 5. Establish Session Cookie
      const token = createSessionToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      setSessionCookie(token);

      // 6. Log activity
      try {
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action: isPaidMember ? "MEMBER_JOINED" : "USER_JOINED_FREE",
            details: JSON.stringify({ email: user.email, plan }),
          },
        });
      } catch (logErr) {
        console.error("Failed to log activity:", logErr);
      }

      return NextResponse.json({
        ok: true,
        user: serializeUser(user),
        redirectUrl: "/comunidad",
      }, { status: 201 });
    }

    return NextResponse.json({ message: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("register-v2 error:", error);
    return NextResponse.json(
      { message: getCognitoErrorMessage(error, "No pudimos completar tu solicitud en este momento.") },
      { status: getCognitoErrorStatus(error) }
    );
  }
}
