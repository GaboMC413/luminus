import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { isUuid } from "@/utils/validation";
import { sanitizeMessageBody } from "@/utils/sanitization";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = getCurrentSession();

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const conversationId = typeof body?.conversationId === "string" ? body.conversationId.trim() : "";
    const rawMessageBody = typeof body?.body === "string" ? body.body : "";
    const messageBody = sanitizeMessageBody(rawMessageBody);

    if (!conversationId || !isUuid(conversationId)) {
      return NextResponse.json({ message: "Conversacion invalida." }, { status: 400 });
    }

    if (!messageBody) {
      return NextResponse.json({ message: "El mensaje no puede estar vacio." }, { status: 400 });
    }


    // 1. Get the official LUMINUS system account
    const SYSTEM_EMAIL = "info@luminuslatam.com";
    const systemUser = await prisma.user.findUnique({
      where: { email: SYSTEM_EMAIL },
    });

    if (!systemUser) {
      return NextResponse.json({ message: "Luminus system account not found." }, { status: 404 });
    }

    // 2. Create message sent by LUMINUS system user
    const message = await prisma.$transaction(async (tx: any) => {
      const created = await tx.message.create({
        data: {
          conversationId,
          senderId: systemUser.id,
          body: messageBody,
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      // Clear deletedAt for all participants to ensure the message shows up
      await tx.conversationParticipant.updateMany({
        where: { conversationId },
        data: { deletedAt: null },
      });

      return created;
    });

    return NextResponse.json({
      message: {
        id: message.id,
        conversation_id: message.conversationId,
        sender_id: message.senderId,
        body: message.body,
        created_at: message.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to send admin support message.", error);
    return NextResponse.json({ message: "No se pudo enviar el mensaje de soporte." }, { status: 500 });
  }
}
