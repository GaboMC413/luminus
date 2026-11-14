/**
 * Shared utility for resolving and formatting event dates & times across timezones.
 * Reference base timezone for events created in LUMINUS: America/Argentina/Buenos_Aires (GMT-3).
 */

const MONTH_NAMES_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic"
];

/**
 * Resolves an event's date and timeText into a single accurate UTC Date instance.
 */
export function resolveEventUtcDate(
  dateVal?: string | Date | null,
  timeText?: string | null
): Date | null {
  if (!dateVal) return null;
  const str = typeof dateVal === "string" ? dateVal.trim() : dateVal.toISOString();
  if (!str) return null;

  // Extract HH and MM from timeText if present
  let hh = "18";
  let mm = "00";
  if (timeText) {
    const timeMatch = String(timeText).match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      hh = timeMatch[1].padStart(2, "0");
      mm = timeMatch[2];
    }
  }

  // Check if dateVal is date-only or has the old noon/midnight placeholder
  const isNoonOrMidnight = /T(00:00:00|12:00:00)(\.000)?Z?$/i.test(str);
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(str);

  if (isDateOnly || isNoonOrMidnight) {
    const ymd = str.substring(0, 10);
    // Interpret with Argentina/Uruguay timezone offset (-03:00)
    const d = new Date(`${ymd}T${hh}:${mm}:00-03:00`);
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats an event date & time converted to the visitor's local timezone (client-side)
 * or a specific target timezone (server-side for email generation).
 */
export function formatEventDateTime(
  dateVal?: string | Date | null,
  timeText?: string | null,
  targetTimezone?: string | null
) {
  const utcDate = resolveEventUtcDate(dateVal, timeText);
  if (!utcDate) {
    return {
      weekday: "",
      dayMonth: "",
      fullDate: "",
      timeString: timeText ? timeText.replace(/\s*\([^)]*GMT[^)]*\)/gi, "").trim() : "18:00 hs",
      dateText: "Fecha a confirmar",
    };
  }

  let weekday = "";
  let dayNum = utcDate.getDate();
  let monthStr = MONTH_NAMES_ES[utcDate.getMonth()];
  let hourMin = "18:00";
  let tzLabel = "GMT-3";

  try {
    const tzToUse = targetTimezone || (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "America/Argentina/Buenos_Aires");

    const dtf = new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: tzToUse,
    });

    const parts = dtf.formatToParts(utcDate);
    const partMap: Record<string, string> = {};
    for (const p of parts) {
      partMap[p.type] = p.value;
    }

    const rawWk = partMap.weekday || "";
    weekday = rawWk.charAt(0).toUpperCase() + rawWk.slice(1);
    dayNum = parseInt(partMap.day || String(utcDate.getDate()), 10);
    monthStr = (partMap.month || "").replace(".", "").toLowerCase();
    hourMin = `${partMap.hour || "18"}:${partMap.minute || "00"}`;

    if (!targetTimezone && typeof window !== "undefined") {
      const userOffset = utcDate.getTimezoneOffset(); // minutes
      if (userOffset === 180) {
        tzLabel = "GMT-3";
      } else {
        const diffHours = -Math.floor(userOffset / 60);
        const sign = diffHours >= 0 ? "+" : "";
        tzLabel = `GMT${sign}${diffHours}`;
      }
    } else if (targetTimezone) {
      const tzOffsetDate = new Date(utcDate.toLocaleString("en-US", { timeZone: targetTimezone }));
      const utcOffsetDate = new Date(utcDate.toLocaleString("en-US", { timeZone: "UTC" }));
      const diffHours = Math.round((tzOffsetDate.getTime() - utcOffsetDate.getTime()) / (1000 * 60 * 60));
      const sign = diffHours >= 0 ? "+" : "";
      tzLabel = `GMT${sign}${diffHours}`;
    }
  } catch (err) {
    const weekdayRaw = utcDate.toLocaleDateString("es-ES", { weekday: "long" });
    weekday = weekdayRaw.charAt(0).toUpperCase() + weekdayRaw.slice(1);
    dayNum = utcDate.getDate();
    monthStr = MONTH_NAMES_ES[utcDate.getMonth()];
    hourMin = utcDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  const timeString = `${hourMin} hs (${tzLabel})`;
  const dayMonth = `${dayNum} ${monthStr}`;
  const dateText = `${weekday} ${dayNum} de ${monthStr}. ${timeString}`;

  return {
    weekday,
    dayMonth,
    day: dayNum,
    month: monthStr,
    timeString,
    dateText,
  };
}
