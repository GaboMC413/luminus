import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const certCache = new Map<string, { cert: string; expires: number }>();

function isValidSnsHost(hostname: string): boolean {
  return /^sns\.[a-zA-Z0-9-]+\.amazonaws\.com$/.test(hostname);
}

async function getSnsCertificate(certUrl: string): Promise<string | null> {
  try {
    const parsed = new URL(certUrl);
    if (parsed.protocol !== "https:" || !isValidSnsHost(parsed.hostname) || !parsed.pathname.endsWith(".pem")) {
      console.error("[AWS SES Webhook] Invalid SigningCertURL:", certUrl);
      return null;
    }

    const cached = certCache.get(certUrl);
    if (cached && cached.expires > Date.now()) {
      return cached.cert;
    }

    const res = await fetch(certUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      console.error("[AWS SES Webhook] Failed to fetch certificate from AWS SNS:", res.status);
      return null;
    }

    const cert = await res.text();
    // Cache for 1 hour
    certCache.set(certUrl, { cert, expires: Date.now() + 60 * 60 * 1000 });
    return cert;
  } catch (err) {
    console.error("[AWS SES Webhook] Error fetching SNS cert:", err);
    return null;
  }
}

function buildCanonicalSnsString(payload: Record<string, any>): string {
  if (payload.Type === "Notification") {
    const fields = ["Message", "MessageId"];
    if (payload.Subject !== undefined) fields.push("Subject");
    fields.push("Timestamp", "TopicArn", "Type");
    return fields.reduce((acc, f) => acc + `${f}\n${payload[f]}\n`, "");
  }

  if (payload.Type === "SubscriptionConfirmation" || payload.Type === "UnsubscribeConfirmation") {
    const fields = ["Message", "MessageId", "SubscribeURL", "Timestamp", "Token", "TopicArn", "Type"];
    return fields.reduce((acc, f) => acc + `${f}\n${payload[f]}\n`, "");
  }

  return "";
}

async function verifySnsSignature(payload: Record<string, any>): Promise<boolean> {
  if (process.env.NODE_ENV !== "production" && process.env.SKIP_SNS_VALIDATION === "true") {
    return true;
  }

  if (!payload.SigningCertURL || !payload.Signature) {
    return false;
  }

  // Verify TopicArn if configured
  const expectedTopicArn = process.env.AWS_SNS_SES_TOPIC_ARN;
  if (expectedTopicArn && payload.TopicArn !== expectedTopicArn) {
    console.error("[AWS SES Webhook] TopicArn mismatch:", payload.TopicArn);
    return false;
  }

  const cert = await getSnsCertificate(payload.SigningCertURL);
  if (!cert) return false;

  const canonicalString = buildCanonicalSnsString(payload);
  if (!canonicalString) return false;

  try {
    const verifier = crypto.createVerify(
      payload.SignatureVersion === "2" ? "RSA-SHA256" : "RSA-SHA1"
    );
    verifier.update(canonicalString, "utf8");
    return verifier.verify(cert, payload.Signature, "base64");
  } catch (err) {
    console.error("[AWS SES Webhook] Cryptographic verification failed:", err);
    return false;
  }
}

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

    // Cryptographic validation of incoming SNS webhook
    const isAuthentic = await verifySnsSignature(payload);
    if (!isAuthentic) {
      return NextResponse.json({ ok: false, error: "Firma SNS no válida." }, { status: 403 });
    }

    // 1. AWS SNS Subscription Confirmation (Auto-confirm endpoint)
    if (payload.Type === "SubscriptionConfirmation" && payload.SubscribeURL) {
      const subscribeUrl = new URL(payload.SubscribeURL);
      if (subscribeUrl.protocol !== "https:" || !isValidSnsHost(subscribeUrl.hostname)) {
        return NextResponse.json({ ok: false, error: "SubscribeURL no permitida." }, { status: 400 });
      }

      console.log("[AWS SES Webhook] Auto-confirming SNS Subscription:", payload.SubscribeURL);
      try {
        await fetch(payload.SubscribeURL, { signal: AbortSignal.timeout(6000) });
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
