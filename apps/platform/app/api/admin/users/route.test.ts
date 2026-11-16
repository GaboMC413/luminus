import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "./route";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";
import { getUserBillingSnapshot } from "@/lib/admin/billing";
import { syncCognitoUserStatus } from "@/lib/auth/cognito-admin";
import { deleteUserS3Data } from "@/lib/storage/userStorageCleanup";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
  invalidateUserSessionCache: vi.fn(),
}));

vi.mock("@/lib/serverCache", () => ({
  invalidateServerCacheTag: vi.fn(),
}));

vi.mock("@/lib/admin/billing", () => ({
  getUserBillingSnapshot: vi.fn(),
}));

vi.mock("@/lib/auth/cognito-admin", () => ({
  syncCognitoUserStatus: vi.fn(),
}));

vi.mock("@/lib/storage/userStorageCleanup", () => ({
  deleteUserS3Data: vi.fn(),
}));

describe("DELETE /api/admin/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentSession).mockResolvedValue({
      userId: "admin-1",
      email: "admin@luminus.lat",
      role: "ADMIN",
      exp: 9999999999,
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "user@luminus.lat",
      identities: [],
    } as any);
  });

  it("blocks deletion with 409 when user has an active subscription", async () => {
    vi.mocked(getUserBillingSnapshot).mockResolvedValue({
      userId: "user-1",
      hasActiveSubscription: true,
    } as any);

    const res = await DELETE(new Request("http://localhost/api/admin/users?id=user-1", { method: "DELETE" }));

    expect(res.status).toBe(409);
    expect(syncCognitoUserStatus).not.toHaveBeenCalled();
    expect(deleteUserS3Data).not.toHaveBeenCalled();
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it("deletes user when user has no active subscription", async () => {
    vi.mocked(getUserBillingSnapshot).mockResolvedValue({
      userId: "user-1",
      hasActiveSubscription: false,
    } as any);

    const res = await DELETE(new Request("http://localhost/api/admin/users?id=user-1", { method: "DELETE" }));

    expect(res.status).toBe(200);
    expect(syncCognitoUserStatus).toHaveBeenCalledWith(expect.objectContaining({ id: "user-1" }), "deleted");
    expect(deleteUserS3Data).toHaveBeenCalledWith("user-1");
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });
});
