import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { isUuid } from "@/utils/validation";
import {
  calculateEndTime,
  formatSessionDate,
  mondayIndex,
  toDateKey,
  toMinutes,
} from "@/lib/sessions/sessionAvailability";
import {
  createSessionNotification,
  sendSessionChatMessage,
} from "@/lib/sessions/sessionNotifications";
import { sendIntroSessionEmail } from "@/lib/mails/sender";
import { isWherebyConfigured } from "@/lib/sessions/whereby";

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

function serializeSession(row: any, viewerUserId?: string) {
  return {
    id: row.id,
    requesterId: row.requesterId,
    specialistId: row.specialistId,
    scheduledDate: row.scheduledDate,
    startTime: row.startTime,
    endTime: row.endTime,
    timezone: row.timezone,
    status: row.status,
    requesterNote: row.requesterNote || "",
    meetingLink: row.meetingLink || "",
    hostMeetingLink:
      viewerUserId && row.specialistId === viewerUserId
        ? row.hostMeetingLink || ""
        : "",
    specialistNote: row.specialistNote || "",
    createdAt: row.createdAt?.toISOString?.() ?? "",
    updatedAt: row.updatedAt?.toISOString?.() ?? "",
    requester: row.requester
      ? {
          id: row.requester.id,
          name: formatUserDisplayName(row.requester),
          avatarUrl: row.requester.profile?.avatarUrl || "",
          profession: row.requester.profile?.profession || "",
        }
      : undefined,
    specialist: row.specialist
      ? {
          id: row.specialist.id,
          name: formatUserDisplayName(row.specialist),
          avatarUrl: row.specialist.profile?.avatarUrl || "",
          specialty:
            row.specialist.specialistProfile?.specialty ||
            row.specialist.specialistProfile?.title ||
            "Especialista",
        }
      : undefined,
  };
}

