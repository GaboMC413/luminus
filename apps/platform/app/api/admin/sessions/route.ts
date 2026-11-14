import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { listAdminIntroSessions, serializeAdminIntroSession } from "@/lib/admin/sessions";
import { isUuid } from "@/utils/validation";
import { deleteWherebyRoom } from "@/lib/sessions/whereby";
import { createSessionNotification } from "@/lib/sessions/sessionNotifications";
import { formatSessionDate } from "@/lib/sessions/sessionAvailability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getCurrentSession();
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: "No autorizado." }, { status: 401 }),
    };
  }
  if (session.role !== "ADMIN") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "No tienes permisos de administrador." },
        { status: 403 }
      ),
    };
  }
  return { ok: true as const, session };
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const { prisma } = await import("@/lib/db");
    const sessions = await listAdminIntroSessions(prisma);
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("[admin/sessions] GET error:", error);
    return NextResponse.json(
      { message: "No pudimos cargar las sesiones introductorias." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  const action = typeof body?.action === "string" ? body.action.trim() : "";

  if (!isUuid(id)) {
    return NextResponse.json({ message: "Sesión inválida." }, { status: 400 });
  }
  if (action !== "cancel") {
    return NextResponse.json({ message: "Acción no válida." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const existing = await prisma.introSession.findUnique({
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
      },
    });

    if (!existing) {
      return NextResponse.json({ message: "Sesión no encontrada." }, { status: 404 });
    }

    if (existing.status !== "pending" && existing.status !== "accepted") {
      return NextResponse.json(
        { message: "Esta sesión ya se encuentra cerrada." },
        { status: 400 }
      );
    }

    const updated = await prisma.introSession.update({
      where: { id },
      data: { status: "cancelled" },
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
      },
    });

    const friendlyDate = formatSessionDate(existing.scheduledDate);

    await Promise.allSettled([
      deleteWherebyRoom(existing.wherebyMeetingId),
      createSessionNotification({
        prisma,
        userId: existing.requesterId,
        type: "session_cancelled",
        title: "Sesión cancelada",
        actorName: "Equipo LUMINUS",
        actorAvatarUrl: "",
        body: `Se canceló la sesión del ${friendlyDate} (${existing.startTime} hs).`,
        actionUrl: "/sesiones",
      }),
      createSessionNotification({
        prisma,
        userId: existing.specialistId,
        type: "session_cancelled",
        title: "Sesión cancelada",
        actorName: "Equipo LUMINUS",
        actorAvatarUrl: "",
        body: `Se canceló la sesión del ${friendlyDate} (${existing.startTime} hs).`,
        actionUrl: "/sesiones?tab=recibidas",
      }),
    ]);

    return NextResponse.json({
      session: serializeAdminIntroSession(updated),
    });
  } catch (error) {
    console.error("[admin/sessions] PATCH error:", error);
    return NextResponse.json(
      { message: "No pudimos cancelar la sesión." },
      { status: 500 }
    );
  }
}
