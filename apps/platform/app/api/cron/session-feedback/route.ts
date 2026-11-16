import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { formatSessionDate } from "@/lib/sessions/sessionAvailability";
import {
  createFeedbackToken,
  isFeedbackFallbackDue,
} from "@/lib/sessions/feedbackToken";
import { sendIntroSessionEmail } from "@/lib/mails/sender";
import { deleteWherebyRoom, getSessionTimeState } from "@/lib/sessions/whereby";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatUserDisplayName(user: any) {
  const p = user?.profile;
  return (
    p?.fullName ||
    `${p?.firstName || ""} ${p?.lastName || ""}`.trim() ||
    user?.email ||
    "Usuario"
  );
}

async function executeFeedbackFallback(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !authHeader) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const expectedHeader = `Bearer ${cronSecret}`;
  const authBuf = Buffer.from(authHeader);
  const expectedBuf = Buffer.from(expectedHeader);

  if (authBuf.length !== expectedBuf.length || !timingSafeEqual(authBuf, expectedBuf)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const candidates = await prisma.introSession.findMany({
      where: {
        status: "accepted",
        feedbackEmailSentAt: null,
      },
      include: {
        requester: { select: { id: true, email: true, profile: true } },
        specialist: { select: { id: true, email: true, profile: true } },
        feedbacks: { select: { role: true } },
      },
      take: 100,
    });

    const nowMs = Date.now();
    let processedCount = 0;
    let emailsSent = 0;

    for (const item of candidates) {
      if (
        !isFeedbackFallbackDue(
          {
            scheduledDate: item.scheduledDate,
            endTime: item.endTime,
            timezone: item.timezone,
          },
          nowMs
        )
      ) {
        continue;
      }

      const submittedRoles = new Set(item.feedbacks.map((f: { role: string }) => f.role));
      const friendlyDate = formatSessionDate(item.scheduledDate);
      const requesterName = formatUserDisplayName(item.requester);
      const specialistName = formatUserDisplayName(item.specialist);

      const tasks: Promise<unknown>[] = [];

      if (!submittedRoles.has("requester") && item.requester?.email) {
        const token = createFeedbackToken({
          sessionId: item.id,
          userId: item.requesterId,
          role: "requester",
        });
        tasks.push(
          sendIntroSessionEmail(item.requester.email, {
            variant: "feedback_requester",
            recipientName: requesterName,
            counterpartyName: specialistName,
            friendlyDate,
            startTime: item.startTime,
            timezone: item.timezone,
            actionPath: `/sesiones/feedback?sessionId=${item.id}&token=${encodeURIComponent(token)}`,
          }).then((res) => {
            if (res?.success) emailsSent++;
          })
        );
      }

      if (!submittedRoles.has("specialist") && item.specialist?.email) {
        const token = createFeedbackToken({
          sessionId: item.id,
          userId: item.specialistId,
          role: "specialist",
        });
        tasks.push(
          sendIntroSessionEmail(item.specialist.email, {
            variant: "feedback_specialist",
            recipientName: specialistName,
            counterpartyName: requesterName,
            friendlyDate,
            startTime: item.startTime,
            timezone: item.timezone,
            actionPath: `/sesiones/feedback?sessionId=${item.id}&token=${encodeURIComponent(token)}`,
          }).then((res) => {
            if (res?.success) emailsSent++;
          })
        );
      }

      await Promise.allSettled(tasks);
      const roomExpired =
        Boolean(item.wherebyMeetingId) && getSessionTimeState(item, nowMs).isRoomClosed;
      if (roomExpired) {
        await deleteWherebyRoom(item.wherebyMeetingId);
      }
      await prisma.introSession.update({
        where: { id: item.id },
        data: {
          feedbackEmailSentAt: new Date(),
          ...(roomExpired
            ? { wherebyMeetingId: null, meetingLink: "", hostMeetingLink: null }
            : {}),
        },
      });
      processedCount++;
    }

    return NextResponse.json({
      success: true,
      processedCount,
      emailsSent,
    });
  } catch (error) {
    console.error("[cron/session-feedback] Execution error:", error);
    return NextResponse.json(
      { message: "Error al enviar recordatorios de valoración." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return executeFeedbackFallback(req);
}

export async function POST(req: Request) {
  return executeFeedbackFallback(req);
}
