type ServerCacheEntry<T = any> = {
  value: T;
  expiresAt: number;
  tags: string[];
};

const globalForServerCache = globalThis as unknown as {
  __luminusServerCache?: Map<string, ServerCacheEntry>;
  __luminusServerInFlight?: Map<string, Promise<any>>;
};

const serverCacheMap =
  globalForServerCache.__luminusServerCache ?? new Map<string, ServerCacheEntry>();
const serverInFlightMap =
  globalForServerCache.__luminusServerInFlight ?? new Map<string, Promise<any>>();

if (process.env.NODE_ENV !== "production") {
  globalForServerCache.__luminusServerCache = serverCacheMap;
  globalForServerCache.__luminusServerInFlight = serverInFlightMap;
}

const MAX_SERVER_CACHE_ENTRIES = 500;

export interface ServerCacheOptions {
  ttlMs?: number;
  tags?: string[];
}

export async function withServerCache<T>(
  key: string,
  loader: () => Promise<T>,
  options: ServerCacheOptions = {}
): Promise<T> {
  const { ttlMs = 60_000, tags = [] } = options;
  const now = Date.now();
  const cached = serverCacheMap.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value as T;
  }

  const existingInFlight = serverInFlightMap.get(key);
  if (existingInFlight) {
    return existingInFlight as Promise<T>;
  }

  const promise = loader()
    .then((result) => {
      if (serverCacheMap.size >= MAX_SERVER_CACHE_ENTRIES && !serverCacheMap.has(key)) {
        const oldestKey = serverCacheMap.keys().next().value;
        if (oldestKey !== undefined) {
          serverCacheMap.delete(oldestKey);
        }
      }
      serverCacheMap.set(key, {
        value: result,
        expiresAt: Date.now() + ttlMs,
        tags,
      });
      return result;
    })
    .finally(() => {
      serverInFlightMap.delete(key);
    });

  serverInFlightMap.set(key, promise);
  return promise;
}

export function invalidateServerCacheTag(tagOrTags: string | string[]): void {
  const tagsToInvalidate = new Set(Array.isArray(tagOrTags) ? tagOrTags : [tagOrTags]);
  for (const [key, entry] of Array.from(serverCacheMap.entries())) {
    if (entry.tags.some((t) => tagsToInvalidate.has(t))) {
      serverCacheMap.delete(key);
    }
  }
}

export function invalidateServerCacheKey(keyOrPrefix: string): void {
  const isPrefix = keyOrPrefix.endsWith("*");
  const prefix = isPrefix ? keyOrPrefix.slice(0, -1) : keyOrPrefix;

  for (const key of Array.from(serverCacheMap.keys())) {
    if (isPrefix ? key.startsWith(prefix) : key === keyOrPrefix) {
      serverCacheMap.delete(key);
    }
  }
}

export function clearServerCache(): void {
  serverCacheMap.clear();
  serverInFlightMap.clear();
}
