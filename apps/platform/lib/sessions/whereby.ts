export interface WherebyRoomResult {
  meetingId: string;
  roomUrl: string;
  hostRoomUrl: string;
}

const WHEREBY_API_BASE = "https://api.whereby.dev/v1";

export function isWherebyConfigured(): boolean {
  return Boolean(process.env.WHEREBY_API_KEY?.trim());
}

/**
 * Converts a wall-clock date/time in an IANA timezone to a UTC epoch timestamp.
 * Falls back to UTC if the timezone identifier is invalid.
 */
function zonedWallClockToUtcMs(
  scheduledDate: string,
  startTime: string,
  timezone: string
): number {
  const [year, month, day] = scheduledDate.split("-").map(Number);
  const [hour, minute] = startTime.split(":").map(Number);
  const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0, 0);

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date(naiveUtcMs));
    const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    const zonedHour = map.hour === "24" ? 0 : Number(map.hour);
    const zonedAsUtcMs = Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      zonedHour,
      Number(map.minute),
      Number(map.second)
    );
    const offsetMs = zonedAsUtcMs - naiveUtcMs;
    return naiveUtcMs - offsetMs;
  } catch {
    return naiveUtcMs;
  }
}

/**
 * Computes Whereby's `endDate` (start + durationMinutes) in UTC ISO 8601.
 * Clamps to at least `now + durationMinutes` so Whereby never rejects an imminent room.
 */
export function computeSessionEndDateIso(
  scheduledDate: string,
  startTime: string,
  timezone = "UTC",
  durationMinutes = 15,
  nowMs = Date.now()
): string {
  const startMs = zonedWallClockToUtcMs(scheduledDate, startTime, timezone);
  const durationMs = durationMinutes * 60_000;
  const endMs = Math.max(startMs + durationMs, nowMs + durationMs);
  return new Date(endMs).toISOString();
}

export async function createWherebyRoom(params: {
  scheduledDate: string;
  startTime: string;
  timezone?: string;
  durationMinutes?: number;
}): Promise<WherebyRoomResult | null> {
  const apiKey = process.env.WHEREBY_API_KEY?.trim();
  if (!apiKey) return null;

  const endDate = computeSessionEndDateIso(
    params.scheduledDate,
    params.startTime,
    params.timezone || "UTC",
    params.durationMinutes ?? 15
  );

  try {
    const res = await fetch(`${WHEREBY_API_BASE}/meetings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endDate,
        isLocked: false,
        fields: ["hostRoomUrl"],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.warn(
        `Whereby room creation failed (${res.status}): ${errorText.slice(0, 200)}`
      );
      return null;
    }

    const data = await res.json();
    if (!data?.meetingId || !data?.roomUrl) {
      console.warn("Whereby response missing meetingId or roomUrl");
      return null;
    }

    return {
      meetingId: String(data.meetingId),
      roomUrl: String(data.roomUrl),
      hostRoomUrl: String(data.hostRoomUrl || data.roomUrl),
    };
  } catch (error) {
    console.warn("Whereby room creation error:", error);
    return null;
  }
}

export async function deleteWherebyRoom(meetingId?: string | null): Promise<void> {
  const apiKey = process.env.WHEREBY_API_KEY?.trim();
  if (!apiKey || !meetingId) return;

  try {
    await fetch(`${WHEREBY_API_BASE}/meetings/${encodeURIComponent(meetingId)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  } catch (error) {
    console.warn("Whereby room deletion error:", error);
  }
}
