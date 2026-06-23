import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

const GOOGLE_STATE_COOKIE = "luminus_google_oauth_state";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  sub: string;
  email: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
};

function getGoogleClientConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured.");
  }

  return { clientId, clientSecret };
}

function getPublicOrigin(requestUrl: URL) {
  return (process.env.AUTH_BASE_URL || requestUrl.origin).replace(/\/$/, "");
}

function redirectTo(requestUrl: URL, path: string) {
  return NextResponse.redirect(new URL(path, getPublicOrigin(requestUrl)));
}

async function exchangeCodeForAccessToken(code: string, redirectUri: string) {
  const { clientId, clientSecret } = getGoogleClientConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = (await response.json().catch(() => null)) as GoogleTokenResponse | null;

  if (!response.ok || !data?.access_token) {
    throw new Error(data?.error_description || data?.error || "Google token exchange failed.");
  }

  return data.access_token;
}

async function fetchGoogleUser(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as GoogleUserInfo | null;

  if (!response.ok || !data?.sub || !data.email) {
    throw new Error("Google user profile could not be fetched.");
  }

  return data;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const storedState = cookies().get(GOOGLE_STATE_COOKIE)?.value;

  cookies().set(GOOGLE_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  if (!code || !state || !storedState || state !== storedState) {
    return redirectTo(requestUrl, "/auth/iniciar-sesion?error=google");
  }

  try {
    const redirectUri = `${getPublicOrigin(requestUrl)}/api/auth/google/callback`;
    const accessToken = await exchangeCodeForAccessToken(code, redirectUri);
    const googleUser = await fetchGoogleUser(accessToken);
    const email = googleUser.email.trim().toLowerCase();
    const googleProviderSubject = googleUser.sub;
    const legacyGoogleSub = `google:${googleProviderSubject}`;
    const firstName = googleUser.given_name || "";
    const lastName = googleUser.family_name || "";
    const fullName = `${firstName} ${lastName}`.trim() || googleUser.name || "";

    const { prisma } = await import("@/lib/db");
    const existingByIdentity = await prisma.userIdentity.findUnique({
      where: {
        provider_providerSubject: {
          provider: "google",
          providerSubject: googleProviderSubject,
        },
      },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });
    const existingByLegacySub = await prisma.user.findUnique({
      where: { cognitoSub: legacyGoogleSub },
      include: { profile: true },
    });
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    const matchingUsers = [existingByIdentity?.user, existingByLegacySub, existingByEmail].filter(Boolean);
    const matchingUserIds = new Set(matchingUsers.map((user) => user!.id));

    if (matchingUserIds.size > 1) {
      console.error("Google OAuth account collision.", { email });
      return redirectTo(requestUrl, "/auth/iniciar-sesion?error=google");
    }

    const existingUser = existingByIdentity?.user || existingByLegacySub || existingByEmail;
    const isNewUser = !existingUser;
    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            authProvider: existingUser.authProvider === "unknown" ? "google" : existingUser.authProvider,
            emailVerified: googleUser.email_verified ?? existingUser.emailVerified,
            lastLoginAt: new Date(),
            identities: {
              upsert: {
                where: {
                  provider_providerSubject: {
                    provider: "google",
                    providerSubject: googleProviderSubject,
                  },
                },
                create: {
                  provider: "google",
                  providerSubject: googleProviderSubject,
                  email,
                },
                update: {
                  email,
                },
              },
            },
            profile: {
              upsert: {
                create: {
                  firstName,
                  lastName,
                  fullName,
                  avatarUrl: googleUser.picture || undefined,
                },
                update: {
                  firstName: existingUser.profile?.firstName || firstName || undefined,
                  lastName: existingUser.profile?.lastName || lastName || undefined,
                  fullName: existingUser.profile?.fullName || fullName || undefined,
                  avatarUrl: existingUser.profile?.avatarUrl || googleUser.picture || undefined,
                },
              },
            },
          },
          include: { profile: true },
        })
      : await prisma.user.create({
          data: {
            email,
            cognitoSub: legacyGoogleSub,
            authProvider: "google",
            emailVerified: googleUser.email_verified ?? true,
            lastLoginAt: new Date(),
            identities: {
              create: {
                provider: "google",
                providerSubject: googleProviderSubject,
                email,
              },
            },
            profile: {
              create: {
                firstName,
                lastName,
                fullName,
                avatarUrl: googleUser.picture || undefined,
              },
            },
          },
          include: { profile: true },
        });

    if (isNewUser) {
      // Send welcome conversation message gracefully
      try {
        const { sendWelcomeMessage } = await import("@/lib/auth/welcome");
        await sendWelcomeMessage(prisma, user.id);
      } catch (welcomeError) {
        console.error("Welcome message setup failed, proceeding with Google registration.", welcomeError);
      }
    }

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    setSessionCookie(token);

    return redirectTo(requestUrl, user.profile?.isOnboarded ? "/comunidad" : "/auth/registrarse?onboarding=1");
  } catch (error) {
    console.error("Google OAuth callback failed.", error);
    return redirectTo(requestUrl, "/auth/iniciar-sesion?error=google");
  }
}
