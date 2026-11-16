import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { prisma } from "@/lib/db";
import { adminCreateAndConfirmUser, adminDeleteCognitoUser } from "@/lib/auth/cognito-admin";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/cognito-admin", () => ({
  adminCreateAndConfirmUser: vi.fn(),
  adminConfirmUser: vi.fn(),
  adminDeleteCognitoUser: vi.fn(),
}));

vi.mock("@/lib/auth/cognito-password", () => ({
  signUpWithCognito: vi.fn(),
  getCognitoErrorMessage: vi.fn((_err, fallback) => fallback),
  getCognitoErrorStatus: vi.fn(() => 400),
}));

vi.mock("@/lib/auth/session", () => ({
  createSessionToken: vi.fn(() => "mock-session-token"),
  setSessionCookie: vi.fn(),
}));

describe("POST /api/auth/register-v2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const makeReq = (body: any) =>
    new Request("http://localhost/api/auth/register-v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  it("rejects removed legacy actions (finalize_registration, create_subscription_intent)", async () => {
    const res1 = await POST(makeReq({ action: "finalize_registration", email: "a@b.com", password: "Password123" }));
    expect(res1.status).toBe(400);

    const res2 = await POST(makeReq({ action: "create_subscription_intent", email: "a@b.com", name: "Test" }));
    expect(res2.status).toBe(400);
  });

  it("recovers from orphaned Cognito user when DB user does not exist and sets Annual selectedPlan", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const orphanErr = new Error("User already exists");
    (orphanErr as any).name = "UsernameExistsException";
    vi.mocked(adminCreateAndConfirmUser)
      .mockRejectedValueOnce(orphanErr)
      .mockResolvedValueOnce("cognito-sub-recovered");

    vi.mocked(prisma.user.create).mockResolvedValueOnce({
      id: "new-user-1",
      email: "annual@luminus.lat",
      role: "USER",
    } as any);

    const res = await POST(
      makeReq({
        action: "start_registration",
        email: "annual@luminus.lat",
        password: "Password123",
        plan: "membership",
        billing: "annual",
      })
    );

    expect(res.status).toBe(200);
    expect(adminDeleteCognitoUser).toHaveBeenCalledWith("annual@luminus.lat");
    expect(adminCreateAndConfirmUser).toHaveBeenCalledTimes(2);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tier: "FREE",
          trialExpiresAt: null,
          profile: {
            create: {
              selectedPlan: "Annual",
              isOnboarded: false,
            },
          },
        }),
      })
    );
  });
});
