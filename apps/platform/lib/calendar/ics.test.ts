import { describe, expect, it } from "vitest";
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  formatCalendarUtc,
  resolveZonedDateTimeToUtc,
} from "./ics";

describe("calendar/ics", () => {
  it("formats UTC dates in compact ISO format", () => {
    const date = new Date("2026-11-20T21:00:00.000Z");
    expect(formatCalendarUtc(date)).toBe("20261120T210000Z");
  });

  it("builds valid RFC 5545 ICS content with 10-minute VALARM", () => {
    const startUtc = new Date("2026-11-20T21:00:00.000Z");
    const endUtc = new Date("2026-11-20T22:00:00.000Z");
    const ics = buildIcsContent({
      uid: "event-123@luminuslatam.com",
      title: "Taller de Respiración, Calma; y Enfoque",
      description: "Primera línea\nSegunda línea",
      location: "Evento online",
      url: "https://app.luminuslatam.com/actividades/taller",
      startUtc,
      endUtc,
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("METHOD:PUBLISH");
    expect(ics).toContain("UID:event-123@luminuslatam.com");
    expect(ics).toContain("DTSTART:20261120T210000Z");
    expect(ics).toContain("DTEND:20261120T220000Z");
    expect(ics).toContain("SUMMARY:Taller de Respiración\\, Calma\\; y Enfoque");
    expect(ics).toContain("TRIGGER:-PT10M");
    expect(ics).toContain("END:VCALENDAR\r\n");
  });

  it("builds a Google Calendar template URL", () => {
    const startUtc = new Date("2026-11-20T21:00:00.000Z");
    const endUtc = new Date("2026-11-20T21:15:00.000Z");
    const url = buildGoogleCalendarUrl({
      title: "Sesión introductoria con Ana",
      description: "Sesión de 15 min",
      location: "https://whereby.com/luminus-test",
      url: "https://whereby.com/luminus-test",
      startUtc,
      endUtc,
    });

    expect(url).toContain("https://calendar.google.com/calendar/render?");
    expect(url).toContain("action=TEMPLATE");
    expect(url).toContain("dates=20261120T210000Z%2F20261120T211500Z");
    expect(url).toContain("Sesi%C3%B3n+introductoria+con+Ana");
  });

  it("resolves zoned date and time to exact UTC Date", () => {
    // America/Montevideo is UTC-3 year-round
    const utc = resolveZonedDateTimeToUtc("2026-11-20", "18:30", "America/Montevideo");
    expect(utc?.toISOString()).toBe("2026-11-20T21:30:00.000Z");

    // UTC timezone should match directly
    const utcDirect = resolveZonedDateTimeToUtc("2026-11-20", "18:30", "UTC");
    expect(utcDirect?.toISOString()).toBe("2026-11-20T18:30:00.000Z");
  });
});
