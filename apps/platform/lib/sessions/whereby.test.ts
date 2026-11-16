import { afterEach, describe, expect, it, vi } from "vitest";
import {
  computeSessionEndDateIso,
  createWherebyRoom,
  isWherebyConfigured,
} from "./whereby";

describe("whereby helpers", () => {
  const originalKey = process.env.WHEREBY_API_KEY;
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.WHEREBY_API_KEY;
    } else {
      process.env.WHEREBY_API_KEY = originalKey;
    }
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("computes endDate 15 minutes after start in UTC for America/Montevideo", () => {
    // 10:00 in America/Montevideo (UTC-3) = 13:00Z -> +15m = 13:15Z
    const nowMs = Date.parse("2026-11-14T12:00:00.000Z");
    const iso = computeSessionEndDateIso(
      "2026-11-20",
      "10:00",
      "America/Montevideo",
      15,
      nowMs
    );
    expect(iso).toBe("2026-11-20T13:15:00.000Z");
  });

  it("returns null when WHEREBY_API_KEY is not configured", async () => {
    delete process.env.WHEREBY_API_KEY;
    expect(isWherebyConfigured()).toBe(false);

    const result = await createWherebyRoom({
      scheduledDate: "2026-11-20",
      startTime: "10:00",
    });
    expect(result).toBeNull();
  });

  it("creates a Whereby room and returns roomUrl + hostRoomUrl", async () => {
    process.env.WHEREBY_API_KEY = "test-key";
    expect(isWherebyConfigured()).toBe(true);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        meetingId: "998877",
        roomUrl: "https://luminus.whereby.com/room-abc",
        hostRoomUrl: "https://luminus.whereby.com/room-abc?roomKey=host123",
      }),
    });
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    const result = await createWherebyRoom({
      scheduledDate: "2026-11-20",
      startTime: "10:00",
      timezone: "America/Montevideo",
    });

    expect(result).toEqual({
      meetingId: "998877",
      roomUrl: "https://luminus.whereby.com/room-abc",
      hostRoomUrl: "https://luminus.whereby.com/room-abc?roomKey=host123",
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.whereby.dev/v1/meetings");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toMatchObject({
      isLocked: false,
      fields: ["hostRoomUrl"],
    });
  });

  it("returns null if Whereby API responds with an error", async () => {
    process.env.WHEREBY_API_KEY = "test-key";
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => "rate limited",
    }) as unknown as typeof fetch;

    const result = await createWherebyRoom({
      scheduledDate: "2026-11-20",
      startTime: "10:00",
    });
    expect(result).toBeNull();
  });
});
