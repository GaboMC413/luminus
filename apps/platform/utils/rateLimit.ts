declare global {
  var rateLimitStore: Map<string, number[]> | undefined;
}

const store = globalThis.rateLimitStore ?? new Map<string, number[]>();
if (process.env.NODE_ENV !== "production") {
  globalThis.rateLimitStore = store;
}

export const RATE_LIMITS = {
  SEND_MESSAGE: { limit: 20, windowMs: 60 * 1000 },
  CREATE_CONVERSATION: { limit: 10, windowMs: 60 * 1000 },
  GET_MESSAGES: { limit: 30, windowMs: 60 * 1000 },
  GET_CONVERSATIONS: { limit: 30, windowMs: 60 * 1000 },
  DELETE_CONVERSATION: { limit: 5, windowMs: 60 * 1000 },
};

export function isRateLimited(
  userId: string,
  action: string,
  limit: number,
  windowMs: number = 60 * 1000
): { success: boolean; remaining: number } {
  const now = Date.now();
  const key = `${userId}:${action}`;

  let timestamps = store.get(key) ?? [];

  // Filter out timestamps older than the window
  timestamps = timestamps.filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    return { success: true, remaining: 0 };
  }

  timestamps.push(now);
  store.set(key, timestamps);

  return { success: false, remaining: limit - timestamps.length };
}
