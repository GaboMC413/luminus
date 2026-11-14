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

  // Connection limits
  SEND_CONNECTION: { limit: 10, windowMs: 60 * 1000 },
  ACCEPT_CONNECTION: { limit: 20, windowMs: 60 * 1000 },
  DELETE_CONNECTION: { limit: 20, windowMs: 60 * 1000 },
  GET_CONNECTIONS: { limit: 30, windowMs: 60 * 1000 },
  BLOCK_CONNECTION: { limit: 10, windowMs: 60 * 1000 },
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
    store.set(key, timestamps);
    return { success: true, remaining: 0 };
  }

  timestamps.push(now);
  store.set(key, timestamps);

  // Periodic eviction of expired keys to prevent memory leak
  if (store.size > 2000 && Math.random() < 0.05) {
    store.forEach((ts: number[], k: string) => {
      const active = ts.filter((t: number) => now - t < 60 * 1000);
      if (active.length === 0) {
        store.delete(k);
      } else {
        store.set(k, active);
      }
    });
  }

  return { success: false, remaining: limit - timestamps.length };
}
