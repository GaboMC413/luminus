/**
 * Client- and server-safe utilities for generating RFC 5545 (.ics) calendar files,
 * Google Calendar deep links, and timezone-aware UTC timestamps.
 */

export interface CalendarEventInput {
  uid?: string;
  title: string;
  description?: string | null;
  location?: string | null;
  url?: string | null;
  startUtc: Date;
  endUtc: Date;
}

/**
 * Formats a UTC Date as YYYYMMDDTHHMMSSZ for ICS and Google Calendar.
 */
export function formatCalendarUtc(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}` +
    `${pad(date.getUTCMonth() + 1)}` +
    `${pad(date.getUTCDate())}T` +
    `${pad(date.getUTCHours())}` +
    `${pad(date.getUTCMinutes())}` +
    `${pad(date.getUTCSeconds())}Z`
  );
}

/**
 * Escapes special characters per RFC 5545 TEXT value rules.
 */
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

/**
 * Folds lines longer than 75 characters with CRLF + space per RFC 5545.
 */
function foldIcsLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [line.slice(0, 75)];
  let i = 75;
  while (i < line.length) {
    chunks.push(` ${line.slice(i, i + 74)}`);
    i += 74;
  }
  return chunks.join("\r\n");
}

/**
 * Generates an RFC 5545 .ics calendar payload with a 10-minute VALARM reminder.
 */
export function buildIcsContent(input: CalendarEventInput): string {
  const uid =
    input.uid ||
    `luminus-${formatCalendarUtc(input.startUtc)}-${Math.random().toString(36).slice(2, 10)}@luminuslatam.com`;
  const dtStamp = formatCalendarUtc(new Date());
  const dtStart = formatCalendarUtc(input.startUtc);
  const dtEnd = formatCalendarUtc(input.endUtc);

  const descriptionParts: string[] = [];
  if (input.description?.trim()) {
    descriptionParts.push(input.description.trim());
  }
  if (input.url?.trim()) {
    descriptionParts.push(`Enlace de acceso: ${input.url.trim()}`);
  }
  const description = descriptionParts.join("\n\n");

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LUMINUS LATAM//Events & Sessions//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(input.title)}`,
  ];

  if (description) {
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
  }
  if (input.location?.trim()) {
    lines.push(`LOCATION:${escapeIcsText(input.location.trim())}`);
  }
  if (input.url?.trim()) {
    lines.push(`URL:${input.url.trim()}`);
  }

  lines.push(
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcsText(`${input.title} comienza en 10 minutos`)}`,
    "TRIGGER:-PT10M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  );

  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}

/**
 * Builds a Google Calendar "Add Event" template URL.
 */
export function buildGoogleCalendarUrl(input: CalendarEventInput): string {
  const params = new URLSearchParams();
  params.set("action", "TEMPLATE");
  params.set("text", input.title);
  params.set(
    "dates",
    `${formatCalendarUtc(input.startUtc)}/${formatCalendarUtc(input.endUtc)}`
  );

  const detailsParts: string[] = [];
  if (input.description?.trim()) {
    detailsParts.push(input.description.trim());
  }
  if (input.url?.trim()) {
    detailsParts.push(`Enlace de acceso: ${input.url.trim()}`);
  }
  if (detailsParts.length > 0) {
    params.set("details", detailsParts.join("\n\n"));
  }
  if (input.location?.trim()) {
    params.set("location", input.location.trim());
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Converts a local date ("YYYY-MM-DD") and time ("HH:mm") in an IANA timezone
 * into an exact UTC Date instance.
 */
export function resolveZonedDateTimeToUtc(
  dateStr?: string | null,
  timeStr?: string | null,
  timeZone: string = "America/Montevideo"
): Date | null {
  if (!dateStr || !timeStr) return null;
  const dateMatch = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = timeStr.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!dateMatch || !timeMatch) return null;

  const year = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);
  const day = parseInt(dateMatch[3], 10);
  const hour = parseInt(timeMatch[1], 10);
  const minute = parseInt(timeMatch[2], 10);

  const targetAsUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0, 0);

  const getZonedAsUtcMs = (utcMs: number, tz: string): number => {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    const parts = dtf.formatToParts(new Date(utcMs));
    const map: Record<string, number> = {};
    for (const p of parts) {
      if (p.type !== "literal") {
        map[p.type] = parseInt(p.value, 10);
      }
    }
    const h = map.hour === 24 ? 0 : map.hour;
    return Date.UTC(map.year, map.month - 1, map.day, h, map.minute, map.second, 0);
  };

  try {
    // Two-pass convergence handles DST transitions accurately.
    let guess = targetAsUtcMs;
    for (let i = 0; i < 2; i++) {
      const zonedMs = getZonedAsUtcMs(guess, timeZone);
      guess += targetAsUtcMs - zonedMs;
    }
    const result = new Date(guess);
    return isNaN(result.getTime()) ? null : result;
  } catch {
    return null;
  }
}

/**
 * Triggers a browser download of an .ics file.
 */
export function downloadIcsFile(filename: string, icsContent: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
