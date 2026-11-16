import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { isUuid } from "@/utils/validation";
import { formatSessionDate } from "@/lib/sessions/sessionAvailability";
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

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { id } = await props.params;
  if (!isUuid(id)) {
    return NextResponse.json({ message: "Sesión inválida." }, { status: 400 });
  }

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

    const isSpecialist = introSession.specialistId === session.userId;
    const isRequester = introSession.requesterId === session.userId;
    if (!isSpecialist && !isRequester) {
      return NextResponse.json({ message: "No autorizado." }, { status: 403 });
    }

    if (introSession.status !== "accepted") {
      return NextResponse.json(
        { message: "Esta sesión no está confirmada." },
        { status: 400 }
      );
    }

    const { hasStarted, hasEnded, isRoomClosed } = getSessionTimeState(introSession);
    if (isRoomClosed) {
      if (introSession.wherebyMeetingId) {
        await deleteWherebyRoom(introSession.wherebyMeetingId);
        await prisma.introSession.update({
          where: { id: introSession.id },
          data: {
            wherebyMeetingId: null,
            meetingLink: "",
            hostMeetingLink: null,
          },
        });
      }
      return NextResponse.json(
        { message: "La sala de esta sesión ya cerró.", closed: true },
        { status: 410 }
      );
    }

    const roomUrl = isSpecialist
      ? introSession.hostMeetingLink || introSession.meetingLink || ""
      : introSession.meetingLink || "";

    const counterparty = isSpecialist
      ? introSession.requester
      : introSession.specialist;

    return NextResponse.json({
      room: {
        id: introSession.id,
        roomUrl,
        isWhereby: Boolean(introSession.wherebyMeetingId),
        hasStarted,
        hasEnded,
        role: isSpecialist ? "specialist" : "requester",
        counterpartyName: formatUserDisplayName(counterparty),
        friendlyDate: formatSessionDate(introSession.scheduledDate),
        startTime: introSession.startTime,
        endTime: introSession.endTime,
      },
    });
  } catch (error) {
    console.error("[sessions/room] GET error:", error);
    return NextResponse.json(
      { message: "No pudimos abrir la sala de la sesión." },
      { status: 500 }
    );
  }
}
