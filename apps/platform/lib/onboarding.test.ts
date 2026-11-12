import { describe, it, expect, vi, beforeEach } from "vitest";
import { getOnboardingQuests, checkAndTriggerQuestsCompletion, QUEST_CONFIG } from "./onboarding";
import { prisma } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    notification: {
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
    activityLog: {
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

describe("Destellos (Onboarding Quests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOnboardingQuests", () => {
    it("returns 0% progress and uncompleted quests when profile is empty", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-1",
        profile: {
          profession: "",
          bio: "",
          coverUrl: "",
          intention: "",
        },
        profilePrompts: [],
        interests: [],
        sentConnections: [],
        receivedConnections: [],
      } as any);

      const result = await getOnboardingQuests("user-1");
      expect(result.progressPercentage).toBe(0);
      expect(result.quests.every((q) => !q.completed)).toBe(true);
      expect(result.quests.length).toBe(6);
    });

    it("evaluates completed quests properly and filters out blocked connections", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-1",
        profile: {
          profession: "Psicólogo",
          bio: "Hola a todos",
          coverUrl: "/covers/cover-1.png",
          intention: "",
        },
        profilePrompts: [{ id: "p1" }],
        interests: [{ id: "i1" }],
        sentConnections: [{ id: "c1", status: "accepted" }],
        receivedConnections: [],
      } as any);

      const result = await getOnboardingQuests("user-1");
      expect(result.progressPercentage).toBe(100);
      expect(result.quests.every((q) => q.completed)).toBe(true);
    });
  });

  describe("checkAndTriggerQuestsCompletion", () => {
    it("triggers celebration when quest is newly completed and not in notifications or activity logs", async () => {
      vi.mocked(prisma.notification.findMany).mockResolvedValue([]);
      vi.mocked(prisma.activityLog.findMany).mockResolvedValue([]);
      vi.mocked(prisma.notification.createMany).mockResolvedValue({ count: 1 } as any);
      vi.mocked(prisma.activityLog.createMany).mockResolvedValue({ count: 1 } as any);

      const preloadedUser = {
        id: "user-1",
        profile: { coverUrl: "/covers/cover-2.png" },
        profilePrompts: [],
        interests: [],
      };

      const result = await checkAndTriggerQuestsCompletion("user-1", ["cover"], preloadedUser);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("cover");

      // Verifies notification was created
      expect(prisma.notification.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            userId: "user-1",
            type: "quest_completed_cover",
          }),
        ],
      });

      // Verifies permanent activity log was created
      expect(prisma.activityLog.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            userId: "user-1",
            action: "QUEST_COMPLETED",
            details: "cover",
          }),
        ],
      });
    });

    it("prevents duplicate quest completion if notification was deleted but activityLog exists", async () => {
      // Notification deleted by user
      vi.mocked(prisma.notification.findMany).mockResolvedValue([]);
      // Permanent ActivityLog persists
      vi.mocked(prisma.activityLog.findMany).mockResolvedValue([
        { id: "log-1", userId: "user-1", action: "QUEST_COMPLETED", details: "cover", createdAt: new Date() },
      ] as any);

      const preloadedUser = {
        id: "user-1",
        profile: { coverUrl: "/covers/cover-2.png" },
        profilePrompts: [],
        interests: [],
      };

      const result = await checkAndTriggerQuestsCompletion("user-1", ["cover"], preloadedUser);

      // Does not trigger celebration again!
      expect(result).toHaveLength(0);
      expect(prisma.notification.createMany).not.toHaveBeenCalled();
      expect(prisma.activityLog.createMany).not.toHaveBeenCalled();
    });
  });
});

