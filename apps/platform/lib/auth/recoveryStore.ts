// Simple in-memory store for password recovery codes with 15 minutes expiration time
export interface RecoveryCode {
  code: string;
  expiresAt: number;
}

const store = new Map<string, RecoveryCode>();

export function setRecoveryCode(email: string, code: string) {
  store.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
  });
}

export function verifyRecoveryCode(email: string, code: string): boolean {
  const record = store.get(email.toLowerCase());
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    store.delete(email.toLowerCase());
    return false;
  }
  return record.code === code;
}

export function deleteRecoveryCode(email: string) {
  store.delete(email.toLowerCase());
}
