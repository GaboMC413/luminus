import crypto from "crypto";

function getUnsubscribeSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET || process.env.AUTH_SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("UNSUBSCRIBE_SECRET is required in production.");
    }
    return "dev-local-unsubscribe-secret-fallback-at-least-32-chars";
  }
  return secret;
}

/**
 * Normalizes email address for consistent hashing and comparisons.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Generates an HMAC-SHA256 token for an email address.
 */
export function generateUnsubscribeToken(email: string): string {
  const cleanEmail = normalizeEmail(email);
  return crypto
    .createHmac("sha256", getUnsubscribeSecret())
    .update(cleanEmail)
    .digest("hex")
    .substring(0, 32); // 32 chars hex token
}

/**
 * Verifies if the provided token matches the HMAC token for the given email.
 */
export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!email || !token) return false;
  const expectedToken = generateUnsubscribeToken(email);
  try {
    const tokenBuf = Buffer.from(token.trim());
    const expectedBuf = Buffer.from(expectedToken);
    if (tokenBuf.length !== expectedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(tokenBuf, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * Gets the base URL for public website links.
 */
export function getBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.SITE_URL ||
    "https://luminuslatam.com";
  return url.replace(/\/+$/, "");
}

/**
 * Generates full web link and API URL for unsubscribing.
 */
export function generateUnsubscribeUrls(email: string) {
  const cleanEmail = normalizeEmail(email);
  const token = generateUnsubscribeToken(cleanEmail);
  const baseUrl = getBaseUrl();

  const query = `email=${encodeURIComponent(cleanEmail)}&token=${encodeURIComponent(token)}`;

  return {
    unsubscribeUrl: `${baseUrl}/desuscribir?${query}`,
    apiUrl: `${baseUrl}/api/unsubscribe?${query}`,
  };
}

/**
 * Generates RFC 8058 compliant email headers for AWS SES commands.
 * Email clients (Gmail, Outlook, Apple Mail) render native "Unsubscribe" buttons.
 */
export function generateUnsubscribeHeaders(email: string): Record<string, string> {
  const { apiUrl } = generateUnsubscribeUrls(email);
  return {
    "List-Unsubscribe": `<${apiUrl}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
