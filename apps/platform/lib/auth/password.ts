import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, KEY_LENGTH).toString("hex");

  return `scrypt:${salt}:${key}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, key] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !key) {
    return false;
  }

  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);

  return keyBuffer.length === derivedKey.length && timingSafeEqual(keyBuffer, derivedKey);
}
