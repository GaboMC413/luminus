import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GOOGLE_STATE_COOKIE = "luminus_google_oauth_state";
const GOOGLE_SCOPES = ["openid", "email", "profile"];

function getPublicOrigin(requestUrl: URL) {
  return (process.env.AUTH_BASE_URL || requestUrl.origin).replace(/\/$/, "");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const origin = getPublicOrigin(url);

  if (!clientId || !clientSecret) {
    console.error("Google OAuth start failed: Google credentials are not fully configured.");
    return NextResponse.redirect(new URL("/auth/iniciar-sesion?error=google_config", origin));
  }

  const state = randomBytes(24).toString("base64url");
  const redirectUri = `${origin}/api/auth/google/callback`;

  cookies().set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", clientId);
  googleUrl.searchParams.set("redirect_uri", redirectUri);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", GOOGLE_SCOPES.join(" "));
  googleUrl.searchParams.set("state", state);
  googleUrl.searchParams.set("access_type", "offline");
  googleUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(googleUrl);
}
