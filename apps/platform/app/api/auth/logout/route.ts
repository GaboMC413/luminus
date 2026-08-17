import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

function getCognitoDomain() {
  const domain = process.env.COGNITO_DOMAIN?.trim().replace(/\/$/, "");
  if (!domain) return null;
  return domain.startsWith("http://") || domain.startsWith("https://") ? domain : `https://${domain}`;
}

export async function POST(request: Request) {
  clearSessionCookie();

  const url = new URL(request.url);
  const origin = (process.env.AUTH_BASE_URL?.trim() || url.origin).replace(/\/$/, "");
  const clientId = process.env.COGNITO_CLIENT_ID;
  const cognitoDomain = getCognitoDomain();

  let cognitoLogoutUrl: string | null = null;
  if (clientId && cognitoDomain) {
    const logoutRedirectUri = `${origin}/auth/iniciar-sesion`;
    cognitoLogoutUrl = `${cognitoDomain}/logout?client_id=${encodeURIComponent(clientId)}&logout_uri=${encodeURIComponent(logoutRedirectUri)}`;
  }

  return NextResponse.json({ ok: true, cognitoLogoutUrl });
}
