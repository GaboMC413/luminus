import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { decodeCognitoIdToken } from "@/lib/auth/cognito-password";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const COGNITO_STATE_COOKIE = "luminus_cognito_oauth_state";

type CognitoTokenResponse = {
  access_token?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
};

type CognitoStartState = {
  state: string;
  provider?: "Google";
};

type CognitoIdentityClaim = {
  providerName?: string;
  providerType?: string;
  userId?: string;
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

type CognitoIdTokenClaims = {
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
  identities?: CognitoIdentityClaim[] | string;
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

  if (!response.ok || !data?.access_token || !data.id_token) {
    throw new Error(data?.error_description || data?.error || "Cognito token exchange failed.");
  }

  return {
    accessToken: data.access_token,
    idToken: data.id_token,
  };
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

function readStoredState(value?: string): CognitoStartState | null {
  if (!value) {
    return null;
  }

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {}

  try {
    const parsed = JSON.parse(decoded) as CognitoStartState;
    return parsed?.state ? parsed : null;
  } catch {
    return { state: decoded };
  }
}

function readIdentities(value: CognitoIdTokenClaims["identities"]) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value) as CognitoIdentityClaim[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getFederatedProvider(claims: CognitoIdTokenClaims, requestedProvider?: CognitoStartState["provider"]) {
  const identities = readIdentities(claims.identities);
  const identity = identities.find((entry) => entry.providerName || entry.providerType);
  const providerName = identity?.providerName || identity?.providerType || requestedProvider;

  if (providerName?.toLowerCase() === "google") {
    return {
      authProvider: "google" as const,
      externalProvider: "google" as const,
      externalProviderSubject: identity?.userId,
    };
  }

  return {
    authProvider: "email" as const,
    externalProvider: null,
    externalProviderSubject: null,
  };
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");
  const storedState = readStoredState(cookies().get(COGNITO_STATE_COOKIE)?.value);

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

  if (!code || !state || !storedState || state !== storedState.state) {
    return redirectTo(requestUrl, "/auth/iniciar-sesion?error=cognito");
  }

  try {
    const redirectUri = `${getPublicOrigin(requestUrl)}/api/auth/cognito/callback`;
    const { accessToken, idToken } = await exchangeCodeForAccessToken(code, redirectUri);
    const tokenClaims = decodeCognitoIdToken(idToken) as CognitoIdTokenClaims;
    const federatedProvider = getFederatedProvider(tokenClaims, storedState.provider);
    const cognitoUser = await fetchCognitoUser(accessToken);
    const email = (cognitoUser.email || tokenClaims.email || "").trim().toLowerCase();
    const cognitoSubject = tokenClaims.sub || cognitoUser.sub;
    const firstName = cognitoUser.given_name || tokenClaims.given_name || "";
    const lastName = cognitoUser.family_name || tokenClaims.family_name || "";
    const fullName = `${firstName} ${lastName}`.trim() || cognitoUser.name || tokenClaims.name || "";
    const avatarUrl = cognitoUser.picture || tokenClaims.picture || undefined;

    if (!email || !cognitoSubject) {
      throw new Error("Cognito user profile is missing required identifiers.");
    }

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
    const existingByExternalIdentity = federatedProvider.externalProvider && federatedProvider.externalProviderSubject
      ? await prisma.userIdentity.findUnique({
          where: {
            provider_providerSubject: {
              provider: federatedProvider.externalProvider,
              providerSubject: federatedProvider.externalProviderSubject,
            },
          },
          include: {
            user: {
              include: { profile: true },
            },
          },
        })
      : null;
    const existingByLegacySub = await prisma.user.findUnique({
      where: { cognitoSub: cognitoSubject },
      include: { profile: true },
    });
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    const matchingUsers = [existingByIdentity?.user, existingByExternalIdentity?.user, existingByLegacySub, existingByEmail].filter(Boolean);
    const matchingUserIds = new Set(matchingUsers.map((user) => user!.id));

    if (matchingUserIds.size > 1) {
      console.error("Cognito OAuth account collision.", { email });
      return redirectTo(requestUrl, "/auth/iniciar-sesion?error=cognito");
    }

    const existingUser = existingByIdentity?.user || existingByExternalIdentity?.user || existingByLegacySub || existingByEmail;
    const isNewUser = !existingUser;

    if (existingUser) {
      if (existingUser.status === "disabled") {
        return redirectTo(requestUrl, "/auth/iniciar-sesion?error=account_disabled");
      }
      if (existingUser.status === "deleted") {
        const token = createSessionToken({
          userId: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
        });
        cookies().set("luminus_reactivation_token", token, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 5 * 60,
        });
        return redirectTo(requestUrl, "/auth/iniciar-sesion?reactivate_oauth=1");
      }
    }

    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            cognitoSub: existingUser.cognitoSub || cognitoSubject,
            authProvider: existingUser.authProvider === "unknown" || existingUser.authProvider === "email"
              ? federatedProvider.authProvider
              : existingUser.authProvider,
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
                  avatarUrl,
                },
                update: {
                  firstName: existingUser.profile?.firstName || firstName || undefined,
                  lastName: existingUser.profile?.lastName || lastName || undefined,
                  fullName: existingUser.profile?.fullName || fullName || undefined,
                  avatarUrl: existingUser.profile?.avatarUrl || avatarUrl,
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
            authProvider: federatedProvider.authProvider,
            emailVerified: isEmailVerified(cognitoUser.email_verified),
            lastLoginAt: new Date(),
            trialExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months trial
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
                avatarUrl,
              },
            },
          },
          include: { profile: true },
        });

    if (federatedProvider.externalProvider && federatedProvider.externalProviderSubject) {
      await prisma.userIdentity.upsert({
        where: {
          provider_providerSubject: {
            provider: federatedProvider.externalProvider,
            providerSubject: federatedProvider.externalProviderSubject,
          },
        },
        create: {
          userId: user.id,
          provider: federatedProvider.externalProvider,
          providerSubject: federatedProvider.externalProviderSubject,
          email,
        },
        update: {
          userId: user.id,
          email,
        },
      });
    }

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

    try {
      if (isNewUser) {
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action: "USER_CREATED",
            details: JSON.stringify({ email: user.email, provider: federatedProvider.authProvider }),
          },
        });
      }
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "LOGIN",
          details: JSON.stringify({ email: user.email, provider: federatedProvider.authProvider }),
        },
      });
    } catch (logError) {
      console.error("Failed to log activity in Cognito callback:", logError);
    }

    return redirectTo(requestUrl, user.profile?.isOnboarded ? "/comunidad" : "/auth/registrarse?onboarding=1");
  } catch (callbackError) {
    console.error("Cognito OAuth callback failed.", callbackError);
    return redirectTo(requestUrl, "/auth/iniciar-sesion?error=cognito");
  }
}
