/**
 * LOCAL EMAIL MARKETING TOOL HELPER
 * 
 * Use this module in your local scripts/tool before sending email campaigns via AWS SES.
 * 
 * Example usage in your local script:
 * 
 * ```ts
 * import { filterUnsubscribedEmails, prepareCampaignEmail } from "./local-unsubscribe-helper";
 * 
 * // 1. Filter target list
 * const recipients = ["user1@example.com", "user2@example.com"];
 * const activeRecipients = await filterUnsubscribedEmails(recipients);
 * 
 * // 2. Build email payload for each recipient
 * for (const email of activeRecipients) {
 *   const { html, sesHeaders } = prepareCampaignEmail({
 *     recipientEmail: email,
 *     htmlContent: "<h1>Hola!</h1><p>Novedades del mes...</p>",
 *   });
 * 
 *   // 3. Send using AWS SES SendEmailCommand
 *   await sesClient.send(new SendEmailCommand({
 *     FromEmailAddress: "info@luminuslatam.com",
 *     Destination: { ToAddresses: [email] },
 *     Content: {
 *       Simple: {
 *         Subject: { Data: "Boletín Informativo" },
 *         Body: { Html: { Data: html } },
 *         Headers: Object.entries(sesHeaders).map(([Name, Value]) => ({ Name, Value })),
 *       }
 *     }
 *   }));
 * }
 * ```
 */

import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SECRET_KEY =
  process.env.UNSUBSCRIBE_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  process.env.JWT_SECRET ||
  "luminus-unsubscribe-secret-key-2026";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function generateUnsubscribeToken(email: string): string {
  const clean = normalizeEmail(email);
  return crypto
    .createHmac("sha256", SECRET_KEY)
    .update(clean)
    .digest("hex")
    .substring(0, 32);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!email || !token) return false;
  const expectedToken = generateUnsubscribeToken(email);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token.trim()),
      Buffer.from(expectedToken)
    );
  } catch {
    return false;
  }
}

export function generateUnsubscribeUrls(email: string): {
  unsubscribeUrl: string;
  apiUrl: string;
  mailtoUrl: string;
} {
  const baseUrl = getBaseUrl();
  const token = generateUnsubscribeToken(email);
  const cleanEmail = normalizeEmail(email);
  const query = `email=${encodeURIComponent(cleanEmail)}&token=${encodeURIComponent(token)}`;

  return {
    unsubscribeUrl: `${baseUrl}/desuscribir?${query}`,
    apiUrl: `${baseUrl}/api/unsubscribe?${query}`,
    mailtoUrl: `mailto:unsubscribe@luminuslatam.com?subject=Unsubscribe%20${encodeURIComponent(cleanEmail)}`,
  };
}

export function getBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.SITE_URL ||
    "https://luminuslatam.com";
  return url.replace(/\/+$/, "");
}

/**
 * Checks database and returns array of emails that are ELIGIBLE to receive marketing emails.
 * Excludes emails found in unsubscribed_emails table OR event_guests with marketingConsent = false.
 */
export async function filterUnsubscribedEmails(emails: string[]): Promise<string[]> {
  if (!emails || emails.length === 0) return [];

  const normalized = emails.map(normalizeEmail);

  // 1. Get explicitly unsubscribed emails
  const unsubscribedRecords = await prisma.unsubscribedEmail.findMany({
    where: { email: { in: normalized } },
    select: { email: true },
  });

  // 2. Get event guests who opted out of marketing
  const optedOutGuests = await prisma.eventGuest.findMany({
    where: {
      email: { in: normalized },
      marketingConsent: false,
    },
    select: { email: true },
  });

  const excludedSet = new Set<string>([
    ...unsubscribedRecords.map((r) => r.email.toLowerCase()),
    ...optedOutGuests.map((g) => g.email.toLowerCase()),
  ]);

  return normalized.filter((email) => !excludedSet.has(email));
}

/**
 * Creates a record in sent_email_logs to enable Open & Click tracking.
 */
