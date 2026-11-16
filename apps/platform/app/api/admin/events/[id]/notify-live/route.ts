import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { sendBatchEventLiveNotifications } from "@/lib/mails/sender";
import { handleApiError } from "@/lib/errors/server-error";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 });
    }

    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json({ error: "ID de evento no especificado." }, { status: 400 });
    }

    const result = await sendBatchEventLiveNotifications(eventId, 10);

    return NextResponse.json(result);
  } catch (err: unknown) {
    return handleApiError(err, {
      context: "[admin/events/notify-live] POST",
      field: "error",
      message: "Error al enviar la notificación de evento en vivo.",
    });
  }
}
