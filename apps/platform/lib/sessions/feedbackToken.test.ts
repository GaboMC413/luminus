import { describe, it, expect } from "vitest";
import {
  createFeedbackToken,
  verifyFeedbackToken,
  isFeedbackFallbackDue,
} from "./feedbackToken";

describe("feedbackToken", () => {
  it("signs and verifies a valid feedback token", () => {
    const token = createFeedbackToken({
      sessionId: "11111111-1111-4111-8111-111111111111",
      userId: "22222222-2222-4222-8222-222222222222",
      role: "requester",
    });

    const verified = verifyFeedbackToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.sessionId).toBe("11111111-1111-4111-8111-111111111111");
    expect(verified?.userId).toBe("22222222-2222-4222-8222-222222222222");
    expect(verified?.role).toBe("requester");
  });

  it("rejects tampered or expired tokens", () => {
    const token = createFeedbackToken({
      sessionId: "11111111-1111-4111-8111-111111111111",
      userId: "22222222-2222-4222-8222-222222222222",
      role: "specialist",
    });
    expect(verifyFeedbackToken(`${token}x`)).toBeNull();

    const expired = createFeedbackToken(
      {
        sessionId: "11111111-1111-4111-8111-111111111111",
        userId: "22222222-2222-4222-8222-222222222222",
        role: "specialist",
      },
      -10
    );
    expect(verifyFeedbackToken(expired)).toBeNull();
  });

  it("triggers fallback only after endTime + 15 minutes and within 48 hours", () => {
    const base = {
      scheduledDate: "2026-11-15",
      endTime: "15:15",
      timezone: "UTC",
    };

    const endMs = Date.UTC(2026, 10, 15, 15, 15, 0, 0);

    // 10 minutes after end -> not due yet
    expect(isFeedbackFallbackDue(base, endMs + 10 * 60_000)).toBe(false);
    // 15 minutes after end -> due
    expect(isFeedbackFallbackDue(base, endMs + 15 * 60_000)).toBe(true);
    // 49 hours after end -> expired window
    expect(isFeedbackFallbackDue(base, endMs + 49 * 60 * 60_000)).toBe(false);
  });
});