const sessionUserInclude = {
  requester: {
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          fullName: true,
          avatarUrl: true,
          profession: true,
        },
      },
    },
  },
  specialist: {
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      specialistProfile: {
        select: {
          specialty: true,
          title: true,
        },
      },
    },
  },
};

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const specialistId = searchParams.get("specialistId")?.trim();

  try {
    const { prisma } = await import("@/lib/db");
    const todayKey = toDateKey(new Date());

    if (specialistId) {
      if (!isUuid(specialistId)) {
        return NextResponse.json({ message: "ID de especialista inválido." }, { status: 400 });
      }

      const [bookedSlots, myActiveSession] = await Promise.all([
        prisma.introSession.findMany({
          where: {
            specialistId,
            scheduledDate: { gte: todayKey },
            status: { in: ["pending", "accepted"] },
          },
          select: {
            scheduledDate: true,
            startTime: true,
            status: true,
          },
        }),
        prisma.introSession.findFirst({
          where: {
            requesterId: session.userId,
            specialistId,
            OR: [
              { status: "pending" },
              { status: "accepted", scheduledDate: { gte: todayKey } },
            ],
          },
          include: sessionUserInclude,
          orderBy: { createdAt: "desc" },
        }),
      ]);

      return NextResponse.json({
        bookedSlots,
        myActiveSession: myActiveSession ? serializeSession(myActiveSession) : null,
      });
    }

    const [requestedRows, receivedRows, specialistProfile] = await Promise.all([
      prisma.introSession.findMany({
        where: { requesterId: session.userId },
        include: sessionUserInclude,
        orderBy: [{ scheduledDate: "asc" }, { startTime: "asc" }],
      }),
      prisma.introSession.findMany({
        where: { specialistId: session.userId },
        include: sessionUserInclude,
        orderBy: [{ scheduledDate: "asc" }, { startTime: "asc" }],
      }),
      prisma.specialistProfile.findUnique({
        where: { userId: session.userId },
        select: { userId: true },
      }),
    ]);

    return NextResponse.json({
      requestedSessions: requestedRows.map((row) =>
        serializeSession(row, session.userId)
      ),
      receivedSessions: receivedRows.map((row) =>
        serializeSession(row, session.userId)
      ),
      isSpecialist: Boolean(specialistProfile),
      wherebyEnabled: isWherebyConfigured(),
    });
  } catch (error) {
    console.error("Failed to fetch intro sessions:", error);
    return NextResponse.json(
      { message: "No pudimos cargar las sesiones." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const specialistId = typeof body?.specialistId === "string" ? body.specialistId.trim() : "";
  const scheduledDate = typeof body?.scheduledDate === "string" ? body.scheduledDate.trim() : "";
  const startTime = typeof body?.startTime === "string" ? body.startTime.trim() : "";
  const timezone =
    typeof body?.timezone === "string" && body.timezone.trim()
      ? body.timezone.trim().slice(0, 80)
      : "UTC";
  const requesterNote =
    typeof body?.requesterNote === "string" ? body.requesterNote.trim().slice(0, 500) : "";
  const acceptedTerms = body?.acceptedTerms === true;

  if (!acceptedTerms) {
    return NextResponse.json(
      { message: "Debes aceptar las condiciones de las sesiones introductorias para continuar." },
      { status: 400 }
    );
  }
  if (!requesterNote) {
    return NextResponse.json(
      { message: "Cuéntale brevemente al especialista qué te gustaría conversar." },
      { status: 400 }
    );
  }

  if (!isUuid(specialistId)) {
    return NextResponse.json({ message: "Especialista inválido." }, { status: 400 });
  }
  if (specialistId === session.userId) {
    return NextResponse.json(
      { message: "No puedes agendar una sesión contigo mismo." },
      { status: 400 }
    );
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate) || !/^\d{2}:\d{2}$/.test(startTime)) {
    return NextResponse.json({ message: "Fecha u horario inválido." }, { status: 400 });
  }

  const todayKey = toDateKey(new Date());
  if (scheduledDate < todayKey) {
    return NextResponse.json(
      { message: "No puedes solicitar una sesión en una fecha pasada." },
      { status: 400 }
    );
  }

  const endTime = calculateEndTime(startTime, 15);
  const parsedDate = new Date(`${scheduledDate}T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ message: "Fecha inválida." }, { status: 400 });
  }
  const dayOfWeek = mondayIndex(parsedDate);

  try {
    const { prisma } = await import("@/lib/db");

    const [specialist, requester, existingSlot, existingActiveWithSpecialist] = await Promise.all([
      prisma.user.findUnique({
        where: { id: specialistId },
        include: {
          profile: true,
          specialistProfile: {
            include: {
              spaces: {
                where: { isActive: true },
                include: {
                  availability: {
                    where: { isActive: true, dayOfWeek },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: session.userId },
        include: { profile: true },
      }),
      prisma.introSession.findFirst({
        where: {
          specialistId,
          scheduledDate,
          startTime,
          status: { in: ["pending", "accepted"] },
        },
        select: { id: true },
      }),
      prisma.introSession.findFirst({
        where: {
          requesterId: session.userId,
          specialistId,
          OR: [
            { status: "pending" },
            { status: "accepted", scheduledDate: { gte: todayKey } },
          ],
        },
        select: { id: true },
      }),
    ]);

    if (!specialist || specialist.status !== "active" || !specialist.specialistProfile) {
      return NextResponse.json({ message: "Especialista no encontrado." }, { status: 404 });
    }

    const activeDayRules = specialist.specialistProfile.spaces.flatMap(
      (space: any) => space.availability || []
    );
    const startMin = toMinutes(startTime);
    const endMin = toMinutes(endTime);
    const matchesAvailability = activeDayRules.some(
      (rule: any) =>
        startMin >= toMinutes(rule.startTime) && endMin <= toMinutes(rule.endTime)
    );

    if (!matchesAvailability) {
      return NextResponse.json(
        { message: "El especialista no tiene disponibilidad en ese horario." },
        { status: 400 }
      );
    }

    if (existingActiveWithSpecialist) {
      return NextResponse.json(
        { message: "Ya tienes una sesión pendiente o confirmada con este especialista." },
        { status: 409 }
      );
    }

    if (existingSlot) {
      return NextResponse.json(
        { message: "Ese horario acaba de ser reservado. Por favor elige otro." },
        { status: 409 }
      );
    }

    const created = await prisma.introSession.create({
      data: {
        requesterId: session.userId,
        specialistId,
        scheduledDate,
        startTime,
        endTime,
        timezone,
        status: "pending",
        requesterNote: requesterNote || null,
        requesterTermsAcceptedAt: new Date(),
      },
      include: sessionUserInclude,
    });

    const requesterName = formatUserDisplayName(requester);
    const requesterAvatar = requester?.profile?.avatarUrl || "";
    const specialistName = formatUserDisplayName(specialist);
    const specialistAvatar = specialist?.profile?.avatarUrl || "";
    const friendlyDate = formatSessionDate(scheduledDate);

    const chatLines = [
      `Solicité una sesión introductoria gratuita de 15 min para el ${friendlyDate} a las ${startTime} (${timezone}).`,
    ];
    if (requesterNote) {
      chatLines.push(`Nota: "${requesterNote}"`);
    }
    chatLines.push(
      "Recuerda: es un encuentro breve para conocernos; LUMINUS facilita la conexión inicial pero no interviene en servicios profesionales posteriores."
    );

    // Fire notifications, emails & chat message without failing the booking if a side effect errors
    await Promise.allSettled([
      createSessionNotification({
        prisma,
        userId: specialistId,
        type: "session_requested",
        title: "Nueva solicitud de sesión",
        actorName: requesterName,
        actorAvatarUrl: requesterAvatar,
        body: `solicitó una sesión introductoria para el ${friendlyDate} a las ${startTime} (${timezone}).`,
        actionUrl: "/sesiones?tab=recibidas",
      }),
      createSessionNotification({
        prisma,
        userId: session.userId,
        type: "session_requested",
        title: "Solicitud enviada",
        actorName: specialistName,
        actorAvatarUrl: specialistAvatar,
        body: `recibió tu solicitud de sesión introductoria para el ${friendlyDate} a las ${startTime}.`,
        actionUrl: "/sesiones",
      }),
      sendSessionChatMessage({
        prisma,
        senderId: session.userId,
        recipientId: specialistId,
        body: chatLines.join("\n\n"),
      }),
      sendIntroSessionEmail(specialist.email, {
        variant: "requested_specialist",
        recipientName: specialistName,
        counterpartyName: requesterName,
        friendlyDate,
        startTime,
        timezone,
        note: requesterNote || undefined,
        actionPath: "/sesiones?tab=recibidas",
      }),
      requester?.email
        ? sendIntroSessionEmail(requester.email, {
            variant: "requested_requester",
            recipientName: requesterName,
            counterpartyName: specialistName,
            friendlyDate,
            startTime,
            timezone,
            note: requesterNote || undefined,
            actionPath: "/sesiones",
          })
        : Promise.resolve(),
    ]);

    return NextResponse.json(
      { session: serializeSession(created) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create intro session:", error);
    return NextResponse.json(
      { message: "No pudimos registrar tu solicitud. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
