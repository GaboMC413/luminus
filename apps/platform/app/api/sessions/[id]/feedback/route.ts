import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { isUuid } from "@/utils/validation";
import {
  verifyFeedbackToken,
  type FeedbackTokenRole,
} from "@/lib/sessions/feedbackToken";
import { formatSessionDate } from "@/lib/sessions/sessionAvailability";
import {
  createSessionNotification,
  sendSessionChatMessage,
} from "@/lib/sessions/sessionNotifications";
import { sendIntroSessionEmail } from "@/lib/mails/sender";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_RESONANCES = new Set(["no_match", "dim", "warm", "luminous"]);

function formatUserDisplayName(user: any) {
  const p = user?.profile;
  return (
    p?.fullName ||
    `${p?.firstName || ""} ${p?.lastName || ""}`.trim() ||
    user?.email ||
    "Usuario"
  );
}

async function resolveActor(
  introSessionId: string,
  token: string | null,
  sessionRow: { requesterId: string; specialistId: string }
): Promise<{ userId: string; role: FeedbackTokenRole } | null> {
  if (token) {
    const verified = verifyFeedbackToken(token);
    if (!verified || verified.sessionId !== introSessionId) {
      return null;
    }
    const expectedUserId =
      verified.role === "specialist"
        ? sessionRow.specialistId
        : sessionRow.requesterId;
    if (verified.userId !== expectedUserId) return null;
    return { userId: verified.userId, role: verified.role };
  }

  const current = await getCurrentSession();
  if (!current) return null;
  if (current.userId === sessionRow.specialistId) {
    return { userId: current.userId, role: "specialist" };
  }
  if (current.userId === sessionRow.requesterId) {
    return { userId: current.userId, role: "requester" };
  }
  return null;
}

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  if (!isUuid(id)) {
    return NextResponse.json({ message: "Sesión inválida." }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim() || null;

  try {
    const { prisma } = await import("@/lib/db");
    const introSession = await prisma.introSession.findUnique({
      where: { id },
      include: {
        requester: { select: { id: true, email: true, profile: true } },
        specialist: {
          select: {
            id: true,
            email: true,
            profile: true,
            specialistProfile: { select: { specialty: true, title: true } },
          },
        },
        feedbacks: true,
      },
    });

    if (!introSession) {
      return NextResponse.json({ message: "Sesión no encontrada." }, { status: 404 });
    }

    const actor = await resolveActor(id, token, introSession);
    if (!actor) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    const ownFeedback =
      introSession.feedbacks.find((f: { role: string }) => f.role === actor.role) || null;
    const specialistFeedback =
      introSession.feedbacks.find((f: { role: string }) => f.role === "specialist") || null;

    const counterparty =
      actor.role === "specialist" ? introSession.requester : introSession.specialist;

    return NextResponse.json({
      session: {
        id: introSession.id,
        scheduledDate: introSession.scheduledDate,
        friendlyDate: formatSessionDate(introSession.scheduledDate),
        startTime: introSession.startTime,
        endTime: introSession.endTime,
        timezone: introSession.timezone,
        status: introSession.status,
        role: actor.role,
        counterparty: {
          name: formatUserDisplayName(counterparty),
          avatarUrl: counterparty?.profile?.avatarUrl || "",
          specialty:
            actor.role === "requester"
              ? introSession.specialist?.specialistProfile?.specialty ||
                introSession.specialist?.specialistProfile?.title ||
                "Especialista"
              : undefined,
        },
        specialistGuidance:
          actor.role === "requester" ? specialistFeedback?.publicNote || null : null,
      },
      feedback: ownFeedback
        ? {
            attended: ownFeedback.attended,
            resonance: ownFeedback.resonance,
            publicNote: ownFeedback.publicNote || "",
            privateNote: ownFeedback.privateNote || "",
            createdAt: ownFeedback.createdAt.toISOString(),
          }
        : null,
    });
  } catch (error) {
    console.error("[sessions/feedback] GET error:", error);
    return NextResponse.json(
      { message: "No pudimos cargar la valoración de la sesión." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  if (!isUuid(id)) {
    return NextResponse.json({ message: "Sesión inválida." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const token =
    typeof body?.token === "string" && body.token.trim() ? body.token.trim() : null;
  const attended = body?.attended !== false;
  const rawResonance =
    typeof body?.resonance === "string" ? body.resonance.trim() : "";
  const resonance = VALID_RESONANCES.has(rawResonance)
    ? (rawResonance as "no_match" | "dim" | "warm" | "luminous")
    : null;
  const publicNote =
    typeof body?.publicNote === "string" ? body.publicNote.trim().slice(0, 1000) : "";
  const privateNote =
    typeof body?.privateNote === "string" ? body.privateNote.trim().slice(0, 1000) : "";

  try {
    const { prisma } = await import("@/lib/db");
    const introSession = await prisma.introSession.findUnique({
      where: { id },
      include: {
        requester: { select: { id: true, email: true, profile: true } },
        specialist: { select: { id: true, email: true, profile: true } },
      },
    });

    if (!introSession) {
      return NextResponse.json({ message: "Sesión no encontrada." }, { status: 404 });
    }

    if (introSession.status !== "accepted") {
      return NextResponse.json(
        { message: "Solo puedes dejar devolución en sesiones confirmadas." },
        { status: 400 }
      );
    }

    const actor = await resolveActor(id, token, introSession);
    if (!actor) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    if (actor.role === "requester" && attended && !resonance) {
      return NextResponse.json(
        { message: "Elige cómo sentiste la sesión para continuar." },
        { status: 400 }
      );
    }

    const existing = await prisma.introSessionFeedback.findUnique({
      where: {
        introSessionId_role: {
          introSessionId: id,
          role: actor.role,
        },
      },
    });

    const saved = await prisma.introSessionFeedback.upsert({
      where: {
        introSessionId_role: {
          introSessionId: id,
          role: actor.role,
        },
      },
      create: {
        introSessionId: id,
        authorId: actor.userId,
        role: actor.role,
        attended,
        resonance,
        publicNote: publicNote || null,
        privateNote: privateNote || null,
      },
      update: {
        attended,
        resonance,
        publicNote: publicNote || null,
        privateNote: privateNote || null,
      },
    });

    // When specialist submits guidance for the first time (or changes it to non-empty),
    // deliver it via in-app chat, notification, and email.
    const shouldDeliverGuidance =
      actor.role === "specialist" &&
      Boolean(publicNote) &&
      (!existing || existing.publicNote !== publicNote);

    if (shouldDeliverGuidance) {
      const specialistName = formatUserDisplayName(introSession.specialist);
      const specialistAvatar = introSession.specialist?.profile?.avatarUrl || "";
      const requesterName = formatUserDisplayName(introSession.requester);
      const friendlyDate = formatSessionDate(introSession.scheduledDate);

      await Promise.allSettled([
        sendSessionChatMessage({
          prisma,
          senderId: introSession.specialistId,
          recipientId: introSession.requesterId,
          body: `Orientación de nuestra sesión introductoria (${friendlyDate}):\n\n${publicNote}`,
        }),
        createSessionNotification({
          prisma,
          userId: introSession.requesterId,
          type: "session_guidance",
          title: "Nueva orientación de sesión",
          actorName: specialistName,
          actorAvatarUrl: specialistAvatar,
          body: "Te dejó una reflexión y próximo paso tras tu sesión.",
          actionUrl: "/sesiones",
        }),
        introSession.requester?.email
          ? sendIntroSessionEmail(introSession.requester.email, {
              variant: "specialist_guidance",
              recipientName: requesterName,
              counterpartyName: specialistName,
              friendlyDate,
              startTime: introSession.startTime,
              timezone: introSession.timezone,
              note: publicNote,
              actionPath: "/sesiones",
            })
          : Promise.resolve(),
      ]);
    }

    return NextResponse.json({
      success: true,
      feedback: {
        attended: saved.attended,
        resonance: saved.resonance,
        publicNote: saved.publicNote || "",
        privateNote: saved.privateNote || "",
      },
    });
  } catch (error) {
    console.error("[sessions/feedback] POST error:", error);
    return NextResponse.json(
      { message: "No pudimos guardar tu devolución." },
      { status: 500 }
    );
  }
}
