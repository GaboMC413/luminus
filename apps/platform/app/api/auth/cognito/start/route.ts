import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const COGNITO_STATE_COOKIE = "luminus_cognito_oauth_state";
const COGNITO_SCOPES = ["openid", "email", "profile"];

type CognitoStartState = {
  state: string;
  provider?: "Google";
  intent?: "signup" | "signin";
};

function getPublicOrigin(requestUrl: URL) {
  return (process.env.AUTH_BASE_URL || requestUrl.origin).replace(/\/$/, "");
}

function getCognitoDomain() {
  const domain = process.env.COGNITO_DOMAIN?.trim().replace(/\/$/, "");

  if (!domain) {
    return null;
  }

  return domain.startsWith("http://") || domain.startsWith("https://")
    ? domain
    : `https://${domain}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = process.env.COGNITO_CLIENT_ID;
  const cognitoDomain = getCognitoDomain();
  const origin = getPublicOrigin(url);
  const providerParam = url.searchParams.get("provider")?.trim().toLowerCase();
  const provider = providerParam === "google" ? "Google" : undefined;
  const intentParam = url.searchParams.get("intent")?.trim().toLowerCase();
  const intent: "signup" | "signin" = intentParam === "signup" ? "signup" : "signin";

  if (!clientId || !cognitoDomain) {
    console.error("Cognito OAuth start failed: Cognito domain or client id is not configured.");
    const targetPath = intent === "signup" ? "/auth/registrarse" : "/auth/iniciar-sesion";
    return NextResponse.redirect(new URL(`${targetPath}?error=cognito_config`, origin));
  }

  const state = randomBytes(24).toString("base64url");
  const statePayload: CognitoStartState = { state, provider, intent };
  const redirectUri = `${origin}/api/auth/cognito/callback`;

  cookies().set(COGNITO_STATE_COOKIE, JSON.stringify(statePayload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  const cognitoUrl = new URL("/oauth2/authorize", cognitoDomain);
  cognitoUrl.searchParams.set("client_id", clientId);
  cognitoUrl.searchParams.set("redirect_uri", redirectUri);
  cognitoUrl.searchParams.set("response_type", "code");
  cognitoUrl.searchParams.set("scope", COGNITO_SCOPES.join(" "));
  cognitoUrl.searchParams.set("state", state);
  // Force Google Account Chooser to select or switch accounts
  cognitoUrl.searchParams.set("prompt", "select_account");
  if (provider) {
    cognitoUrl.searchParams.set("identity_provider", provider);
  }

  return NextResponse.redirect(cognitoUrl);
}
