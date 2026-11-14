export type AvailabilityRule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
};

export type BookedSlot = {
  scheduledDate: string; // YYYY-MM-DD
  startTime: string;     // HH:mm
  status?: string;
};

export type AvailableDateOption = {
  date: Date;
  dateKey: string;      // YYYY-MM-DD
  dayLabel: string;     // Lun, Mar, ...
  dayNumber: number;
  monthShort: string;   // nov, dic, ...
  slots: string[];      // ["09:00", "09:15", ...]
};

const SHORT_DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const SHORT_MONTH_LABELS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function toMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function formatMinutes(value: number): string {
  const hours = Math.floor(value / 60).toString().padStart(2, "0");
  const minutes = (value % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function calculateEndTime(startTime: string, durationMinutes = 15): string {
  return formatMinutes(toMinutes(startTime) + durationMinutes);
}

export function formatSessionDate(dateStr: string): string {
  const parsed = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortSessionDate(dateStr: string): string {
  const parsed = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  const dayLabel = SHORT_DAY_LABELS[mondayIndex(parsed)];
  const dayNum = parsed.getDate();
  const monthShort = SHORT_MONTH_LABELS[parsed.getMonth()];
  return `${dayLabel} ${dayNum} ${monthShort}`;
}

/**
 * Computes upcoming dates (up to `daysAhead`) that have at least one free 15-minute slot,
 * excluding already booked slots and past/imminent slots today (30-min buffer).
 */
export function getAvailableDatesWithSlots(
  availability: AvailabilityRule[],
  bookedSlots: BookedSlot[] = [],
  daysAhead = 28,
  now: Date = new Date()
): AvailableDateOption[] {
  const activeRules = availability.filter((item) => item.isActive !== false);
  if (activeRules.length === 0) return [];

  const rulesByDay = new Map<number, AvailabilityRule[]>();
  for (const rule of activeRules) {
    const existing = rulesByDay.get(rule.dayOfWeek) || [];
    existing.push(rule);
    rulesByDay.set(rule.dayOfWeek, existing);
  }

  const bookedSet = new Set<string>(
    bookedSlots.map((slot) => `${slot.scheduledDate}|${slot.startTime}`)
  );

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const currentMinutesWithBuffer = now.getHours() * 60 + now.getMinutes() + 30;

  const result: AvailableDateOption[] = [];

  for (let offset = 0; offset < daysAhead; offset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const dayIdx = mondayIndex(date);
    const dayRules = rulesByDay.get(dayIdx);
    if (!dayRules || dayRules.length === 0) continue;

    const key = toDateKey(date);
    const slotSet = new Set<string>();

    for (const rule of dayRules) {
      const startMin = toMinutes(rule.startTime);
      const endMin = toMinutes(rule.endTime);
      for (let t = startMin; t + 15 <= endMin; t += 15) {
        if (offset === 0 && t <= currentMinutesWithBuffer) {
          continue;
        }
        const timeStr = formatMinutes(t);
        if (!bookedSet.has(`${key}|${timeStr}`)) {
          slotSet.add(timeStr);
        }
      }
    }

    if (slotSet.size > 0) {
      const sortedSlots = Array.from(slotSet).sort();
      result.push({
        date,
        dateKey: key,
        dayLabel: SHORT_DAY_LABELS[dayIdx],
        dayNumber: date.getDate(),
        monthShort: SHORT_MONTH_LABELS[date.getMonth()],
        slots: sortedSlots,
      });
    }
  }

  return result;
}
