import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import { getSesV2Client } from "../mails/sesClient";
import {
  getLocalContacts,
  getLocalCampaignById,
  getLocalAudienceById,
  saveLocalCampaign,
  addLocalSendLog,
  LocalContact,
} from "./store";

export function renderTemplateVariables(
  template: string,
  recipient: { email: string; firstName?: string; lastName?: string }
): string {
  const firstName = recipient.firstName || "Suscriptor";
  const lastName = recipient.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const email = recipient.email;
  const unsubscribeUrl = `http://localhost:3000/api/admin/email-marketing/unsubscribe?email=${encodeURIComponent(
    email
  )}`;

  return template
    .replace(/\{\{\s*nombre\s*\}\}/gi, firstName)
    .replace(/\{\{\s*firstName\s*\}\}/gi, firstName)
    .replace(/\{\{\s*apellido\s*\}\}/gi, lastName)
    .replace(/\{\{\s*lastName\s*\}\}/gi, lastName)
    .replace(/\{\{\s*nombre_completo\s*\}\}/gi, fullName)
    .replace(/\{\{\s*fullName\s*\}\}/gi, fullName)
    .replace(/\{\{\s*email\s*\}\}/gi, email)
    .replace(/\{\{\s*link_desuscripcion\s*\}\}/gi, unsubscribeUrl)
    .replace(/\{\{\s*unsubscribeUrl\s*\}\}/gi, unsubscribeUrl);
}

function formatSenderAddress(email: string, name: string): string {
  const cleanEmail = email.trim();
  if (cleanEmail.includes("<") && cleanEmail.includes(">")) {
    return cleanEmail;
  }
  const cleanName = name.trim() || "LUMINUS";
  return `"${cleanName}" <${cleanEmail}>`;
}

export async function sendSingleTestEmail(params: {
  toEmail: string;
  subject: string;
  fromEmail: string;
  fromName: string;
  htmlContent: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const sesClient = getSesV2Client();
    const formattedSender = formatSenderAddress(params.fromEmail, params.fromName);

    const renderedHtml = renderTemplateVariables(params.htmlContent, {
      email: params.toEmail,
      firstName: "Usuario de Prueba",
      lastName: "Local",
    });

    const command = new SendEmailCommand({
      FromEmailAddress: formattedSender,
      Destination: { ToAddresses: [params.toEmail] },
      Content: {
        Simple: {
          Subject: { Data: `[PRUEBA LOCAL] ${params.subject}`, Charset: "UTF-8" },
          Body: {
            Html: { Data: renderedHtml, Charset: "UTF-8" },
          },
        },
      },
    });

    const response = await sesClient.send(command);
    return { success: true, messageId: response.MessageId };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error("[LOCAL EMAIL MARKETING TEST ERROR]:", err);
    return { success: false, error: errorMsg };
  }
}

export function injectTracking(html: string, logId: string, baseUrl: string = "http://localhost:3000"): string {
  if (!logId) return html;

  // 1. Rewrite <a href="..."> links (avoiding tracking/unsubscribe routes)
  const trackedHtml = html.replace(/<a\s+(?:[^>]*?\s+)?href=["'](https?:\/\/[^"']+)["']/gi, (match, originalUrl) => {
    if (originalUrl.includes("/track/") || originalUrl.includes("/unsubscribe")) {
      return match;
    }
    const trackingUrl = `${baseUrl}/api/admin/email-marketing/track/click?logId=${encodeURIComponent(
      logId
    )}&url=${encodeURIComponent(originalUrl)}`;
    return match.replace(originalUrl, trackingUrl);
  });

  // 2. Inject 1x1 open tracking pixel
  const pixelHtml = `<img src="${baseUrl}/api/admin/email-marketing/track/open?logId=${encodeURIComponent(
    logId
  )}" width="1" height="1" style="display:none;width:1px;height:1px;border:0;" alt="" />`;

  if (trackedHtml.includes("</body>")) {
    return trackedHtml.replace("</body>", `${pixelHtml}</body>`);
  }
  return `${trackedHtml}${pixelHtml}`;
}

