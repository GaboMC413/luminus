import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import { getSesV2Client } from "../mails/sesClient";
import { prisma } from "../db";
import {
  getLocalContacts,
  getLocalCampaignById,
  getLocalAudienceById,
  saveLocalCampaign,
  addLocalSendLog,
  getLocalSendLogs,
  LocalContact,
} from "./store";

import {
  generateUnsubscribeToken,
  generateUnsubscribeUrls,
  getBaseUrl,
} from "../../scripts/local-unsubscribe-helper";

export function renderTemplateVariables(
  template: string,
  recipient: { email: string; firstName?: string; lastName?: string }
): string {
  const rawFirstName = (recipient.firstName || "").trim();
  const rawLastName = (recipient.lastName || "").trim();

  const isGeneric =
    rawFirstName.toLowerCase() === "suscriptor" ||
    rawFirstName.toLowerCase() === "contacto" ||
    rawFirstName.toLowerCase() === "usuario";
  const hasFirstName = rawFirstName.length > 0 && !isGeneric;

  const firstName = hasFirstName ? rawFirstName : "";
  const lastName = rawLastName;
  const fullName = hasFirstName ? `${firstName} ${lastName}`.trim() : "";
  const email = recipient.email;

  const baseUrl = getBaseUrl();
  const token = generateUnsubscribeToken(email);
  const unsubscribeUrl = `${baseUrl}/desuscribir?email=${encodeURIComponent(
    email
  )}&token=${encodeURIComponent(token)}`;

  let result = template;

  if (hasFirstName) {
    result = result
      .replace(/\{\{\s*nombre\s*\}\}/gi, firstName)
      .replace(/\{\{\s*firstName\s*\}\}/gi, firstName)
      .replace(/\{\{\s*nombre_completo\s*\}\}/gi, fullName)
      .replace(/\{\{\s*fullName\s*\}\}/gi, fullName);
  } else {
    // Si no hay nombre: "Hola {{nombre}}," -> "Hola," | "¡Hola {{nombre}}!" -> "¡Hola!"
    result = result
      .replace(/Hola\s+\{\{\s*(?:nombre|firstName)\s*\}\}\s*,/gi, "Hola,")
      .replace(/Hola\s+\{\{\s*(?:nombre|firstName)\s*\}\}/gi, "Hola")
      .replace(/¡Hola\s+\{\{\s*(?:nombre|firstName)\s*\}\}!/gi, "¡Hola!")
      .replace(/\{\{\s*nombre\s*\}\}/gi, "")
      .replace(/\{\{\s*firstName\s*\}\}/gi, "")
      .replace(/\{\{\s*nombre_completo\s*\}\}/gi, "")
      .replace(/\{\{\s*fullName\s*\}\}/gi, "");
  }

  return result
    .replace(/\{\{\s*apellido\s*\}\}/gi, lastName)
    .replace(/\{\{\s*lastName\s*\}\}/gi, lastName)
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
  campaignId?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const sesClient = getSesV2Client();
    const formattedSender = formatSenderAddress(params.fromEmail, params.fromName);

    // Parsear y validar correos separados por comas o espacios
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const rawEmails = params.toEmail.split(/[,;\s]+/).map((e) => e.trim()).filter(Boolean);
    const validEmails = rawEmails.filter((e) => emailRegex.test(e));

    if (validEmails.length === 0) {
      return {
        success: false,
        error: "Por favor ingresa una dirección de correo válida (ejemplo: usuario@dominio.com)",
      };
    }

    const configurationSet = process.env.SES_CONFIGURATION_MARKETING || "luminus-marketing";
    const messageIds: string[] = [];

    for (const email of validEmails) {
      const renderedHtml = renderTemplateVariables(params.htmlContent, {
        email,
        firstName: "Usuario de Prueba",
        lastName: "Local",
      });

      // Registrar log de envío para obtener ID de trazabilidad de píxeles y clics
      const log = addLocalSendLog({
        campaignId: params.campaignId || "cmp_test_preview",
        recipientEmail: email,
        recipientName: "Usuario de Prueba",
        status: "SUCCESS",
      });

      const trackedHtml = injectTracking(renderedHtml, log.id);
      const { apiUrl, mailtoUrl } = generateUnsubscribeUrls(email);

      const command = new SendEmailCommand({
        FromEmailAddress: formattedSender,
        Destination: { ToAddresses: [email] },
        Content: {
          Simple: {
            Subject: { Data: `[PRUEBA LOCAL] ${params.subject}`, Charset: "UTF-8" },
            Body: {
              Html: { Data: trackedHtml, Charset: "UTF-8" },
            },
            Headers: [
              { Name: "List-Unsubscribe", Value: `<${apiUrl}>, <${mailtoUrl}>` },
              { Name: "List-Unsubscribe-Post", Value: "List-Unsubscribe=One-Click" },
            ],
          },
        },
        ...(configurationSet && { ConfigurationSetName: configurationSet }),
      });

      const response = await sesClient.send(command);
      if (response.MessageId) {
        messageIds.push(response.MessageId);
      }

      // Sincronizar log en la base de datos de PostgreSQL para trazabilidad de aperturas/clics
      try {
        await prisma.sentEmailLog.create({
          data: {
            id: log.id,
            recipient: email,
            subject: `[PRUEBA LOCAL] ${params.subject}`,
            htmlBody: trackedHtml,
            status: "SUCCESS",
            messageId: response.MessageId || null,
          },
        });
      } catch (dbErr) {
        console.warn("[Test Email Send] PostgreSQL DB log sync warning:", dbErr);
      }
    }

    return { success: true, messageId: messageIds.join(", ") };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error("[LOCAL EMAIL MARKETING TEST ERROR]:", err);
    return { success: false, error: errorMsg };
  }
}

