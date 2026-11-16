import { createHmac, timingSafeEqual } from "crypto";
import { zonedWallClockToUtcMs } from "./whereby";

export type FeedbackTokenRole = "requester" | "specialist";

export type FeedbackTokenPayload = {
  sessionId: string;
  userId: string;
  role: FeedbackTokenRole;
  exp: number;
};

const FEEDBACK_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days
const FALLBACK_DELAY_MS = 15 * 60_000; // 15 minutes after session end
const FALLBACK_MAX_AGE_MS = 48 * 60 * 60_000; // Do not email sessions older than 48h

function getSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV !== "production") {
      return "local-development-fallback-session-secret-32-chars-long";
    }
    throw new Error("AUTH_SESSION_SECRET must be at least 32 characters long.");
  }
  return secret;
}

function sign(encodedBody: string): string {
  return createHmac("sha256", getSecret())
    .update(`intro-feedback:${encodedBody}`)
    .digest("base64url");
}

/** Creates an HMAC-signed token granting feedback access for one session participant. */
export function createFeedbackToken(
  payload: Omit<FeedbackTokenPayload, "exp">,
  ttlSeconds = FEEDBACK_TOKEN_TTL_SECONDS
): string {
  const body: FeedbackTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encodedBody = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${encodedBody}.${sign(encodedBody)}`;
}

/** Verifies an HMAC-signed feedback token and returns its payload or null. */
export function verifyFeedbackToken(token: string): FeedbackTokenPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedBody, providedSig] = parts;
  if (!encodedBody || !providedSig) return null;

  const expectedSig = sign(encodedBody);
  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedBody, "base64url").toString("utf8")
    ) as FeedbackTokenPayload;
    if (
      !parsed?.sessionId ||
      !parsed?.userId ||
      (parsed.role !== "requester" && parsed.role !== "specialist") ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Returns whether a session has passed `endTime + 15 minutes` (and is within 48h)
 * so the post-session fallback feedback email can be triggered.
 */
export function isFeedbackFallbackDue(
  params: {
    scheduledDate: string;
    endTime: string;
    timezone?: string | null;
  },
  nowMs = Date.now()
): boolean {
  const endMs = zonedWallClockToUtcMs(
    params.scheduledDate,
    params.endTime,
    params.timezone || "America/Montevideo"
  );
  if (!Number.isFinite(endMs)) return false;
  const elapsedAfterEnd = nowMs - endMs;
  return elapsedAfterEnd >= FALLBACK_DELAY_MS && elapsedAfterEnd <= FALLBACK_MAX_AGE_MS;
}