export async function executeCampaignBatchSend(
  campaignId: string,
  options?: { delayMs?: number }
): Promise<{ success: boolean; sent: number; failed: number; total: number }> {
  const campaign = getLocalCampaignById(campaignId);
  if (!campaign) {
    throw new Error(`Campaign with ID ${campaignId} not found.`);
  }

  const allContacts = getLocalContacts();
  // Filtrar destinatarios activos (no desuscritos)
  let recipients = allContacts.filter((c) => !c.unsubscribed && c.email.includes("@"));

  // Filtrar por Audiencia si la campaña especifica audienceId
  if (campaign.audienceId && campaign.audienceId !== "aud_all") {
    const audience = getLocalAudienceById(campaign.audienceId);
    if (audience) {
      if (audience.countryFilter) {
        recipients = recipients.filter((c) => c.country?.toLowerCase() === audience.countryFilter?.toLowerCase());
      }
      if (audience.sourceFilter) {
        recipients = recipients.filter((c) => c.source?.toLowerCase() === audience.sourceFilter?.toLowerCase());
      }
      if (audience.tagFilter) {
        recipients = recipients.filter((c) => c.tags.includes(audience.tagFilter!));
      }
      if (audience.professionFilter) {
        recipients = recipients.filter((c) => c.profession?.toLowerCase() === audience.professionFilter?.toLowerCase());
      }
    }
  } else if (campaign.targetTags && campaign.targetTags.length > 0) {
    recipients = recipients.filter((c) =>
      c.tags.some((tag) => campaign.targetTags.includes(tag))
    );
  }

  if (recipients.length === 0) {
    saveLocalCampaign({
      id: campaign.id,
      subject: campaign.subject,
      fromEmail: campaign.fromEmail,
      fromName: campaign.fromName,
      htmlContent: campaign.htmlContent,
      targetTags: campaign.targetTags,
      status: "COMPLETED",
      totalRecipients: 0,
      sentCount: 0,
      failedCount: 0,
    });
    return { success: true, sent: 0, failed: 0, total: 0 };
  }

  // Actualizar estado a SENDING
  saveLocalCampaign({
    id: campaign.id,
    subject: campaign.subject,
    fromEmail: campaign.fromEmail,
    fromName: campaign.fromName,
    htmlContent: campaign.htmlContent,
    targetTags: campaign.targetTags,
    status: "SENDING",
    totalRecipients: recipients.length,
    sentCount: 0,
    failedCount: 0,
  });

  const sesClient = getSesV2Client();
  const formattedSender = formatSenderAddress(campaign.fromEmail, campaign.fromName);
  const delayBetweenEmailsMs = options?.delayMs || 250; // 4 emails por segundo por defecto para seguridad

  let sentCount = 0;
  let failedCount = 0;

  for (let i = 0; i < recipients.length; i++) {
    const contact = recipients[i];
    const renderedHtml = renderTemplateVariables(campaign.htmlContent, contact);
    const renderedSubject = renderTemplateVariables(campaign.subject, contact);

    // Crear registro de log inicial para obtener el ID de trazabilidad
    const log = addLocalSendLog({
      campaignId: campaign.id,
      recipientEmail: contact.email,
      recipientName: `${contact.firstName} ${contact.lastName}`.trim(),
      status: "SUCCESS",
    });

    const trackedHtml = injectTracking(renderedHtml, log.id);

    try {
      const command = new SendEmailCommand({
        FromEmailAddress: formattedSender,
        Destination: { ToAddresses: [contact.email] },
        Content: {
          Simple: {
            Subject: { Data: renderedSubject, Charset: "UTF-8" },
            Body: {
              Html: { Data: trackedHtml, Charset: "UTF-8" },
            },
          },
        },
      });

      const res = await sesClient.send(command);
      sentCount++;
      log.messageId = res.MessageId;
    } catch (err: any) {
      failedCount++;
      const errorMsg = err?.message || String(err);
      console.error(`[LOCAL CAMPAIGN SEND ERROR] Email: ${contact.email}:`, errorMsg);
      log.status = "FAILED";
      log.error = errorMsg;
    }

    // Actualizar progreso parcial en la campaña
    saveLocalCampaign({
      id: campaign.id,
      subject: campaign.subject,
      fromEmail: campaign.fromEmail,
      fromName: campaign.fromName,
      htmlContent: campaign.htmlContent,
      targetTags: campaign.targetTags,
      status: "SENDING",
      totalRecipients: recipients.length,
      sentCount,
      failedCount,
    });

    // Retardo pequeño entre envíos
    if (i < recipients.length - 1 && delayBetweenEmailsMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenEmailsMs));
    }
  }

  // Marcar campaña como COMPLETADA
  saveLocalCampaign({
    id: campaign.id,
    subject: campaign.subject,
    fromEmail: campaign.fromEmail,
    fromName: campaign.fromName,
    htmlContent: campaign.htmlContent,
    targetTags: campaign.targetTags,
    status: "COMPLETED",
    totalRecipients: recipients.length,
    sentCount,
    failedCount,
  });

  return { success: true, sent: sentCount, failed: failedCount, total: recipients.length };
}