export function injectTracking(html: string, logId: string): string {
  if (!logId) return html;
  const baseUrl = getBaseUrl();

  // 1. Reescribir enlaces para rastreo de clicks
  let trackedHtml = html;
  if (process.env.ENABLE_LINK_TRACKING !== "false") {
    trackedHtml = html.replace(/<a\s+(?:[^>]*?\s+)?href=["'](https?:\/\/[^"']+)["']/gi, (match, originalUrl) => {
      if (
        originalUrl.includes("/track/") ||
        originalUrl.includes("/unsubscribe") ||
        originalUrl.includes("/desuscribir")
      ) {
        return match;
      }
      const trackingUrl = `${baseUrl}/api/track/click?id=${encodeURIComponent(
        logId
      )}&url=${encodeURIComponent(originalUrl)}`;
      return match.replace(originalUrl, trackingUrl);
    });
  }

  // 2. Inyectar píxel 1x1 para rastrear apertura
  const pixelHtml = `<img src="${baseUrl}/api/track/open?id=${encodeURIComponent(
    logId
  )}" width="1" height="1" style="display:none;width:1px;height:1px;border:0;" alt="" />`;

  if (trackedHtml.includes("</body>")) {
    return trackedHtml.replace("</body>", `${pixelHtml}</body>`);
  }
  return `${trackedHtml}${pixelHtml}`;
}

