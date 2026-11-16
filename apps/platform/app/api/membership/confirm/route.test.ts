import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";
import * as stripeModule from "@/lib/stripe";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
  createSessionToken: vi.fn(() => "updated-token"),
  setSessionCookie: vi.fn(),
}));

const retrieveSubMock = vi.fn();
const updateCustomerMock = vi.fn(() => Promise.resolve({}));

vi.mock("@/lib/stripe", () => ({
  get stripe() {
    return {
      subscriptions: {
        retrieve: retrieveSubMock,
      },
      customers: {
        update: updateCustomerMock,
      },
    };
  },
}));

describe("POST /api/membership/confirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentSession).mockResolvedValue({
      userId: "user-123",
      email: "member@luminus.lat",
      role: "USER",
      exp: 9999999999,
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-123",
      email: "member@luminus.lat",
      role: "USER",
      stripeCustomerId: "cus_real_123",
      profile: { firstName: "Gabriel", lastName: "Medina" },
    } as any);
  });

  const makeReq = (body: any) =>
    new Request("http://localhost/api/membership/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  it("rejects missing or mock subscriptionId when Stripe is configured", async () => {
    const res1 = await POST(makeReq({}));
    expect(res1.status).toBe(400);

    const res2 = await POST(makeReq({ subscriptionId: "sub_mock_abc" }));
    expect(res2.status).toBe(400);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects subscriptionId belonging to another Stripe customer", async () => {
    retrieveSubMock.mockResolvedValueOnce({
      id: "sub_other_999",
      customer: "cus_attacker_999",
      status: "active",
      metadata: { userId: "other-user", user_email: "other@luminus.lat" },
      items: { data: [{ price: { recurring: { interval: "month" } } }] },
    });

    const res = await POST(makeReq({ subscriptionId: "sub_other_999" }));
    expect(res.status).toBe(403);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("activates MECENAS for a verified active subscription and preserves primary login email when receipt email differs", async () => {
    retrieveSubMock.mockResolvedValueOnce({
      id: "sub_real_123",
      customer: "cus_real_123",
      status: "active",
      metadata: { userId: "user-123", user_email: "member@luminus.lat" },
      items: { data: [{ price: { recurring: { interval: "year" } } }] },
    });

    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      id: "user-123",
      email: "member@luminus.lat",
      tier: "MECENAS",
      memberSince: new Date(),
      profile: { isOnboarded: false, selectedPlan: "Annual" },
    } as any);

    const res = await POST(
      makeReq({
        subscriptionId: "sub_real_123",
        customerId: "cus_real_123",
        billingInterval: "annual",
        cardName: "Gabriel Medina",
        email: "billing-receipts@company.com",
      })
    );

    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-123" },
        data: expect.not.objectContaining({ email: "billing-receipts@company.com" }),
      })
    );
    expect(updateCustomerMock).toHaveBeenCalledWith("cus_real_123", {
      email: "billing-receipts@company.com",
    });
  });
});
