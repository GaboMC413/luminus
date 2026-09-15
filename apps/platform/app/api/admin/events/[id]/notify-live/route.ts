import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { sendBatchEventLiveNotifications } from "@/lib/mails/sender";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 });
    }

    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json({ error: "ID de evento no especificado." }, { status: 400 });
    }

    const result = await sendBatchEventLiveNotifications(eventId, 10);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[Notify Live Event Error]:", err.message || err);
    return NextResponse.json(
      { error: err.message || "Error al enviar la notificación de evento en vivo." },
      { status: 500 }
    );
  }
}
