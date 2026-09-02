import { NextResponse } from "next/server";
import { getLocalCampaigns, saveLocalCampaign, getLocalContacts, saveLocalContact } from "@/lib/local-marketing/store";

export async function POST(req: Request) {
  try {
    const textBody = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(textBody);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    // Manejar confirmación de suscripción de Amazon SNS Webhook
    if (body.Type === "SubscriptionConfirmation" && body.SubscribeURL) {
      console.log("[AWS SNS WEBHOOK CONFIRMATION]:", body.SubscribeURL);
      await fetch(body.SubscribeURL);
      return NextResponse.json({ success: true, message: "Subscription confirmed" });
    }

    // Procesar notificación de evento de AWS SES (Delivery, Bounce, Complaint, Open, Click)
    let messageData = body;
    if (body.Type === "Notification" && body.Message) {
      try {
        messageData = JSON.parse(body.Message);
      } catch {
        messageData = body;
      }
    }

    const eventType = messageData.eventType || messageData.notificationType;
    const mail = messageData.mail || {};
    const recipientEmail = mail.destination?.[0] || messageData.bounce?.bouncedRecipients?.[0]?.emailAddress;

    console.log(`[AWS SES EVENT RECEIVED]: Type=${eventType} | Recipient=${recipientEmail}`);

    if (recipientEmail) {
      const contacts = getLocalContacts();
      const contact = contacts.find((c) => c.email.toLowerCase() === recipientEmail.toLowerCase().trim());

      if (eventType === "Bounce" || eventType === "Complaint") {
        if (contact) {
          saveLocalContact({
            ...contact,
            unsubscribed: true,
            tags: Array.from(new Set([...(contact.tags || []), "bounced"])),
          });
        }
      }
    }

    return NextResponse.json({ success: true, eventType, recipientEmail });
  } catch (error: any) {
    console.error("[AWS SES WEBHOOK ERROR]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Webhook processing error" }, { status: 500 });
  }
}
