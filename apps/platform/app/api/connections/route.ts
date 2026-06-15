import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function serializeConnection(connection: any, currentUserId: string) {
  const otherUser =
    connection.requesterId === currentUserId ? connection.recipient : connection.requester;
  const profile = otherUser?.profile ?? {};
  const fullName = profile.fullName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

  return {
    id: connection.id,
    status: connection.status,
    direction: connection.requesterId === currentUserId ? "outgoing" : "incoming",
    user: {
      id: otherUser.id,
      name: fullName || "Usuario sin nombre",
      avatar: profile.avatarUrl || "",
      profession: profile.profession || "",
      location: `${profile.city || ""}, ${profile.country || ""}`.replace(/^,\s*|,\s*$/, "").trim(),
    },
    created_at: connection.createdAt?.toISOString?.() ?? "",
    updated_at: connection.updatedAt?.toISOString?.() ?? "",
  };
}

export async function GET() {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const connections = await prisma.userConnection.findMany({
      where: {
        OR: [
          { requesterId: session.userId },
          { recipientId: session.userId },
        ],
      },
      include: {
        requester: { include: { profile: true } },
        recipient: { include: { profile: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      connections: connections.map((connection: any) => serializeConnection(connection, session.userId)),
    });
  } catch (error) {
    console.error("Connections read failed.", error);
    return NextResponse.json({ message: "No pudimos cargar tus conexiones." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const recipientId = typeof body?.recipientId === "string" ? body.recipientId.trim() : "";

  if (!recipientId || !isUuid(recipientId)) {
    return NextResponse.json({ message: "Usuario destino invalido." }, { status: 400 });
  }

  if (recipientId === session.userId) {
    return NextResponse.json({ message: "No puedes conectarte contigo mismo." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, status: true },
    });

    if (!recipient || recipient.status !== "active") {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    const existingConnection = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: session.userId, recipientId },
          { requesterId: recipientId, recipientId: session.userId },
        ],
      },
    });

    if (existingConnection) {
      return NextResponse.json({
        success: true,
        connection: {
          id: existingConnection.id,
          status: existingConnection.status,
          direction: existingConnection.requesterId === session.userId ? "outgoing" : "incoming",
        },
        message: "La conexion ya existe.",
      });
    }

    const connection = await prisma.userConnection.create({
      data: {
        requesterId: session.userId,
        recipientId,
        status: "pending",
      },
    });

    const newlyCompletedQuests = [];
    try {
      const { checkAndTriggerQuestCompletion } = await import("@/lib/onboarding");
      const r = await checkAndTriggerQuestCompletion(session.userId, "connect");
      if (r) newlyCompletedQuests.push(r);
    } catch (questError) {
      console.error("Failed to check onboarding connect quest completion:", questError);
    }

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        status: connection.status,
        direction: "outgoing",
      },
      message: "Solicitud de conexion enviada.",
      newlyCompletedQuests,
    });
  } catch (error) {
    console.error("Connection request failed.", error);
    return NextResponse.json({ message: "No pudimos enviar la solicitud de conexion." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const requesterId = typeof body?.recipientId === "string" ? body.recipientId.trim() : "";

  if (!requesterId || !isUuid(requesterId)) {
    return NextResponse.json({ message: "Usuario origen invalido." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const connection = await prisma.userConnection.findFirst({
      where: {
        requesterId,
        recipientId: session.userId,
        status: "pending",
      },
    });

    if (!connection) {
      return NextResponse.json({ message: "No se encontró ninguna solicitud de conexión pendiente." }, { status: 404 });
    }

    const updated = await prisma.userConnection.update({
      where: { id: connection.id },
      data: { status: "accepted" },
    });

    const newlyCompletedQuests = [];
    try {
      const { checkAndTriggerQuestCompletion } = await import("@/lib/onboarding");
      const r = await checkAndTriggerQuestCompletion(session.userId, "connect");
      if (r) newlyCompletedQuests.push(r);
    } catch (questError) {
      console.error("Failed to check onboarding connect quest completion:", questError);
    }

    return NextResponse.json({
      success: true,
      connection: {
        id: updated.id,
        status: updated.status,
        direction: "incoming",
      },
      message: "Solicitud de conexión aceptada.",
      newlyCompletedQuests,
    });
  } catch (error) {
    console.error("Accept connection failed.", error);
    return NextResponse.json({ message: "No pudimos aceptar la solicitud de conexión." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let targetId = searchParams.get("recipientId") || "";

  if (!targetId) {
    const body = await request.json().catch(() => null);
    targetId = typeof body?.recipientId === "string" ? body.recipientId.trim() : "";
  }

  if (!targetId || !isUuid(targetId)) {
    return NextResponse.json({ message: "Usuario de destino inválido." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const connection = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: session.userId, recipientId: targetId },
          { requesterId: targetId, recipientId: session.userId },
        ],
      },
    });

    if (!connection) {
      return NextResponse.json({ message: "No existe ninguna conexión activa o pendiente." }, { status: 404 });
    }

    await prisma.userConnection.delete({
      where: { id: connection.id },
    });

    return NextResponse.json({
      success: true,
      message: "Conexión eliminada/cancelada con éxito.",
    });
  } catch (error) {
    console.error("Delete connection failed.", error);
    return NextResponse.json({ message: "No pudimos eliminar la conexión." }, { status: 500 });
  }
}
