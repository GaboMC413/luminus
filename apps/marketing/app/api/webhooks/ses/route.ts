import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return NextResponse.json({ ok: false, error: "Cuerpo vacío." }, { status: 400 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400 });
    }

    // 1. AWS SNS Subscription Confirmation (Auto-confirm endpoint)
    if (payload.Type === "SubscriptionConfirmation" && payload.SubscribeURL) {
      console.log("[AWS SES Webhook] Auto-confirming SNS Subscription:", payload.SubscribeURL);
      try {
        await fetch(payload.SubscribeURL);
      } catch (err) {
        console.error("[AWS SES Webhook] Failed to confirm SubscribeURL:", err);
      }
      return NextResponse.json({ ok: true, message: "Subscription confirmed." });
    }

    // 2. AWS SES Event Notifications
    if (payload.Type === "Notification" && payload.Message) {
      let messageObj: any = payload.Message;
      if (typeof messageObj === "string") {
        try {
          messageObj = JSON.parse(messageObj);
        } catch {
          // message string
        }
      }

      const eventType = messageObj?.eventType || messageObj?.notificationType;
      const mail = messageObj?.mail;
      const messageId = mail?.messageId;

      if (!eventType) {
        return NextResponse.json({ ok: true, message: "Ignored (no eventType)." });
      }

      // Handle BOUNCE
      if (eventType === "Bounce" || eventType === "bounce") {
        const bounce = messageObj.bounce;
        const bounceType = bounce?.bounceType || "Permanent";
        const recipients = (bounce?.bouncedRecipients || []).map((r: any) => r.emailAddress?.toLowerCase()).filter(Boolean);

        if (messageId) {
          await prisma.sentEmailLog.updateMany({
            where: { messageId },
            data: { status: "BOUNCED", bounceType },
          });
        }

        // If permanent bounce, add to unsubscribed_emails & opt-out
        for (const email of recipients) {
          if (email) {
            await prisma.unsubscribedEmail.upsert({
              where: { email },
              create: { email, reason: `AWS SES ${bounceType} Bounce`, source: "ses_bounce" },
              update: { reason: `AWS SES ${bounceType} Bounce` },
            });
            await prisma.eventGuest.updateMany({
              where: { email },
              data: { marketingConsent: false },
            });
          }
        }
      }

      // Handle COMPLAINT (Spam report)
      if (eventType === "Complaint" || eventType === "complaint") {
        const complaint = messageObj.complaint;
        const recipients = (complaint?.complainedRecipients || []).map((r: any) => r.emailAddress?.toLowerCase()).filter(Boolean);

        if (messageId) {
          await prisma.sentEmailLog.updateMany({
            where: { messageId },
            data: { status: "COMPLAINT" },
          });
        }

        for (const email of recipients) {
          if (email) {
            await prisma.unsubscribedEmail.upsert({
              where: { email },
              create: { email, reason: "AWS SES Spam Complaint", source: "ses_complaint" },
              update: { reason: "AWS SES Spam Complaint" },
            });
            await prisma.eventGuest.updateMany({
              where: { email },
              data: { marketingConsent: false },
            });
          }
        }
      }

      // Handle DELIVERY
      if (eventType === "Delivery" || eventType === "delivery") {
        if (messageId) {
          await prisma.sentEmailLog.updateMany({
            where: { messageId, status: "SUCCESS" },
            data: { status: "DELIVERED" },
          });
        }
      }

      return NextResponse.json({ ok: true, eventType, messageId });
    }

    return NextResponse.json({ ok: true, message: "Webhook received." });
  } catch (error: any) {
    console.error("[AWS SES Webhook Error]:", error);
    return NextResponse.json({ ok: false, error: "Error procesando webhook de SES." }, { status: 500 });
  }
}
