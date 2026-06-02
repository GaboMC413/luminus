import { createHash, randomInt } from "crypto";

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

export function getRecoveryCodeExpiry() {
  return new Date(Date.now() + PASSWORD_RESET_CODE_TTL_MINUTES * 60 * 1000);
}

export function isRecoveryDebugEnabled() {
  return process.env.NODE_ENV === "development";
}
