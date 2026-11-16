type CacheEntry<T = any> = {
  data: T;
  timestamp: number;
};

type CacheSubscriber<T = any> = (data: T) => void;

const memoryCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<any>>();
const subscribers = new Map<string, Set<CacheSubscriber>>();

export const DEFAULT_CLIENT_TTL_MS = 60_000; // 60 seconds fresh window

export function getCachedData<T>(key: string): T | undefined {
  const entry = memoryCache.get(key);
  return entry ? (entry.data as T) : undefined;
}

export function isCacheFresh(key: string, ttlMs: number = DEFAULT_CLIENT_TTL_MS): boolean {
  const entry = memoryCache.get(key);
  if (!entry) return false;
  return Date.now() - entry.timestamp < ttlMs;
}

export function setCachedData<T>(key: string, data: T): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
  const keySubscribers = subscribers.get(key);
  if (keySubscribers) {
    keySubscribers.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error(`[clientCache] Subscriber error for key "${key}":`, err);
      }
    });
  }
}

export function subscribeClientCache<T>(key: string, callback: CacheSubscriber<T>): () => void {
  let set = subscribers.get(key);
  if (!set) {
    set = new Set();
    subscribers.set(key, set);
  }
  set.add(callback);
  return () => {
    const currentSet = subscribers.get(key);
    if (currentSet) {
      currentSet.delete(callback);
      if (currentSet.size === 0) {
        subscribers.delete(key);
      }
    }
  };
}

export interface FetchWithCacheOptions {
  ttlMs?: number;
  force?: boolean;
  revalidateInBackground?: boolean;
}

export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: FetchWithCacheOptions = {}
): Promise<T> {
  const {
    ttlMs = DEFAULT_CLIENT_TTL_MS,
    force = false,
    revalidateInBackground = true,
  } = options;

  const existing = memoryCache.get(key);
  const now = Date.now();

  if (!force && existing) {
    const isFresh = now - existing.timestamp < ttlMs;
    if (isFresh) {
      return existing.data as T;
    }

    if (revalidateInBackground) {
      if (!inFlightRequests.has(key)) {
        const bgPromise = fetcher()
          .then((freshData) => {
            setCachedData(key, freshData);
            return freshData;
          })
          .catch((err) => {
            console.warn(`[clientCache] Background revalidation failed for "${key}":`, err);
            return existing.data as T;
          })
          .finally(() => {
            inFlightRequests.delete(key);
          });
        inFlightRequests.set(key, bgPromise);
      }
      return existing.data as T;
    }
  }

  if (!force && inFlightRequests.has(key)) {
    return inFlightRequests.get(key) as Promise<T>;
  }

  const requestPromise = fetcher()
    .then((data) => {
      setCachedData(key, data);
      return data;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, requestPromise);
  return requestPromise;
}

export function invalidateClientCache(keyOrPrefixes?: string | string[]): void {
  if (!keyOrPrefixes) {
    memoryCache.clear();
    inFlightRequests.clear();
    return;
  }

  const targets = Array.isArray(keyOrPrefixes) ? keyOrPrefixes : [keyOrPrefixes];

  for (const target of targets) {
    const isPrefix = target.endsWith("*");
    const cleanPrefix = isPrefix ? target.slice(0, -1) : target;

    for (const key of Array.from(memoryCache.keys())) {
      if (isPrefix ? key.startsWith(cleanPrefix) : key === target || key.startsWith(`${target}:`) || key.startsWith(`${target}?`)) {
        memoryCache.delete(key);
      }
    }

    for (const key of Array.from(inFlightRequests.keys())) {
      if (isPrefix ? key.startsWith(cleanPrefix) : key === target || key.startsWith(`${target}:`) || key.startsWith(`${target}?`)) {
        inFlightRequests.delete(key);
      }
    }
  }
}

export function clearAllClientCache(): void {
  memoryCache.clear();
  inFlightRequests.clear();
}
