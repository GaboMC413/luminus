import { createHash, randomInt, timingSafeEqual } from "crypto";

export const PASSWORD_RESET_CODE_TTL_MINUTES = 15;
export const PASSWORD_RESET_MAX_ATTEMPTS = 5;

export function generateRecoveryCode() {
  return randomInt(100000, 1000000).toString();
}

export function hashRecoveryCode(email: string, code: string) {
  return createHash("sha256")
    .update(`${email.trim().toLowerCase()}:${code.trim()}:${process.env.AUTH_SESSION_SECRET ?? ""}`)
    .digest("hex");
}

export function verifyRecoveryCodeHash(storedHash: string, email: string, code: string): boolean {
  if (!storedHash || !email || !code) return false;
  const computedHash = hashRecoveryCode(email, code);
  const a = Buffer.from(storedHash, "utf8");
  const b = Buffer.from(computedHash, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function getRecoveryCodeExpiry() {
  return new Date(Date.now() + PASSWORD_RESET_CODE_TTL_MINUTES * 60 * 1000);
}

export function isRecoveryDebugEnabled() {
  return process.env.NODE_ENV === "development";
}
