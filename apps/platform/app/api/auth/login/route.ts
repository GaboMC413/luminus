import { NextResponse } from "next/server";
import { getCognitoErrorMessage, getCognitoErrorStatus, signInWithCognito } from "@/lib/auth/cognito-password";
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
    const normalizedEmail = validation.email.trim().toLowerCase();

    const existingLocalUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        status: true,
        cognitoSub: true,
        identities: {
          where: { provider: "cognito" },
          select: { providerSubject: true },
          take: 1,
        },
      },
    });

    if (existingLocalUser && existingLocalUser.status === "disabled") {
      return NextResponse.json(
        { message: "Tu cuenta no esta activa. Contacta al equipo de LUMINUS para revisarla." },
        { status: 403 },
      );
    }

    const cognitoUsername = existingLocalUser?.identities[0]?.providerSubject || existingLocalUser?.cognitoSub;
    let cognitoSession;
    try {
      cognitoSession = await signInWithCognito(validation.email, validation.password, cognitoUsername);
    } catch (cognitoError: any) {
      if (cognitoError.code === "UserNotConfirmedException") {
        if (process.env.SKIP_EMAIL_VERIFICATION === "true") {
          const { adminConfirmUser } = await import("@/lib/auth/cognito-admin");
          await adminConfirmUser(validation.email);
          cognitoSession = await signInWithCognito(validation.email, validation.password, cognitoUsername);
        } else {
          return NextResponse.json(
            { message: "Tu cuenta necesita confirmar el correo.", code: "REQUIRES_VERIFICATION" },
            { status: 403 }
          );
        }
      } else {
        throw cognitoError;
      }
    }

    const existingByIdentity = await prisma.userIdentity.findUnique({
      where: {
        provider_providerSubject: {
          provider: "cognito",
          providerSubject: cognitoSession.profile.sub,
        },
      },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });
    const existingByEmail = await prisma.user.findUnique({
      where: { email: cognitoSession.profile.email },
      include: { profile: true },
    });
    const user = existingByIdentity?.user || existingByEmail;

    if (!user) {
      return NextResponse.json(
        { message: "No encontramos una cuenta LUMINUS asociada a este correo. Registrate gratis para continuar." },
        { status: 404 },
      );
    }

    if (user.status === "deleted") {
      if (body?.reactivate) {
        await prisma.user.update({
          where: { id: user.id },
          data: { status: "active" },
        });
        user.status = "active";
        try {
          const { syncCognitoUserStatus } = await import("@/lib/auth/cognito-admin");
          await syncCognitoUserStatus(user as any, "active");
        } catch (err) {
          console.error("Failed to sync status to active in cognito", err);
        }
      } else {
        return NextResponse.json(
          { code: "REQUIRES_REACTIVATION", message: "Tu cuenta fue eliminada. ¿Deseas reactivarla?" },
          { status: 403 },
        );
      }
    } else if (user.status !== "active") {
      return NextResponse.json(
        { message: "Tu cuenta no esta activa. Contacta al equipo de LUMINUS para revisarla." },
        { status: 403 },
      );
    }

    const fullName = `${cognitoSession.profile.givenName} ${cognitoSession.profile.familyName}`.trim() || cognitoSession.profile.name;
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        cognitoSub: user.cognitoSub.startsWith("email:") ? cognitoSession.profile.sub : user.cognitoSub,
        emailVerified: cognitoSession.profile.emailVerified || user.emailVerified,
        authProvider: user.authProvider === "unknown" ? "email" : user.authProvider,
        lastLoginAt: new Date(),
        identities: {
          upsert: {
            where: {
              provider_providerSubject: {
                provider: "cognito",
                providerSubject: cognitoSession.profile.sub,
              },
            },
            create: {
              provider: "cognito",
              providerSubject: cognitoSession.profile.sub,
              email: cognitoSession.profile.email,
            },
            update: {
              email: cognitoSession.profile.email,
            },
          },
        },
        profile: {
          upsert: {
            create: {
              firstName: cognitoSession.profile.givenName,
              lastName: cognitoSession.profile.familyName,
              fullName,
              avatarUrl: cognitoSession.profile.picture || undefined,
            },
            update: {
              firstName: user.profile?.firstName || cognitoSession.profile.givenName || undefined,
              lastName: user.profile?.lastName || cognitoSession.profile.familyName || undefined,
              fullName: user.profile?.fullName || fullName || undefined,
              avatarUrl: user.profile?.avatarUrl || cognitoSession.profile.picture || undefined,
            },
          },
        },
      },
      include: { profile: true },
    });

    const token = createSessionToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    setSessionCookie(token);

    try {
      await prisma.activityLog.create({
        data: {
          userId: updatedUser.id,
          action: "LOGIN",
          details: JSON.stringify({ email: updatedUser.email }),
        },
      });
    } catch (logError) {
      console.error("Failed to log LOGIN activity:", logError);
    }

    return NextResponse.json({ user: serializeUser(updatedUser) });
  } catch (error) {
    console.error("Cognito login flow failed.", error);
    return NextResponse.json(
      { message: getCognitoErrorMessage(error, "No pudimos iniciar sesion en este momento.") },
      { status: getCognitoErrorStatus(error) },
    );
  }
}
