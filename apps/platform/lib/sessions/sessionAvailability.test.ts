import { describe, it, expect } from "vitest";
import {
  calculateEndTime,
  getAvailableDatesWithSlots,
  toDateKey,
} from "./sessionAvailability";

describe("sessionAvailability", () => {
  it("calculates 15-minute end time accurately", () => {
    expect(calculateEndTime("09:00")).toBe("09:15");
    expect(calculateEndTime("09:45")).toBe("10:00");
    expect(calculateEndTime("18:30")).toBe("18:45");
  });

  it("returns only days with active availability and excludes booked or past slots", () => {
    // Saturday 2026-11-14 at 10:00 local
    const now = new Date(2026, 10, 14, 10, 0, 0);
    // Availability only on Saturday (dayOfWeek = 5) 10:00-11:00 and Monday (dayOfWeek = 0) 09:00-09:30
    const rules = [
      { dayOfWeek: 5, startTime: "10:00", endTime: "11:00", isActive: true },
      { dayOfWeek: 0, startTime: "09:00", endTime: "09:30", isActive: true },
    ];
    const booked = [
      { scheduledDate: "2026-11-14", startTime: "10:45" },
      { scheduledDate: "2026-11-16", startTime: "09:00" },
    ];

    const available = getAvailableDatesWithSlots(rules, booked, 7, now);

    // 2026-11-14 (Sat): 10:00, 10:15, 10:30 excluded by 30-min buffer (<=10:30), 10:45 booked -> 0 slots -> date excluded!
    // 2026-11-16 (Mon): 09:00 booked, 09:15 free -> included with ["09:15"]
    expect(available.map((d) => d.dateKey)).toEqual(["2026-11-16"]);
    expect(available[0].slots).toEqual(["09:15"]);
    expect(toDateKey(available[0].date)).toBe("2026-11-16");
  });
});
