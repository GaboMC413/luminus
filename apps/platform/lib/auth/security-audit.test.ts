import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createReactivationToken,
  createSessionToken,
  readReactivationToken,
  readSessionToken,
  getCurrentSession,
} from "./session";
import { verifyRecoveryCodeHash, hashRecoveryCode } from "./recoveryTokens";
import { ensureS3AvatarUrl } from "../ensureS3AvatarUrl";
import { renderContactNotificationEmailHtml } from "../mails/contact";
import { renderRegistrationErrorAlertEmailHtml } from "../mails/registrationErrorAlert";
import { renderEventRegistrationEmailHtml } from "../mails/inscription";

vi.mock("@/lib/db", () => ({
  prisma: {
    eventInscription: {
      delete: vi.fn(),
    },
  },
}));

describe("Security Audit Hardening", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Session & Reactivation Token Domain Separation", () => {
    it("rejects reactivation tokens when passed to readSessionToken", () => {
      const reactivateToken = createReactivationToken({
        userId: "user-123",
        email: "deleted@example.com",
        role: "USER",
      });

      expect(readSessionToken(reactivateToken)).toBeNull();
      const parsed = readReactivationToken(reactivateToken);
      expect(parsed?.userId).toBe("user-123");
    });

    it("rejects normal session tokens when passed to readReactivationToken", () => {
      const sessionToken = createSessionToken({
        userId: "user-123",
        email: "active@example.com",
        role: "USER",
      });

      expect(readReactivationToken(sessionToken)).toBeNull();
      const parsed = readSessionToken(sessionToken);
      expect(parsed?.userId).toBe("user-123");
    });
  });

  describe("ensureS3AvatarUrl SSRF & URI Validation", () => {
    it("blocks SSRF attempts that embed facebook.com in query or path", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const result = await ensureS3AvatarUrl(
        "http://169.254.169.254/latest/meta-data/iam/security-credentials/?x=facebook.com",
        "user-1"
      );

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("rejects javascript: and non-allowed data:image subtypes", async () => {
      expect(await ensureS3AvatarUrl("javascript:alert(1)", "user-1")).toBeUndefined();
      expect(
        await ensureS3AvatarUrl(
          "data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9ImFsZXJ0KDEpIj48L3N2Zz4=",
          "user-1"
        )
      ).toBeUndefined();
    });

    it("preserves safe https:// URLs and relative asset paths", async () => {
      expect(await ensureS3AvatarUrl("https://lh3.googleusercontent.com/a/avatar", "user-1")).toBe(
        "https://lh3.googleusercontent.com/a/avatar"
      );
      expect(await ensureS3AvatarUrl("/images/default-avatar.png", "user-1")).toBe(
        "/images/default-avatar.png"
      );
    });
  });

  describe("Constant-Time Recovery Code Verification", () => {
    it("verifies matching recovery codes and rejects mismatches", () => {
      const hash = hashRecoveryCode("user@example.com", "123456");
      expect(verifyRecoveryCodeHash(hash, "user@example.com", "123456")).toBe(true);
      expect(verifyRecoveryCodeHash(hash, "user@example.com", "654321")).toBe(false);
      expect(verifyRecoveryCodeHash("short", "user@example.com", "123456")).toBe(false);
    });
  });

  describe("Email Template HTML Escaping", () => {
    it("escapes HTML tags in contact, registration error, and event inscription emails", () => {
      const contactHtml = renderContactNotificationEmailHtml({
        nombre: "<script>alert(1)</script>",
        apellido: "Test",
        email: "attacker@example.com",
        motivo: "<img src=x onerror=alert(1)>",
        mensaje: "Hello <b>world</b>",
      });
      expect(contactHtml).not.toContain("<script>alert(1)</script>");
      expect(contactHtml).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");

      const alertHtml = renderRegistrationErrorAlertEmailHtml({
        userEmail: "<svg onload=alert(1)>",
        step: "Signup",
        action: "POST",
        errorMessage: "<iframe src='javascript:alert(1)'></iframe>",
        timestamp: "2026-11-15T00:00:00Z",
      });
      expect(alertHtml).not.toContain("<svg onload=alert(1)>");
      expect(alertHtml).toContain("&lt;svg onload=alert(1)&gt;");

      const eventHtml = renderEventRegistrationEmailHtml({
        firstName: "<script>evil()</script>",
        eventTitle: "Taller <b>Especial</b>",
      });
      expect(eventHtml).not.toContain("<script>evil()</script>");
      expect(eventHtml).toContain("&lt;script&gt;evil()&lt;/script&gt;");
    });
  });
});
