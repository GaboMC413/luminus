import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, DELETE } from "./route";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";

// 1. Mock Session
vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

// 2. Mock Rate Limit (bypass rate limiting in tests)
vi.mock("@/utils/rateLimit", () => ({
  isRateLimited: vi.fn().mockReturnValue({ success: false }),
  RATE_LIMITS: {
    GET_CONNECTIONS: { limit: 100, windowMs: 60000 },
    SEND_CONNECTION: { limit: 100, windowMs: 60000 },
    DELETE_CONNECTION: { limit: 100, windowMs: 60000 },
    BLOCK_CONNECTION: { limit: 100, windowMs: 60000 },
  },
}));

// 3. Mock Database
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    userProfile: {
      findUnique: vi.fn(),
    },
    userConnection: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    activityLog: {
      create: vi.fn().mockResolvedValue({ id: "log-1" }),
    },
    notification: {
      create: vi.fn().mockResolvedValue({ id: "notif-1" }),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  },
}));

// 4. Mock Onboarding
vi.mock("@/lib/onboarding", () => ({
  checkAndTriggerQuestCompletion: vi.fn().mockResolvedValue(null),
}));

describe("/api/connections Route", () => {
  const mockUserId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const mockTargetId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication", () => {
    it("rejects GET with 401 when unauthenticated", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null);
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it("rejects POST with 401 when unauthenticated", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null);
      const req = new Request("http://localhost/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: mockTargetId }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it("rejects DELETE with 401 when unauthenticated", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null);
      const req = new Request(`http://localhost/api/connections?recipientId=${mockTargetId}`, {
        method: "DELETE",
      });
      const res = await DELETE(req);
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/connections & Auto-Healing", () => {
    it("auto-heals legacy pending connections to accepted in runtime", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        userId: mockUserId,
        email: "test@luminus.com",
      } as any);

      // Return one accepted connection and one pending connection
      const mockConnections = [
        {
          id: "conn-accepted",
          requesterId: mockUserId,
          recipientId: mockTargetId,
          status: "accepted",
          createdAt: new Date(),
          updatedAt: new Date(),
          requester: { id: mockUserId, profile: { fullName: "User One" } },
          recipient: { id: mockTargetId, profile: { fullName: "User Two" } },
        },
        {
          id: "conn-legacy-pending",
          requesterId: mockTargetId,
          recipientId: mockUserId,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
          requester: { id: mockTargetId, profile: { fullName: "User Two" } },
          recipient: { id: mockUserId, profile: { fullName: "User One" } },
        },
      ];

      vi.mocked(prisma.userConnection.findMany).mockResolvedValue(mockConnections as any);
      vi.mocked(prisma.userConnection.updateMany).mockResolvedValue({ count: 1 } as any);

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);

      // Verify that updateMany was triggered for the pending connection
      expect(prisma.userConnection.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ["conn-legacy-pending"] } },
        data: { status: "accepted" },
      });

      // Verify serialized output has healed status
      const healedConn = data.connections.find((c: any) => c.id === "conn-legacy-pending");
      expect(healedConn.status).toBe("accepted");
      expect(healedConn.direction).toBe("incoming");

      // Verify followers and following categories
      expect(data.following).toHaveLength(1);
      expect(data.followers).toHaveLength(1);
    });
  });

  describe("POST /api/connections (Unilateral Follow)", () => {
    it("creates an accepted directed connection and notifies recipient with network_add", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        userId: mockUserId,
        email: "requester@luminus.com",
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockTargetId,
        status: "active",
        email: "target@luminus.com",
        profile: { firstName: "Target", lastName: "User", fullName: "Target User" },
      } as any);

      vi.mocked(prisma.userConnection.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.userProfile.findUnique).mockResolvedValue({
        firstName: "Sender",
        lastName: "User",
        fullName: "Sender User",
        avatarUrl: "https://example.com/avatar.jpg",
      } as any);

      vi.mocked(prisma.userConnection.create).mockResolvedValue({
        id: "new-conn-id",
        requesterId: mockUserId,
        recipientId: mockTargetId,
        status: "accepted",
      } as any);

      const req = new Request("http://localhost/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: mockTargetId }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.connection.status).toBe("accepted");
      expect(data.connection.direction).toBe("outgoing");

      // Check creation in DB
      expect(prisma.userConnection.create).toHaveBeenCalledWith({
        data: {
          requesterId: mockUserId,
          recipientId: mockTargetId,
          status: "accepted",
        },
      });

      // Check auto-healing of reverse connection if pending
      expect(prisma.userConnection.updateMany).toHaveBeenCalledWith({
        where: {
          requesterId: mockTargetId,
          recipientId: mockUserId,
          status: "pending",
        },
        data: { status: "accepted" },
      });

      // Check notification sent as network_add
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: mockTargetId,
          type: "network_add",
          title: "Nueva conexión",
          actorName: "Sender User",
          actorAvatarUrl: "https://example.com/avatar.jpg",
          body: "te sumó a su red.",
          actionUrl: `/inicio/public-profile?id=${mockUserId}`,
        },
      });
    });
  });

  describe("DELETE /api/connections", () => {
    it("deletes the directed connection from current user to target", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        userId: mockUserId,
        email: "requester@luminus.com",
      } as any);

      vi.mocked(prisma.userConnection.findFirst).mockResolvedValue({
        id: "conn-to-delete",
        requesterId: mockUserId,
        recipientId: mockTargetId,
        status: "accepted",
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockTargetId,
        email: "target@luminus.com",
        profile: { fullName: "Target User" },
      } as any);

      vi.mocked(prisma.userConnection.delete).mockResolvedValue({} as any);

      const req = new Request(`http://localhost/api/connections?recipientId=${mockTargetId}`, {
        method: "DELETE",
      });

      const res = await DELETE(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.userConnection.delete).toHaveBeenCalledWith({
        where: { id: "conn-to-delete" },
      });
    });
  });
});