export async function createSentEmailRecord(options: {
  recipient: string;
  subject: string;
  htmlBody: string;
  messageId?: string;
  metadata?: any;
}) {
  const log = await prisma.sentEmailLog.create({
    data: {
      recipient: normalizeEmail(options.recipient),
      subject: options.subject,
      htmlBody: options.htmlBody,
      status: "SENT",
      messageId: options.messageId || null,
      metadata: options.metadata ? JSON.stringify(options.metadata) : null,
    },
  });
  return log;
}

/**
 * Injects Open Tracking pixel and rewrites links for Click Tracking.
 */
export function injectAnalyticsTracking(options: {
  htmlContent: string;
  emailLogId: string;
  enableClickTracking?: boolean;
}): string {
  const baseUrl = getBaseUrl();
  let html = options.htmlContent;

  // 1. Inject 1x1 Open Tracking Pixel before </body> or at end
  const pixelUrl = `${baseUrl}/api/track/open?id=${encodeURIComponent(options.emailLogId)}`;
  const pixelHtml = `<img src="${pixelUrl}" width="1" height="1" style="display:none !important; visibility:hidden !important; opacity:0 !important; width:1px; height:1px;" alt="" />`;

  if (html.includes("</body>")) {
    html = html.replace("</body>", `${pixelHtml}</body>`);
  } else {
    html += pixelHtml;
  }

  // 2. Rewrite links for Click Tracking if enabled
  if (options.enableClickTracking !== false) {
    html = html.replace(
      /href=["'](https?:\/\/[^"']+)["']/g,
      (match, originalUrl) => {
        // Skip unsubscribe links from click tracking wrapper
        if (originalUrl.includes("/desuscribir") || originalUrl.includes("/api/unsubscribe")) {
          return match;
        }
        const clickUrl = `${baseUrl}/api/track/click?id=${encodeURIComponent(options.emailLogId)}&url=${encodeURIComponent(originalUrl)}`;
        return `href="${clickUrl}"`;
      }
    );
  }

  return html;
}

/**
 * Prepares HTML content and SES headers for a campaign email to a recipient.
 * Appends the unsubscribe link footer, generates List-Unsubscribe headers,
 * and attaches open/click tracking.
 */
export function prepareCampaignEmail(options: {
  recipientEmail: string;
  htmlContent: string;
  subject?: string;
  brandName?: string;
  emailLogId?: string;
}) {
  const cleanEmail = normalizeEmail(options.recipientEmail);
  const token = generateUnsubscribeToken(cleanEmail);
  const baseUrl = getBaseUrl();
  const brand = options.brandName || "LUMINUS";

  const query = `email=${encodeURIComponent(cleanEmail)}&token=${encodeURIComponent(token)}`;
  const unsubscribeUrl = `${baseUrl}/desuscribir?${query}`;
  const apiUrl = `${baseUrl}/api/unsubscribe?${query}`;

  const footerHtml = `
    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-family: sans-serif; font-size: 12px; color: #64748b; line-height: 1.6;">
      <p style="margin: 0 0 8px 0;">Recibiste este correo de ${brand}.</p>
      <p style="margin: 0;">
        Si deseas dejar de recibir nuestras novedades, puedes 
        <a href="${unsubscribeUrl}" target="_blank" rel="noopener noreferrer" style="color: #475569; text-decoration: underline; font-weight: 500;">
          desuscribirte aquí
        </a>.
      </p>
    </div>
  `;

  // Inject footer before </body> if present, otherwise append
  let finalHtml = options.htmlContent;
  if (finalHtml.includes("</body>")) {
    finalHtml = finalHtml.replace("</body>", `${footerHtml}</body>`);
  } else {
    finalHtml += footerHtml;
  }

  // Inject analytics tracking if emailLogId provided
  if (options.emailLogId) {
    finalHtml = injectAnalyticsTracking({
      htmlContent: finalHtml,
      emailLogId: options.emailLogId,
      enableClickTracking: true,
    });
  }

  const sesHeaders = {
    "List-Unsubscribe": `<${apiUrl}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };

  return {
    recipientEmail: cleanEmail,
    unsubscribeUrl,
    apiUrl,
    html: finalHtml,
    sesHeaders,
  };
}
