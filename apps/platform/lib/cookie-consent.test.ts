import { describe, it, expect } from "vitest";
import {
  COOKIE_CONSENT_NAME,
  COOKIE_CONSENT_VERSION,
  getCookieConsent,
  hasConsented,
  parseCookieConsent,
} from "./cookie-consent";

describe("cookie-consent", () => {
  it("returns null when no consent cookie is present", () => {
    expect(getCookieConsent("")).toBeNull();
    expect(getCookieConsent("other_cookie=abc")).toBeNull();
  });

  it("denies analytics and marketing by default when no cookie exists", () => {
    expect(hasConsented("necessary", "")).toBe(true);
    expect(hasConsented("analytics", "")).toBe(false);
    expect(hasConsented("marketing", "")).toBe(false);
  });

  it("parses valid consent cookie and respects category flags", () => {
    const payload = encodeURIComponent(
      JSON.stringify({
        version: COOKIE_CONSENT_VERSION,
        necessary: true,
        analytics: true,
        marketing: false,
        updatedAt: "2026-11-16T12:00:00.000Z",
      })
    );
    const cookieHeader = `foo=bar; ${COOKIE_CONSENT_NAME}=${payload}; baz=qux`;

    const parsed = getCookieConsent(cookieHeader);
    expect(parsed).not.toBeNull();
    expect(parsed?.analytics).toBe(true);
    expect(parsed?.marketing).toBe(false);

    expect(hasConsented("necessary", cookieHeader)).toBe(true);
    expect(hasConsented("analytics", cookieHeader)).toBe(true);
    expect(hasConsented("marketing", cookieHeader)).toBe(false);
  });

  it("rejects malformed or outdated version cookies", () => {
    expect(parseCookieConsent("not-json")).toBeNull();
    const oldVersion = encodeURIComponent(
      JSON.stringify({
        version: 999,
        necessary: true,
        analytics: true,
        marketing: true,
      })
    );
    expect(parseCookieConsent(oldVersion)).toBeNull();
  });
});
