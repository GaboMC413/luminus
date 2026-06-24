import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

const COGNITO_STATE_COOKIE = "luminus_cognito_oauth_state";

type CognitoTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type CognitoUserInfo = {
  sub: string;
  email?: string;
  email_verified?: boolean | string;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
};

function getCognitoClientConfig() {
  const clientId = process.env.COGNITO_CLIENT_ID;
  const clientSecret = process.env.COGNITO_CLIENT_SECRET;
  const domain = process.env.COGNITO_DOMAIN?.trim().replace(/\/$/, "");

  if (!clientId || !domain) {
    throw new Error("Cognito OAuth is not configured.");
  }

  const cognitoDomain = domain.startsWith("http://") || domain.startsWith("https://")
    ? domain
    : `https://${domain}`;

  return { clientId, clientSecret, cognitoDomain };
}

function getPublicOrigin(requestUrl: URL) {
  return (process.env.AUTH_BASE_URL || requestUrl.origin).replace(/\/$/, "");
}

function redirectTo(requestUrl: URL, path: string) {
  return NextResponse.redirect(new URL(path, getPublicOrigin(requestUrl)));
}

async function exchangeCodeForAccessToken(code: string, redirectUri: string) {
  const { clientId, clientSecret, cognitoDomain } = getCognitoClientConfig();
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  if (clientSecret) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
  }

  const response = await fetch(new URL("/oauth2/token", cognitoDomain), {
    method: "POST",
    headers,
    body,
  });

  const data = (await response.json().catch(() => null)) as CognitoTokenResponse | null;

  if (!response.ok || !data?.access_token) {
    throw new Error(data?.error_description || data?.error || "Cognito token exchange failed.");
  }

  return data.access_token;
}

async function fetchCognitoUser(accessToken: string) {
  const { cognitoDomain } = getCognitoClientConfig();
  const response = await fetch(new URL("/oauth2/userInfo", cognitoDomain), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as CognitoUserInfo | null;

  if (!response.ok || !data?.sub || !data.email) {
    throw new Error("Cognito user profile could not be fetched.");
  }

  return data;
}

function isEmailVerified(value: CognitoUserInfo["email_verified"]) {
  return value === true || value === "true";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");
  const storedState = cookies().get(COGNITO_STATE_COOKIE)?.value;

  cookies().set(COGNITO_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  if (error) {
    return redirectTo(requestUrl, "/auth/iniciar-sesion?error=cognito");
  }

  if (!code || !state || !storedState || state !== storedState) {
    return redirectTo(requestUrl, "/auth/iniciar-sesion?error=cognito");
  }

  try {
    const redirectUri = `${getPublicOrigin(requestUrl)}/api/auth/cognito/callback`;
    const accessToken = await exchangeCodeForAccessToken(code, redirectUri);
    const cognitoUser = await fetchCognitoUser(accessToken);
    const email = cognitoUser.email!.trim().toLowerCase();
    const cognitoSubject = cognitoUser.sub;
    const firstName = cognitoUser.given_name || "";
    const lastName = cognitoUser.family_name || "";
    const fullName = `${firstName} ${lastName}`.trim() || cognitoUser.name || "";

    const { prisma } = await import("@/lib/db");
    const existingByIdentity = await prisma.userIdentity.findUnique({
      where: {
        provider_providerSubject: {
          provider: "cognito",
          providerSubject: cognitoSubject,
        },
      },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });
    const existingByLegacySub = await prisma.user.findUnique({
      where: { cognitoSub: cognitoSubject },
      include: { profile: true },
    });
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    const matchingUsers = [existingByIdentity?.user, existingByLegacySub, existingByEmail].filter(Boolean);
    const matchingUserIds = new Set(matchingUsers.map((user) => user!.id));

    if (matchingUserIds.size > 1) {
      console.error("Cognito OAuth account collision.", { email });
      return redirectTo(requestUrl, "/auth/iniciar-sesion?error=cognito");
    }

    const existingUser = existingByIdentity?.user || existingByLegacySub || existingByEmail;
    const isNewUser = !existingUser;
    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            authProvider: existingUser.authProvider === "unknown" ? "email" : existingUser.authProvider,
            emailVerified: isEmailVerified(cognitoUser.email_verified) || existingUser.emailVerified,
            lastLoginAt: new Date(),
            identities: {
              upsert: {
                where: {
                  provider_providerSubject: {
                    provider: "cognito",
                    providerSubject: cognitoSubject,
                  },
                },
                create: {
                  provider: "cognito",
                  providerSubject: cognitoSubject,
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
                  avatarUrl: cognitoUser.picture || undefined,
                },
                update: {
                  firstName: existingUser.profile?.firstName || firstName || undefined,
                  lastName: existingUser.profile?.lastName || lastName || undefined,
                  fullName: existingUser.profile?.fullName || fullName || undefined,
                  avatarUrl: existingUser.profile?.avatarUrl || cognitoUser.picture || undefined,
                },
              },
            },
          },
          include: { profile: true },
        })
      : await prisma.user.create({
          data: {
            email,
            cognitoSub: cognitoSubject,
            authProvider: "email",
            emailVerified: isEmailVerified(cognitoUser.email_verified),
            lastLoginAt: new Date(),
            identities: {
              create: {
                provider: "cognito",
                providerSubject: cognitoSubject,
                email,
              },
            },
            profile: {
              create: {
                firstName,
                lastName,
                fullName,
                avatarUrl: cognitoUser.picture || undefined,
              },
            },
          },
          include: { profile: true },
        });

    if (isNewUser) {
      try {
        const { sendWelcomeMessage } = await import("@/lib/auth/welcome");
        await sendWelcomeMessage(prisma, user.id);
      } catch (welcomeError) {
        console.error("Welcome message setup failed, proceeding with Cognito registration.", welcomeError);
      }
    }

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    setSessionCookie(token);

    return redirectTo(requestUrl, user.profile?.isOnboarded ? "/comunidad" : "/auth/registrarse?onboarding=1");
  } catch (callbackError) {
    console.error("Cognito OAuth callback failed.", callbackError);
    return redirectTo(requestUrl, "/auth/iniciar-sesion?error=cognito");
  }
}