export async function executeCampaignBatchSend(
  campaignId: string,
  options?: {
    delayMs?: number;
    onProgress?: (info: {
      sent: number;
      failed: number;
      total: number;
      percentage: number;
      currentEmail: string;
      status: "SUCCESS" | "FAILED" | "SKIPPED";
      error?: string;
    }) => void;
  }
): Promise<{ success: boolean; sent: number; failed: number; total: number }> {
  const campaign = getLocalCampaignById(campaignId);
  if (!campaign) {
    throw new Error(`Campaign with ID ${campaignId} not found.`);
  }

  const allContacts = getLocalContacts();
  // Filtrar destinatarios activos (excluir desuscritos y rebotados)
  let recipients = allContacts.filter(
    (c) => (c.status ? c.status === "ACTIVE" : !c.unsubscribed && !c.bounced) && c.email.includes("@")
  );

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
  const delayBetweenEmailsMs = options?.delayMs !== undefined ? options.delayMs : 100;
  const configurationSet = process.env.SES_CONFIGURATION_MARKETING || "luminus-marketing";

  let sentCount = 0;
  let failedCount = 0;

  const { generateUnsubscribeUrls, filterUnsubscribedEmails } = await import(
    "../../scripts/local-unsubscribe-helper"
  );

  // Filter out emails unsubscribed in PostgreSQL database
  const eligibleEmails = new Set(
    await filterUnsubscribedEmails(recipients.map((r) => r.email))
  );
  recipients = recipients.filter((c) => eligibleEmails.has(c.email.toLowerCase().trim()));

  // 1. DEDUPLICACIÓN ESTRICTA: Garantizar que cada email aparezca una sola vez en la lista de destinatarios
  const seenEmails = new Set<string>();
  const uniqueRecipients: typeof recipients = [];
  for (const c of recipients) {
    const normalized = c.email.toLowerCase().trim();
    if (!seenEmails.has(normalized)) {
      seenEmails.add(normalized);
      uniqueRecipients.push(c);
    }
  }
  recipients = uniqueRecipients;

  // 2. Evitar re-envíos duplicados: excluir contactos que ya recibieron esta campaña con éxito
  const existingLogs = getLocalSendLogs(campaign.id);
  const alreadyDeliveredSet = new Set(
    existingLogs
      .filter((l) => l.status === "SUCCESS")
      .map((l) => l.recipientEmail.toLowerCase().trim())
  );

  for (let i = 0; i < recipients.length; i++) {
    const contact = recipients[i];
    const normalizedEmail = contact.email.toLowerCase().trim();

    if (alreadyDeliveredSet.has(normalizedEmail)) {
      sentCount++;
      continue;
    }

    // Registrar en el set inmediatamente para evitar cualquier duplicado en la misma sesión
    alreadyDeliveredSet.add(normalizedEmail);

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
    const { apiUrl } = generateUnsubscribeUrls(contact.email);

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
            Headers: [
              { Name: "List-Unsubscribe", Value: `<${apiUrl}>` },
              { Name: "List-Unsubscribe-Post", Value: "List-Unsubscribe=One-Click" },
            ],
          },
        },
        ...(configurationSet && { ConfigurationSetName: configurationSet }),
      });

      const res = await sesClient.send(command);
      sentCount++;
      log.messageId = res.MessageId;

      try {
        await prisma.sentEmailLog.create({
          data: {
            id: log.id,
            recipient: contact.email,
            subject: renderedSubject,
            htmlBody: trackedHtml,
            status: "SUCCESS",
            messageId: res.MessageId || null,
          },
        });
      } catch (dbErr) {
        // Silently catch duplicate or db connection warning
      }
    } catch (err: any) {
      failedCount++;
      const errorMsg = err?.message || String(err);
      console.error(`[LOCAL CAMPAIGN SEND ERROR] Email: ${contact.email}:`, errorMsg);
      log.status = "FAILED";
      log.error = errorMsg;

      // Auto-marcar como BOUNCED
      try {
        const { saveLocalContact } = await import("./store");
        saveLocalContact({
          ...contact,
          status: "BOUNCED",
          bounced: true,
          bounceReason: errorMsg,
        });
        await prisma.unsubscribedEmail.upsert({
          where: { email: contact.email },
          create: { email: contact.email, reason: `BOUNCE_SEND_ERROR: ${errorMsg.substring(0, 100)}` },
          update: { reason: `BOUNCE_SEND_ERROR: ${errorMsg.substring(0, 100)}` },
        });
      } catch (e) {}
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

    const percentage = Number((((i + 1) / recipients.length) * 100).toFixed(1));
    if (options?.onProgress) {
      options.onProgress({
        sent: sentCount,
        failed: failedCount,
        total: recipients.length,
        percentage,
        currentEmail: contact.email,
        status: log.status,
        error: log.error,
      });
    }

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
