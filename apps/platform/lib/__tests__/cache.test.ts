import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getCachedData,
  setCachedData,
  fetchWithCache,
  invalidateClientCache,
  clearAllClientCache,
} from "../clientCache";
import {
  withServerCache,
  invalidateServerCacheTag,
  clearServerCache,
} from "../serverCache";

describe("clientCache", () => {
  beforeEach(() => {
    clearAllClientCache();
  });

  it("caches and deduplicates concurrent in-flight requests", async () => {
    let calls = 0;
    const fetcher = vi.fn(async () => {
      calls += 1;
      await new Promise((r) => setTimeout(r, 10));
      return { count: calls };
    });

    const [res1, res2] = await Promise.all([
      fetchWithCache("/api/test", fetcher),
      fetchWithCache("/api/test", fetcher),
    ]);

    expect(calls).toBe(1);
    expect(res1).toEqual({ count: 1 });
    expect(res2).toEqual({ count: 1 });
    expect(getCachedData("/api/test")).toEqual({ count: 1 });
  });

  it("invalidates exact keys and wildcard prefixes", () => {
    setCachedData("/api/comunidad?limit=12", [1]);
    setCachedData("/api/comunidad?limit=24", [1, 2]);
    setCachedData("/api/profile", { id: "u1" });

    invalidateClientCache("/api/comunidad*");

    expect(getCachedData("/api/comunidad?limit=12")).toBeUndefined();
    expect(getCachedData("/api/comunidad?limit=24")).toBeUndefined();
    expect(getCachedData("/api/profile")).toEqual({ id: "u1" });
  });

  it("ignores late in-flight responses after clearAllClientCache is called", async () => {
    let resolveFetch!: (val: { id: string }) => void;
    const pendingPromise = fetchWithCache(
      "/api/profile",
      () =>
        new Promise<{ id: string }>((resolve) => {
          resolveFetch = resolve;
        })
    );

    clearAllClientCache();
    resolveFetch({ id: "stale-user" });
    await pendingPromise;

    expect(getCachedData("/api/profile")).toBeUndefined();
  });
});

describe("serverCache", () => {
  beforeEach(() => {
    clearServerCache();
  });

  it("returns cached value within TTL and invalidates by tag", async () => {
    let dbHits = 0;
    const loader = async () => {
      dbHits += 1;
      return ["item-" + dbHits];
    };

    const first = await withServerCache("specialists-list", loader, {
      ttlMs: 60_000,
      tags: ["specialists"],
    });
    const second = await withServerCache("specialists-list", loader, {
      ttlMs: 60_000,
      tags: ["specialists"],
    });

    expect(dbHits).toBe(1);
    expect(first).toEqual(["item-1"]);
    expect(second).toEqual(["item-1"]);

    invalidateServerCacheTag("specialists");

    const third = await withServerCache("specialists-list", loader, {
      ttlMs: 60_000,
      tags: ["specialists"],
    });
    expect(dbHits).toBe(2);
    expect(third).toEqual(["item-2"]);
  });
});
