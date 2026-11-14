import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { isUuid } from "@/utils/validation";
import { formatSessionDate } from "@/lib/sessions/sessionAvailability";
import {
  createSessionNotification,
  sendSessionChatMessage,
} from "@/lib/sessions/sessionNotifications";
import { sendIntroSessionEmail } from "@/lib/mails/sender";
import {
  createWherebyRoom,
  deleteWherebyRoom,
  isWherebyConfigured,
} from "@/lib/sessions/whereby";

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

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { id } = params;
  if (!isUuid(id)) {
    return NextResponse.json({ message: "Sesión inválida." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const action = typeof body?.action === "string" ? body.action.trim() : "";
  const meetingLink =
    typeof body?.meetingLink === "string" ? body.meetingLink.trim().slice(0, 500) : "";
  const specialistNote =
    typeof body?.specialistNote === "string" ? body.specialistNote.trim().slice(0, 500) : "";
  const acceptedTerms = body?.acceptedTerms === true;

  if (!["accept", "decline", "cancel"].includes(action)) {
    return NextResponse.json({ message: "Acción no válida." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const introSession = await prisma.introSession.findUnique({
      where: { id },
      include: {
        requester: { include: { profile: true } },
        specialist: { include: { profile: true } },
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

    if ((action === "accept" || action === "decline") && !isSpecialist) {
      return NextResponse.json(
        { message: "Solo el especialista puede aceptar o rechazar la solicitud." },
        { status: 403 }
      );
    }

    let resolvedMeetingLink = meetingLink;
    let hostMeetingLink: string | null = null;
    let wherebyMeetingId: string | null = null;

    if (action === "accept") {
      if (introSession.status !== "pending") {
        return NextResponse.json(
          { message: "Solo puedes aceptar sesiones pendientes." },
          { status: 400 }
        );
      }
      if (!acceptedTerms) {
        return NextResponse.json(
          {
            message:
              "Debes aceptar las condiciones para especialistas y sesiones introductorias.",
          },
          { status: 400 }
        );
      }

      if (!resolvedMeetingLink && isWherebyConfigured()) {
        const room = await createWherebyRoom({
          scheduledDate: introSession.scheduledDate,
          startTime: introSession.startTime,
          timezone: introSession.timezone,
          durationMinutes: 15,
        });
        if (room) {
          resolvedMeetingLink = room.roomUrl;
          hostMeetingLink = room.hostRoomUrl;
          wherebyMeetingId = room.meetingId;
        }
      }

      if (!resolvedMeetingLink) {
        return NextResponse.json(
          {
            message: isWherebyConfigured()
              ? "No pudimos generar la sala automática de Whereby. Ingresa un enlace manual para confirmar."
              : "Agrega el enlace de reunión o instrucciones para conectarse.",
          },
          { status: 400 }
        );
      }
    }

    if (action === "decline" && introSession.status !== "pending") {
      return NextResponse.json(
        { message: "Solo puedes rechazar sesiones pendientes." },
        { status: 400 }
      );
    }

    if (
      action === "cancel" &&
      introSession.status !== "pending" &&
      introSession.status !== "accepted"
    ) {
      return NextResponse.json(
        { message: "Esta sesión ya fue cerrada." },
        { status: 400 }
      );
    }

    const nextStatus =
      action === "accept"
        ? "accepted"
        : action === "decline"
          ? "declined"
          : "cancelled";

    const updated = await prisma.introSession.update({
      where: { id },
      data: {
        status: nextStatus,
        ...(action === "accept"
          ? {
              meetingLink: resolvedMeetingLink,
              hostMeetingLink,
              wherebyMeetingId,
              specialistNote: specialistNote || null,
              specialistTermsAcceptedAt: new Date(),
            }
          : {}),
        ...(action === "decline" && specialistNote
          ? { specialistNote }
          : {}),
      },
    });

    const friendlyDate = formatSessionDate(introSession.scheduledDate);
    const specialistName = formatUserDisplayName(introSession.specialist);
    const specialistAvatar = introSession.specialist?.profile?.avatarUrl || "";
    const requesterName = formatUserDisplayName(introSession.requester);
    const requesterAvatar = introSession.requester?.profile?.avatarUrl || "";

    if (action === "accept") {
      const chatLines = [
        `¡Confirmado! Acepté tu sesión introductoria de 15 min para el ${friendlyDate} a las ${introSession.startTime} (${introSession.timezone}).`,
        `Enlace / acceso: ${resolvedMeetingLink}`,
      ];
      if (specialistNote) {
        chatLines.push(`Nota: "${specialistNote}"`);
      }
      chatLines.push(
        "Recuerda: es una charla inicial para conocernos; LUMINUS facilita la conexión pero no interviene en servicios profesionales posteriores."
      );

      await Promise.allSettled([
        createSessionNotification({
          prisma,
          userId: introSession.requesterId,
          type: "session_accepted",
          title: "Sesión confirmada",
          actorName: specialistName,
          actorAvatarUrl: specialistAvatar,
          body: `confirmó tu sesión introductoria del ${friendlyDate} a las ${introSession.startTime}.`,
          actionUrl: "/sesiones",
        }),
        sendSessionChatMessage({
          prisma,
          senderId: introSession.specialistId,
          recipientId: introSession.requesterId,
          body: chatLines.join("\n\n"),
        }),
        introSession.requester?.email
          ? sendIntroSessionEmail(introSession.requester.email, {
              variant: "accepted_requester",
              recipientName: requesterName,
              counterpartyName: specialistName,
              friendlyDate,
              startTime: introSession.startTime,
              timezone: introSession.timezone,
              meetingLink: resolvedMeetingLink,
              note: specialistNote || undefined,
              actionPath: "/sesiones",
            })
          : Promise.resolve(),
        introSession.specialist?.email
          ? sendIntroSessionEmail(introSession.specialist.email, {
              variant: "accepted_specialist",
              recipientName: specialistName,
              counterpartyName: requesterName,
              friendlyDate,
              startTime: introSession.startTime,
              timezone: introSession.timezone,
              meetingLink: hostMeetingLink || resolvedMeetingLink,
              note: specialistNote || undefined,
              actionPath: "/sesiones?tab=recibidas",
            })
          : Promise.resolve(),
      ]);
    } else if (action === "decline") {
      const chatText = specialistNote
        ? `No podré asistir a la sesión introductoria solicitada para el ${friendlyDate} a las ${introSession.startTime}. Nota: "${specialistNote}"`
        : `No podré asistir a la sesión introductoria solicitada para el ${friendlyDate} a las ${introSession.startTime}. Puedes elegir otro horario disponible en mi perfil.`;

      await Promise.allSettled([
        createSessionNotification({
          prisma,
          userId: introSession.requesterId,
          type: "session_declined",
          title: "Sesión no disponible",
          actorName: specialistName,
          actorAvatarUrl: specialistAvatar,
          body: `no pudo confirmar tu solicitud del ${friendlyDate} a las ${introSession.startTime}.`,
          actionUrl: "/sesiones",
        }),
        sendSessionChatMessage({
          prisma,
          senderId: introSession.specialistId,
          recipientId: introSession.requesterId,
          body: chatText,
        }),
        introSession.requester?.email
          ? sendIntroSessionEmail(introSession.requester.email, {
              variant: "declined_requester",
              recipientName: requesterName,
              counterpartyName: specialistName,
              friendlyDate,
              startTime: introSession.startTime,
              timezone: introSession.timezone,
              note: specialistNote || undefined,
              actionPath: "/especialistas",
            })
          : Promise.resolve(),
      ]);
    } else if (action === "cancel") {
      const targetUserId = isSpecialist
        ? introSession.requesterId
        : introSession.specialistId;
      const targetEmail = isSpecialist
        ? introSession.requester?.email
        : introSession.specialist?.email;
      const targetName = isSpecialist ? requesterName : specialistName;
      const actorName = isSpecialist ? specialistName : requesterName;
      const actorAvatar = isSpecialist ? specialistAvatar : requesterAvatar;

      await Promise.allSettled([
        deleteWherebyRoom(introSession.wherebyMeetingId),
        createSessionNotification({
          prisma,
          userId: targetUserId,
          type: "session_cancelled",
          title: "Sesión cancelada",
          actorName,
          actorAvatarUrl: actorAvatar,
          body: `canceló la sesión introductoria del ${friendlyDate} a las ${introSession.startTime}.`,
          actionUrl: isSpecialist ? "/sesiones" : "/sesiones?tab=recibidas",
        }),
        sendSessionChatMessage({
          prisma,
          senderId: session.userId,
          recipientId: targetUserId,
          body: `Cancelé la sesión introductoria del ${friendlyDate} a las ${introSession.startTime}.`,
        }),
        targetEmail
          ? sendIntroSessionEmail(targetEmail, {
              variant: "cancelled",
              recipientName: targetName,
              counterpartyName: actorName,
              friendlyDate,
              startTime: introSession.startTime,
              timezone: introSession.timezone,
              actionPath: isSpecialist ? "/sesiones" : "/sesiones?tab=recibidas",
            })
          : Promise.resolve(),
      ]);
    }

    return NextResponse.json({ ok: true, session: updated });
  } catch (error) {
    console.error("Failed to update intro session:", error);
    return NextResponse.json(
      { message: "No pudimos actualizar la sesión." },
      { status: 500 }
    );
  }
}
