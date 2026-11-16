import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, PUT, DELETE } from "./route";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/utils/rateLimit", () => ({
  isRateLimited: vi.fn().mockReturnValue({ success: false }),
  RATE_LIMITS: {
    GET_CONNECTIONS: { limit: 100, windowMs: 60000 },
    SEND_CONNECTION: { limit: 100, windowMs: 60000 },
    DELETE_CONNECTION: { limit: 100, windowMs: 60000 },
    BLOCK_CONNECTION: { limit: 100, windowMs: 60000 },
  },
}));

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
      deleteMany: vi.fn(),
    },
    userFollow: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
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

vi.mock("@/lib/onboarding", () => ({
  checkAndTriggerQuestCompletion: vi.fn().mockResolvedValue(null),
}));

describe("/api/connections Route (Mutual Contact Network)", () => {
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

    it("rejects PUT with 401 when unauthenticated", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null);
      const req = new Request("http://localhost/api/connections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: mockTargetId }),
      });
      const res = await PUT(req);
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

  describe("GET /api/connections", () => {
    it("deduplicates mutual accepted contacts and separates pending requests", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        userId: mockUserId,
        email: "test@luminus.com",
      } as any);

      const thirdUserId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";
      const mockConnections = [
        {
          id: "conn-1",
          requesterId: mockUserId,
          recipientId: mockTargetId,
          status: "accepted",
          createdAt: new Date(),
          updatedAt: new Date(),
          requester: { id: mockUserId, profile: { fullName: "User One" } },
          recipient: { id: mockTargetId, profile: { fullName: "User Two" } },
        },
        {
          id: "conn-2-duplicate-direction",
          requesterId: mockTargetId,
          recipientId: mockUserId,
          status: "accepted",
          createdAt: new Date(),
          updatedAt: new Date(),
          requester: { id: mockTargetId, profile: { fullName: "User Two" } },
          recipient: { id: mockUserId, profile: { fullName: "User One" } },
        },
        {
          id: "conn-pending-in",
          requesterId: thirdUserId,
          recipientId: mockUserId,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
          requester: { id: thirdUserId, profile: { fullName: "User Three" } },
          recipient: { id: mockUserId, profile: { fullName: "User One" } },
        },
      ];

      vi.mocked(prisma.userConnection.findMany).mockResolvedValue(mockConnections as any);

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.contacts).toHaveLength(1);
      expect(data.contacts[0].user.id).toBe(mockTargetId);
      expect(data.pendingIncoming).toHaveLength(1);
      expect(data.pendingIncoming[0].user.id).toBe(thirdUserId);
      expect(data.pendingOutgoing).toHaveLength(0);
    });
  });

  describe("POST /api/connections (Mutual Request)", () => {
    it("creates a pending connection request and notifies recipient with connection_request", async () => {
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

      vi.mocked(prisma.userConnection.findMany).mockResolvedValue([]);
      vi.mocked(prisma.userProfile.findUnique).mockResolvedValue({
        firstName: "Requester",
        lastName: "User",
        fullName: "Requester User",
        avatarUrl: "https://example.com/avatar.jpg",
      } as any);

      vi.mocked(prisma.userConnection.create).mockResolvedValue({
        id: "new-conn-id",
        requesterId: mockUserId,
        recipientId: mockTargetId,
        status: "pending",
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
      expect(data.connection.status).toBe("pending");
      expect(data.connection.direction).toBe("outgoing");

      expect(prisma.userConnection.create).toHaveBeenCalledWith({
        data: {
          requesterId: mockUserId,
          recipientId: mockTargetId,
          status: "pending",
        },
      });

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockTargetId,
          type: "connection_request",
        }),
      });
    });

    it("auto-accepts when target already sent a pending request to current user", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        userId: mockUserId,
        email: "requester@luminus.com",
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockTargetId,
        status: "active",
        email: "target@luminus.com",
        profile: { fullName: "Target User" },
      } as any);

      vi.mocked(prisma.userConnection.findMany).mockResolvedValue([
        {
          id: "reverse-pending",
          requesterId: mockTargetId,
          recipientId: mockUserId,
          status: "pending",
        },
      ] as any);

      vi.mocked(prisma.userProfile.findUnique).mockResolvedValue({
        fullName: "Requester User",
      } as any);

      vi.mocked(prisma.userConnection.update).mockResolvedValue({
        id: "reverse-pending",
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
      expect(data.connection.status).toBe("accepted");
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockTargetId,
          type: "connection_accepted",
        }),
      });
    });
  });

  describe("PUT /api/connections (Accept Request)", () => {
    it("accepts an incoming pending request and notifies requester", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        userId: mockUserId,
        email: "acceptor@luminus.com",
      } as any);

      vi.mocked(prisma.userConnection.findFirst).mockResolvedValue({
        id: "pending-id",
        requesterId: mockTargetId,
        recipientId: mockUserId,
        status: "pending",
      } as any);

      vi.mocked(prisma.userProfile.findUnique).mockResolvedValue({
        fullName: "Acceptor User",
      } as any);

      vi.mocked(prisma.userConnection.update).mockResolvedValue({
        id: "pending-id",
        status: "accepted",
      } as any);

      const req = new Request("http://localhost/api/connections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: mockTargetId }),
      });

      const res = await PUT(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.connection.status).toBe("accepted");
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockTargetId,
          type: "connection_accepted",
        }),
      });
    });
  });

  describe("DELETE /api/connections", () => {
    it("removes connection across either direction and cleans up notifications", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        userId: mockUserId,
        email: "test@luminus.com",
      } as any);

      vi.mocked(prisma.userConnection.findMany).mockResolvedValue([
        { id: "conn-123" },
      ] as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        email: "target@luminus.com",
        profile: { fullName: "Target User" },
      } as any);
      vi.mocked(prisma.userConnection.deleteMany).mockResolvedValue({ count: 1 } as any);

      const req = new Request(`http://localhost/api/connections?recipientId=${mockTargetId}`, {
        method: "DELETE",
      });

      const res = await DELETE(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.userConnection.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ["conn-123"] } },
      });
    });
  });
});
