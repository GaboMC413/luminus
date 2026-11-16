import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, DELETE } from "./route";
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
      findFirst: vi.fn(),
    },
    userFollow: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    notification: {
      create: vi.fn().mockResolvedValue({ id: "notif-1" }),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  },
}));

describe("/api/follows Route (Unilateral Specialist Follow)", () => {
  const mockUserId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const mockSpecialistId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects POST when target is not a specialist", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      userId: mockUserId,
      email: "user@luminus.com",
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: mockSpecialistId,
      status: "active",
      specialistProfile: null,
    } as any);
    vi.mocked(prisma.userConnection.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.userFollow.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.userProfile.findUnique).mockResolvedValue({ fullName: "User" } as any);

    const req = new Request("http://localhost/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followingId: mockSpecialistId }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("creates UserFollow and notifies specialist with specialist_follow", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      userId: mockUserId,
      email: "user@luminus.com",
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: mockSpecialistId,
      status: "active",
      specialistProfile: { id: "spec-1" },
    } as any);
    vi.mocked(prisma.userConnection.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.userFollow.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.userProfile.findUnique).mockResolvedValue({
      fullName: "Follower User",
      avatarUrl: "https://example.com/a.jpg",
    } as any);
    vi.mocked(prisma.userFollow.create).mockResolvedValue({
      id: "follow-1",
      followerId: mockUserId,
      followingId: mockSpecialistId,
    } as any);

    const req = new Request("http://localhost/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followingId: mockSpecialistId }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.userFollow.create).toHaveBeenCalledWith({
      data: {
        followerId: mockUserId,
        followingId: mockSpecialistId,
      },
    });
    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: mockSpecialistId,
        type: "specialist_follow",
      }),
    });
  });

  it("returns following and followers on GET", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      userId: mockUserId,
      email: "user@luminus.com",
    } as any);

    vi.mocked(prisma.userFollow.findMany)
      .mockResolvedValueOnce([
        {
          id: "f-1",
          createdAt: new Date(),
          following: {
            id: mockSpecialistId,
            profile: { fullName: "Dr. Spec" },
            specialistProfile: { specialty: "Psicología" },
          },
        },
      ] as any)
      .mockResolvedValueOnce([] as any);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.following).toHaveLength(1);
    expect(data.following[0].user.id).toBe(mockSpecialistId);
    expect(data.followers).toHaveLength(0);
  });

  it("unfollows specialist on DELETE", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      userId: mockUserId,
      email: "user@luminus.com",
    } as any);

    vi.mocked(prisma.userFollow.findUnique).mockResolvedValue({ id: "follow-1" } as any);
    vi.mocked(prisma.userFollow.delete).mockResolvedValue({ id: "follow-1" } as any);

    const req = new Request(`http://localhost/api/follows?followingId=${mockSpecialistId}`, {
      method: "DELETE",
    });

    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.userFollow.delete).toHaveBeenCalledWith({ where: { id: "follow-1" } });
  });
});
