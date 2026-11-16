import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { resolveEventUtcDate } from "@/lib/eventDateUtils";
import { resolveZonedDateTimeToUtc } from "@/lib/calendar/ics";
import { formatSessionDate } from "@/lib/sessions/sessionAvailability";
import {
  sendEventReminderEmail,
  sendIntroSessionEmail,
} from "@/lib/mails/sender";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REMINDER_LOOKAHEAD_MS = 12 * 60 * 1000; // 12 min window for 2-min cron cadence

function isAuthorizedCron(req: Request): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !authHeader) return false;

  const expectedHeader = `Bearer ${cronSecret}`;
  const authBuf = Buffer.from(authHeader);
  const expectedBuf = Buffer.from(expectedHeader);

  return (
    authBuf.length === expectedBuf.length &&
    timingSafeEqual(authBuf, expectedBuf)
  );
}

function formatUserDisplayName(user: any): string {
  const p = user?.profile;
  return (
    p?.fullName ||
    `${p?.firstName || ""} ${p?.lastName || ""}`.trim() ||
    user?.email ||
    "Usuario"
  );
}

async function executeReminders(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const now = new Date();
    const nowMs = now.getTime();
    const windowEndMs = nowMs + REMINDER_LOOKAHEAD_MS;

    // 1. Events starting in the next ~10-12 minutes
    const candidateEvents = await prisma.event.findMany({
      where: {
        isUpcoming: true,
        reminderSentAt: null,
        date: { not: null },
      },
      include: {
        inscriptions: {
          include: {
            guest: true,
          },
        },
      },
    });

    let eventsProcessed = 0;
    let eventEmailsSent = 0;

    for (const event of candidateEvents) {
      const startUtc = resolveEventUtcDate(event.date, event.timeText);
      if (!startUtc) continue;

      const startMs = startUtc.getTime();
      if (startMs < nowMs || startMs > windowEndMs) continue;

      // Atomic claim prevents duplicate sends across overlapping cron invocations
      const claimed = await prisma.event.updateMany({
        where: { id: event.id, reminderSentAt: null },
        data: { reminderSentAt: now },
      });
      if (claimed.count === 0) continue;

      eventsProcessed++;
      const youtubeUrl =
        event.link ||
        (event.youtubeId
          ? `https://www.youtube.com/watch?v=${event.youtubeId}`
          : null);

      const batchSize = 10;
      for (let i = 0; i < event.inscriptions.length; i += batchSize) {
        const batch = event.inscriptions.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map((ins) =>
            sendEventReminderEmail(ins.guest.email, {
              firstName: ins.guest.firstName,
              eventTitle: event.title,
              eventCoverUrl: event.coverUrl,
              eventDate: event.date ? event.date.toISOString() : null,
              timeText: event.timeText,
              speakerName: event.speakerName,
              youtubeUrl,
              eventSlug: event.slug,
              location: event.location || "Evento online",
              source: ins.guest.isGuest ? "web" : "platform",
            })
          )
        );
        eventEmailsSent += results.filter((r) => r.status === "fulfilled").length;
      }
    }

    // 2. Accepted Intro Sessions starting in the next ~10-12 minutes
    const candidateSessions = await prisma.introSession.findMany({
      where: {
        status: "accepted",
        reminderSentAt: null,
      },
      include: {
        requester: { include: { profile: true } },
        specialist: { include: { profile: true } },
      },
    });

    let sessionsProcessed = 0;
    let sessionEmailsSent = 0;

    for (const s of candidateSessions) {
      const startUtc = resolveZonedDateTimeToUtc(
        s.scheduledDate,
        s.startTime,
        s.timezone
      );
      if (!startUtc) continue;

      const startMs = startUtc.getTime();
      if (startMs < nowMs || startMs > windowEndMs) continue;

      const claimed = await prisma.introSession.updateMany({
        where: { id: s.id, reminderSentAt: null },
        data: { reminderSentAt: now },
      });
      if (claimed.count === 0) continue;

      sessionsProcessed++;
      const friendlyDate = formatSessionDate(s.scheduledDate);
      const requesterName = formatUserDisplayName(s.requester);
      const specialistName = formatUserDisplayName(s.specialist);

      const tasks: Promise<any>[] = [];
      if (s.requester?.email) {
        tasks.push(
          sendIntroSessionEmail(s.requester.email, {
            variant: "reminder_requester",
            recipientName: requesterName,
            counterpartyName: specialistName,
            friendlyDate,
            startTime: s.startTime,
            timezone: s.timezone,
            meetingLink: s.meetingLink || undefined,
            actionPath: "/sesiones",
          })
        );
      }
      if (s.specialist?.email) {
        tasks.push(
          sendIntroSessionEmail(s.specialist.email, {
            variant: "reminder_specialist",
            recipientName: specialistName,
            counterpartyName: requesterName,
            friendlyDate,
            startTime: s.startTime,
            timezone: s.timezone,
            meetingLink: s.hostMeetingLink || s.meetingLink || undefined,
            actionPath: "/sesiones?tab=recibidas",
          })
        );
      }

      const results = await Promise.allSettled(tasks);
      sessionEmailsSent += results.filter(
        (r) => r.status === "fulfilled" && r.value?.success !== false
      ).length;
    }

    return NextResponse.json({
      success: true,
      eventsProcessed,
      eventEmailsSent,
      sessionsProcessed,
      sessionEmailsSent,
    });
  } catch (error) {
    console.error("[cron/send-reminders] Execution error:", error);
    return NextResponse.json(
      { message: "Error al ejecutar recordatorios." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return executeReminders(req);
}

export async function POST(req: Request) {
  return executeReminders(req);
}
