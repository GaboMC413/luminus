import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import fs from "fs";
import path from "path";
import { getSesV2Client } from "./sesClient";
import { renderPasswordResetEmailHtml } from "./passwordReset";
import { renderWelcomeEmailHtml } from "./welcome";
import { renderEmailChangeVerificationHtml } from "./emailChange";

function isSesConfigured() {
  if (process.env.NODE_ENV === "production") {
    return true;
  }
  return Boolean(process.env.SES_ACCESS_KEY_ID && process.env.SES_SECRET_ACCESS_KEY);
}

function writeLocalEmailPreview(email: string, subject: string, htmlBody: string) {
  try {
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const htmlPath = path.join(publicDir, "temp-email.html");
    const previewContent = `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="background-color: #0f172a; color: white; padding: 10px 20px; border-radius: 6px 6px 0 0; margin-bottom: 20px;">
          <strong>Destinatario:</strong> ${email}<br/>
          <strong>Asunto:</strong> ${subject}
        </div>
        ${htmlBody}
      </div>
    `;
    fs.writeFileSync(htmlPath, previewContent, "utf8");
    console.log(`[SES DEVELOPER]: Email HTML preview updated. View it at: http://localhost:3000/temp-email.html`);
  } catch (err) {
    console.error("Failed to write email preview to public/temp-email.html:", err);
  }
}

export interface EmailLogOptions {
  status?: "SUCCESS" | "FAILED" | "LOCAL_PREVIEW";
  messageId?: string | null;
  errorDetails?: string | null;
  metadata?: any;
}

async function logSentEmail(
  recipient: string,
  subject: string,
  htmlBody: string,
  options?: EmailLogOptions
) {
  try {
    const { prisma } = await import("@/lib/db");
    await prisma.sentEmailLog.create({
      data: {
        recipient,
        subject,
        htmlBody,
        status: options?.status || "SUCCESS",
        messageId: options?.messageId || null,
        errorDetails: options?.errorDetails || null,
        metadata: options?.metadata ? JSON.stringify(options.metadata) : null,
      },
    });
  } catch (err) {
    console.error("Failed to log sent email into sent_email_logs:", err);
  }
}

function formatSenderAddress(email: string, defaultName: string): string {
  const trimmed = email.trim();
  if (trimmed.includes("<") && trimmed.includes(">")) {
    return trimmed;
  }
  return `"${defaultName}" <${trimmed}>`;
}

function buildRawLog(data: {
  action: string;
  recipient: string;
  sender: string;
  subject: string;
  region: string;
  configurationSet?: string | null;
  status: "SUCCESS" | "FAILED" | "LOCAL_PREVIEW";
  messageId?: string | null;
  errorDetails?: string | null;
  startTime: string;
  endTime: string;
}): string {
  const lines = [
    `=== LOG TÉCNICO DE ENVÍO LUMINUS ===`,
    `[TIMESTAMP INICIO]: ${data.startTime}`,
    `[TIMESTAMP FIN]:    ${data.endTime}`,
    `[ACCIÓN]:           ${data.action}`,
    `[REMITENTE]:        ${data.sender}`,
    `[DESTINATARIO(S)]:  ${data.recipient}`,
    `[ASUNTO]:           ${data.subject}`,
    `[REGION AWS]:       ${data.region}`,
    `[CONFIG SET]:       ${data.configurationSet || "Ninguno"}`,
    `[ESTADO FINAL]:     ${data.status}`,
  ];
  if (data.messageId) {
    lines.push(`[MESSAGE ID AWS]:   ${data.messageId}`);
  }
  if (data.errorDetails) {
    lines.push(`[DETALLE DE ERROR]: ${data.errorDetails}`);
  }
  lines.push(`====================================`);
  return lines.join("\n");
}

export async function sendPasswordResetEmail(email: string, code: string) {
  const startTime = new Date().toISOString();
  const rawFrom = process.env.NOTIFICATION_FROM_EMAIL || process.env.SES_FROM_EMAIL || "notificaciones@luminuslatam.com";
  const fromEmail = formatSenderAddress(rawFrom, "LUMINUS LATAM");
  const subject = "Código de recuperación de LUMINUS";
  const htmlBody = renderPasswordResetEmailHtml(code);
  const textBody = `Tu código de recuperación de contraseña de LUMINUS es: ${code}. Vence en 15 minutos.`;
  const region = process.env.SES_REGION || process.env.AWS_REGION || "us-east-1";
  const configurationSet = process.env.SES_CONFIGURATION_NOTIFICACIONES || "luminus-notificaciones";

  writeLocalEmailPreview(email, subject, htmlBody);

  const baseMetadata: any = {
    sender: fromEmail,
    region,
    configurationSet,
    recipients: [email],
    timeline: [
      { step: "Solicitud de envío recibida", timestamp: startTime, success: true },
      { step: "Plantilla HTML renderizada", timestamp: new Date().toISOString(), details: `${Math.round(htmlBody.length / 1024)} KB`, success: true },
    ],
  };

  if (!isSesConfigured()) {
    const endTime = new Date().toISOString();
    console.log(`[SES DISABLED] Password reset email for ${email} logged locally. Code: ${code}`);
    baseMetadata.timeline.push({
      step: "Entorno Local (SES Desactivado)",
      timestamp: endTime,
      details: "Correo visualizado en entorno local / preview",
      success: true,
    });
    baseMetadata.rawLog = buildRawLog({
      action: "Recuperación de Contraseña",
      recipient: email,
      sender: fromEmail,
      subject,
      region,
      configurationSet,
      status: "LOCAL_PREVIEW",
      startTime,
      endTime,
    });
    await logSentEmail(email, subject, htmlBody, {
      status: "LOCAL_PREVIEW",
      metadata: baseMetadata,
    });
    return { success: true, mode: "local-preview", code };
  }

  const sesClient = getSesV2Client();

  const command = new SendEmailCommand({
    FromEmailAddress: fromEmail,
    Destination: { ToAddresses: [email] },
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Html: { Data: htmlBody, Charset: "UTF-8" },
          Text: { Data: textBody, Charset: "UTF-8" },
        },
      },
    },
    ...(configurationSet && { ConfigurationSetName: configurationSet }),
  });

  try {
    baseMetadata.timeline.push({
      step: "Comando AWS SES despachado",
      timestamp: new Date().toISOString(),
      details: `Region: ${region}${configurationSet ? `, ConfigSet: ${configurationSet}` : ""}`,
      success: true,
    });
    const response = await sesClient.send(command);
    const endTime = new Date().toISOString();
    console.log(`[SES SUCCESS] Password reset email sent to ${email}. MessageId: ${response.MessageId}`);
    
    baseMetadata.timeline.push({
      step: "Respuesta de AWS SES recibida exitosamente",
      timestamp: endTime,
      details: `MessageId: ${response.MessageId}`,
      success: true,
    });
    baseMetadata.rawLog = buildRawLog({
      action: "Recuperación de Contraseña",
      recipient: email,
      sender: fromEmail,
      subject,
      region,
      configurationSet,
      status: "SUCCESS",
      messageId: response.MessageId || null,
      startTime,
      endTime,
    });

    await logSentEmail(email, subject, htmlBody, {
      status: "SUCCESS",
      messageId: response.MessageId || null,
      metadata: baseMetadata,
    });
    return { success: true, messageId: response.MessageId };
  } catch (error: any) {
    const endTime = new Date().toISOString();
    const errorMsg = error?.message || String(error);
    console.error(`[SES ERROR] Failed to send password reset email to ${email}:`, error);
    
    baseMetadata.timeline.push({
      step: "Fallo al despachar en AWS SES",
      timestamp: endTime,
      details: `${error?.name || "SESError"}: ${errorMsg}`,
      success: false,
    });
    baseMetadata.rawLog = buildRawLog({
      action: "Recuperación de Contraseña",
      recipient: email,
      sender: fromEmail,
      subject,
      region,
      configurationSet,
      status: "FAILED",
      errorDetails: `${error?.name || "SESError"}: ${errorMsg}`,
      startTime,
      endTime,
    });

    await logSentEmail(email, subject, htmlBody, {
      status: "FAILED",
      errorDetails: `${error?.name || "SESError"}: ${errorMsg}`,
      metadata: baseMetadata,
    });
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name: string = "Usuario") {
  try {
    const { prisma } = await import("@/lib/db");
    const existingLog = await prisma.sentEmailLog.findFirst({
      where: {
        recipient: email,
        subject: { contains: "bienvenida" },
        status: { in: ["SUCCESS", "LOCAL_PREVIEW"] },
      },
    });
    if (existingLog) {
      console.log(`[SES] Welcome email already sent to ${email}. Skipping duplicate.`);
      return { success: true, mode: "already-sent" };
    }
  } catch (err) {
    // Proceed if check fails
  }

  const startTime = new Date().toISOString();

  const rawFrom = process.env.NOTIFICATION_FROM_EMAIL || process.env.SES_FROM_EMAIL || "notificaciones@luminuslatam.com";
  const fromEmail = formatSenderAddress(rawFrom, "LUMINUS LATAM");
  const subject = "¡Te damos la bienvenida a LUMINUS!";
  const htmlBody = renderWelcomeEmailHtml(name);
  const textBody = `¡Te damos la bienvenida a LUMINUS, ${name}! Nos alegra acompañarte en este espacio de bienestar integral.`;
  const region = process.env.SES_REGION || process.env.AWS_REGION || "us-east-1";
  const configurationSet = process.env.SES_CONFIGURATION_NOTIFICACIONES || "luminus-notificaciones";

  writeLocalEmailPreview(email, subject, htmlBody);

  const baseMetadata: any = {
    sender: fromEmail,
    region,
    configurationSet,
    recipients: [email],
    timeline: [
      { step: "Solicitud de bienvenida recibida", timestamp: startTime, success: true },
      { step: "Plantilla de Bienvenida renderizada", timestamp: new Date().toISOString(), details: `${Math.round(htmlBody.length / 1024)} KB`, success: true },
    ],
  };

  if (!isSesConfigured()) {
    const endTime = new Date().toISOString();
    console.log(`[SES DISABLED] Welcome email for ${email} generated locally.`);
    baseMetadata.timeline.push({
      step: "Entorno Local (SES Desactivado)",
      timestamp: endTime,
      details: "Correo grabado en preview local",
      success: true,
    });
    baseMetadata.rawLog = buildRawLog({
      action: "Email de Bienvenida",
      recipient: email,
      sender: fromEmail,
      subject,
      region,
      configurationSet,
      status: "LOCAL_PREVIEW",
      startTime,
      endTime,
    });
    await logSentEmail(email, subject, htmlBody, {
      status: "LOCAL_PREVIEW",
      metadata: baseMetadata,
    });
    return { success: true, mode: "local-preview" };
  }

  const sesClient = getSesV2Client();

  const command = new SendEmailCommand({
    FromEmailAddress: fromEmail,
    Destination: { ToAddresses: [email] },
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Html: { Data: htmlBody, Charset: "UTF-8" },
          Text: { Data: textBody, Charset: "UTF-8" },
        },
      },
    },
    ...(configurationSet && { ConfigurationSetName: configurationSet }),
  });

  try {
    baseMetadata.timeline.push({
      step: "Comando AWS SES despachado",
      timestamp: new Date().toISOString(),
      details: `Region: ${region}${configurationSet ? `, ConfigSet: ${configurationSet}` : ""}`,
      success: true,
    });
    const response = await sesClient.send(command);
    const endTime = new Date().toISOString();
    console.log(`[SES SUCCESS] Welcome email sent to ${email}. MessageId: ${response.MessageId}`);

    baseMetadata.timeline.push({
      step: "Respuesta de AWS SES recibida exitosamente",
      timestamp: endTime,
      details: `MessageId: ${response.MessageId}`,
      success: true,
    });
    baseMetadata.rawLog = buildRawLog({
      action: "Email de Bienvenida",
      recipient: email,
      sender: fromEmail,
      subject,
      region,
      configurationSet,
      status: "SUCCESS",
      messageId: response.MessageId || null,
      startTime,
      endTime,
    });

    await logSentEmail(email, subject, htmlBody, {
      status: "SUCCESS",
      messageId: response.MessageId || null,
      metadata: baseMetadata,
    });
    return { success: true, messageId: response.MessageId };
  } catch (error: any) {
    const endTime = new Date().toISOString();
    const errorMsg = error?.message || String(error);
    console.error(`[SES ERROR] Failed to send welcome email to ${email}:`, error);

    baseMetadata.timeline.push({
      step: "Fallo al despachar en AWS SES",
      timestamp: endTime,
      details: `${error?.name || "SESError"}: ${errorMsg}`,
      success: false,
    });
    baseMetadata.rawLog = buildRawLog({
      action: "Email de Bienvenida",
      recipient: email,
      sender: fromEmail,
      subject,
      region,
      configurationSet,
      status: "FAILED",
      errorDetails: `${error?.name || "SESError"}: ${errorMsg}`,
      startTime,
      endTime,
    });

    await logSentEmail(email, subject, htmlBody, {
      status: "FAILED",
      errorDetails: `${error?.name || "SESError"}: ${errorMsg}`,
      metadata: baseMetadata,
    });
    throw error;
  }
}

export async function sendEmailChangeVerificationEmail(email: string, code: string) {
  const startTime = new Date().toISOString();
  const rawFrom = process.env.NOTIFICATION_FROM_EMAIL || process.env.SES_FROM_EMAIL || "notificaciones@luminuslatam.com";
  const fromEmail = formatSenderAddress(rawFrom, "LUMINUS LATAM");
  const subject = "Código para confirmar tu email de LUMINUS";
  const htmlBody = renderEmailChangeVerificationHtml(code);
  const textBody = `Tu código para confirmar tu nuevo correo en LUMINUS es: ${code}. Vence en 15 minutos.`;
  const region = process.env.SES_REGION || process.env.AWS_REGION || "us-east-1";
  const configurationSet = process.env.SES_CONFIGURATION_NOTIFICACIONES || "luminus-notificaciones";

  writeLocalEmailPreview(email, subject, htmlBody);

  const baseMetadata: any = {
    sender: fromEmail,
    region,
    configurationSet,
    recipients: [email],
    timeline: [
      { step: "Solicitud de cambio de email recibida", timestamp: startTime, success: true },
      { step: "Plantilla de verificación renderizada", timestamp: new Date().toISOString(), details: `${Math.round(htmlBody.length / 1024)} KB`, success: true },
    ],
  };

  if (!isSesConfigured()) {
    const endTime = new Date().toISOString();
    console.log(`[SES DISABLED] Email change verification for ${email} generated locally. Code: ${code}`);
    baseMetadata.timeline.push({
      step: "Entorno Local (SES Desactivado)",
      timestamp: endTime,
      details: "Correo grabado en preview local",
      success: true,
    });
    baseMetadata.rawLog = buildRawLog({
      action: "Verificación de Cambio de Email",
      recipient: email,
      sender: fromEmail,
      subject,
      region,
      configurationSet,
      status: "LOCAL_PREVIEW",
      startTime,
      endTime,
    });
    await logSentEmail(email, subject, htmlBody, {
      status: "LOCAL_PREVIEW",
      metadata: baseMetadata,
    });
    return { success: true, mode: "local-preview", code };
  }

  const sesClient = getSesV2Client();

  const command = new SendEmailCommand({
    FromEmailAddress: fromEmail,
    Destination: { ToAddresses: [email] },
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Html: { Data: htmlBody, Charset: "UTF-8" },
          Text: { Data: textBody, Charset: "UTF-8" },
        },
      },
    },
    ...(configurationSet && { ConfigurationSetName: configurationSet }),
  });

  try {
    baseMetadata.timeline.push({
      step: "Comando AWS SES despachado",
      timestamp: new Date().toISOString(),
      details: `Region: ${region}${configurationSet ? `, ConfigSet: ${configurationSet}` : ""}`,
      success: true,
    });
    const response = await sesClient.send(command);
    const endTime = new Date().toISOString();
    console.log(`[SES SUCCESS] Email change verification sent to ${email}. MessageId: ${response.MessageId}`);

    baseMetadata.timeline.push({
      step: "Respuesta de AWS SES recibida exitosamente",
      timestamp: endTime,
      details: `MessageId: ${response.MessageId}`,
      success: true,
    });
    baseMetadata.rawLog = buildRawLog({
      action: "Verificación de Cambio de Email",
      recipient: email,
      sender: fromEmail,
      subject,
      region,
      configurationSet,
      status: "SUCCESS",
      messageId: response.MessageId || null,
      startTime,
      endTime,
    });

    await logSentEmail(email, subject, htmlBody, {
      status: "SUCCESS",
      messageId: response.MessageId || null,
      metadata: baseMetadata,
    });
    return { success: true, messageId: response.MessageId };
  } catch (error: any) {
    const endTime = new Date().toISOString();
    const errorMsg = error?.message || String(error);
    console.error(`[SES ERROR] Failed to send email change verification to ${email}:`, error);

    baseMetadata.timeline.push({
      step: "Fallo al despachar en AWS SES",
      timestamp: endTime,
      details: `${error?.name || "SESError"}: ${errorMsg}`,
      success: false,
    });
    baseMetadata.rawLog = buildRawLog({
      action: "Verificación de Cambio de Email",
      recipient: email,
      sender: fromEmail,
      subject,
      region,
      configurationSet,
      status: "FAILED",
      errorDetails: `${error?.name || "SESError"}: ${errorMsg}`,
      startTime,
      endTime,
    });

    await logSentEmail(email, subject, htmlBody, {
      status: "FAILED",
      errorDetails: `${error?.name || "SESError"}: ${errorMsg}`,
      metadata: baseMetadata,
    });
    throw error;
  }
}

export async function sendEventRegistrationEmail(
  email: string,
  options: import("./inscription").EventInscriptionEmailOptions
) {
  const startTime = new Date().toISOString();
  const rawFrom = process.env.EVENT_FROM_EMAIL || "eventos@luminuslatam.com";
  const fromEmail = formatSenderAddress(rawFrom, "LUMINUS LATAM Eventos");
  const { renderEventRegistrationEmailHtml } = await import("./inscription");
  const htmlBody = renderEventRegistrationEmailHtml(options);
  let youtubeLink = "https://www.youtube.com/@luminus_latam";
  if (options.youtubeUrl && options.youtubeUrl.trim()) {
    const rawYt = options.youtubeUrl.trim();
    youtubeLink = (rawYt.startsWith("http://") || rawYt.startsWith("https://")) ? rawYt : `https://www.youtube.com/watch?v=${rawYt}`;
  }
  const subject = `[LUMINUS] Confirmación de inscripción: ${options.eventTitle || "Evento de Bienestar"}`;
  const textBody = `Hola ${options.firstName || "Usuario"},\n\nTe has inscripto a la entrevista online "${options.eventTitle || "Evento LUMINUS"}".\n\nPodrás ver el estreno el ${options.eventDate || "Próximamente"} a las ${options.timeText || "18:00 hs (GMT-3)"}.\n\nVer en YouTube: ${youtubeLink}\n\nEquipo de LUMINUS Eventos.`;
  const region = process.env.SES_REGION || process.env.AWS_REGION || "us-east-1";
  const configurationSet = process.env.SES_CONFIGURATION_EVENTOS || "luminus-eventos";

  writeLocalEmailPreview(email, subject, htmlBody);

  const baseMetadata: any = {
    sender: fromEmail,
    region,
    configurationSet,
    recipients: [email],
    timeline: [
      { step: "Solicitud de inscripción a evento recibida", timestamp: startTime, success: true },
      { step: "Plantilla de evento renderizada", timestamp: new Date().toISOString(), details: `Evento: ${options.eventTitle || "S/T"}`, success: true },
    ],
  };

  if (!isSesConfigured()) {
    const endTime = new Date().toISOString();
    console.log(`[SES DISABLED] Event registration email for ${email} generated locally.`);
    baseMetadata.timeline.push({
      step: "Entorno Local (SES Desactivado)",
      timestamp: endTime,
      details: "Correo grabado en preview local",
      success: true,
    });
    baseMetadata.rawLog = buildRawLog({
      action: "Inscripción a Evento",
      recipient: email,
      sender: fromEmail,
      subject,
      region,
      configurationSet,
      status: "LOCAL_PREVIEW",
      startTime,
      endTime,
    });
    await logSentEmail(email, subject, htmlBody, {
      status: "LOCAL_PREVIEW",
      metadata: baseMetadata,
    });
    return { success: true, mode: "local-preview" };
  }

  const sesClient = getSesV2Client();

  const command = new SendEmailCommand({
    FromEmailAddress: fromEmail,
    Destination: { ToAddresses: [email] },
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Html: { Data: htmlBody, Charset: "UTF-8" },
          Text: { Data: textBody, Charset: "UTF-8" },
        },
      },
    },
    ...(configurationSet && { ConfigurationSetName: configurationSet }),
  });

  try {
    baseMetadata.timeline.push({
      step: "Comando AWS SES despachado",
      timestamp: new Date().toISOString(),
      details: `Region: ${region}${configurationSet ? `, ConfigSet: ${configurationSet}` : ""}`,
      success: true,
    });
    const response = await sesClient.send(command);
    const endTime = new Date().toISOString();
    console.log(`[SES SUCCESS] Event registration email sent to ${email} from ${fromEmail}. MessageId: ${response.MessageId}`);

    baseMetadata.timeline.push({
      step: "Respuesta de AWS SES recibida exitosamente",
      timestamp: endTime,
      details: `MessageId: ${response.MessageId}`,
      success: true,
    });
    baseMetadata.rawLog = buildRawLog({
      action: "Inscripción a Evento",
      recipient: email,
      sender: fromEmail,
      subject,
      region,
      configurationSet,
      status: "SUCCESS",
      messageId: response.MessageId || null,
      startTime,
      endTime,
    });

    await logSentEmail(email, subject, htmlBody, {
      status: "SUCCESS",
      messageId: response.MessageId || null,
      metadata: baseMetadata,
    });
    return { success: true, messageId: response.MessageId };
  } catch (error: any) {
    const endTime = new Date().toISOString();
    const errorMsg = error?.message || String(error);
    console.error(`[SES ERROR] Failed to send event registration email to ${email}:`, error);

    baseMetadata.timeline.push({
      step: "Fallo al despachar en AWS SES",
      timestamp: endTime,
      details: `${error?.name || "SESError"}: ${errorMsg}`,
      success: false,
    });
    baseMetadata.rawLog = buildRawLog({
      action: "Inscripción a Evento",
      recipient: email,
      sender: fromEmail,
      subject,
      region,
      configurationSet,
      status: "FAILED",
      errorDetails: `${error?.name || "SESError"}: ${errorMsg}`,
      startTime,
      endTime,
    });

    await logSentEmail(email, subject, htmlBody, {
      status: "FAILED",
      errorDetails: `${error?.name || "SESError"}: ${errorMsg}`,
      metadata: baseMetadata,
    });
    throw error;
  }
}

export interface ContactNotificationPayload {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  pais?: string;
  motivo: string;
  mensaje: string;
}

const DEFAULT_CONTACT_RECIPIENTS = [
  "info@luminuslatam.com",
  "gabrielmedcap@hotmail.com",
];

export async function sendContactNotificationEmail(data: ContactNotificationPayload) {
  const startTime = new Date().toISOString();
  const rawFrom = process.env.NOTIFICATION_FROM_EMAIL || process.env.SES_FROM_EMAIL || "notificaciones@luminuslatam.com";
  const fromEmail = formatSenderAddress(rawFrom, "LUMINUS LATAM");

  const envRecipients = process.env.CONTACT_NOTIFICATION_EMAILS
    ? process.env.CONTACT_NOTIFICATION_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
    : null;

  const toAddresses = envRecipients && envRecipients.length > 0 ? envRecipients : DEFAULT_CONTACT_RECIPIENTS;

  const subject = `[LUMINUS Contacto] ${data.motivo} - ${data.nombre} ${data.apellido}`;

  const { renderContactNotificationEmailHtml } = await import("./contact");
  const htmlBody = renderContactNotificationEmailHtml(data);
  const textBody = `NUEVO MENSAJE DE CONTACTO:\nMotivo: ${data.motivo}\nNombre: ${data.nombre} ${data.apellido}\nEmail: ${data.email}\nMensaje:\n${data.mensaje}`;
  const region = process.env.SES_REGION || process.env.AWS_REGION || "us-east-1";
  const configurationSet = process.env.SES_CONFIGURATION_NOTIFICACIONES || "luminus-notificaciones";

  writeLocalEmailPreview(toAddresses.join(", "), subject, htmlBody);

  const baseMetadata: any = {
    sender: fromEmail,
    region,
    configurationSet,
    recipients: toAddresses,
    timeline: [
      { step: "Solicitud de contacto recibida", timestamp: startTime, success: true },
      { step: "Plantilla de contacto renderizada", timestamp: new Date().toISOString(), details: `Contacto: ${data.nombre} ${data.apellido}`, success: true },
    ],
  };

  if (!isSesConfigured()) {
    const endTime = new Date().toISOString();
    console.log(`[SES DISABLED] Contact notification email for ${toAddresses.join(", ")} generated locally.`);
    baseMetadata.timeline.push({
      step: "Entorno Local (SES Desactivado)",
      timestamp: endTime,
      details: "Correo grabado en preview local",
      success: true,
    });
    baseMetadata.rawLog = buildRawLog({
      action: "Notificación de Formulario de Contacto",
      recipient: toAddresses.join(", "),
      sender: fromEmail,
      subject,
      region,
      configurationSet,
      status: "LOCAL_PREVIEW",
      startTime,
      endTime,
    });
    await logSentEmail(toAddresses.join(", "), subject, htmlBody, {
      status: "LOCAL_PREVIEW",
      metadata: baseMetadata,
    });
    return { success: true, mode: "local-preview" };
  }

  const sesClient = getSesV2Client();

  const command = new SendEmailCommand({
    FromEmailAddress: fromEmail,
    Destination: { ToAddresses: toAddresses },
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Html: { Data: htmlBody, Charset: "UTF-8" },
          Text: { Data: textBody, Charset: "UTF-8" },
        },
      },
    },
    ...(configurationSet && { ConfigurationSetName: configurationSet }),
  });

  try {
    baseMetadata.timeline.push({
      step: "Comando AWS SES despachado",
      timestamp: new Date().toISOString(),
      details: `Region: ${region}${configurationSet ? `, ConfigSet: ${configurationSet}` : ""}`,
      success: true,
    });
    const response = await sesClient.send(command);
    const endTime = new Date().toISOString();
    console.log(`[SES SUCCESS] Contact notification email sent to ${toAddresses.join(", ")}. MessageId: ${response.MessageId}`);

    baseMetadata.timeline.push({
      step: "Respuesta de AWS SES recibida exitosamente",
      timestamp: endTime,
      details: `MessageId: ${response.MessageId}`,
      success: true,
    });
    baseMetadata.rawLog = buildRawLog({
      action: "Notificación de Formulario de Contacto",
      recipient: toAddresses.join(", "),
      sender: fromEmail,
      subject,
      region,
      configurationSet,
      status: "SUCCESS",
      messageId: response.MessageId || null,
      startTime,
      endTime,
    });

    await logSentEmail(toAddresses.join(", "), subject, htmlBody, {
      status: "SUCCESS",
      messageId: response.MessageId || null,
      metadata: baseMetadata,
    });
    return { success: true, messageId: response.MessageId };
  } catch (error: any) {
    const endTime = new Date().toISOString();
    const errorMsg = error?.message || String(error);
    console.error(`[SES ERROR] Failed to send contact notification email:`, error);

    baseMetadata.timeline.push({
      step: "Fallo al despachar en AWS SES",
      timestamp: endTime,
      details: `${error?.name || "SESError"}: ${errorMsg}`,
      success: false,
    });
    baseMetadata.rawLog = buildRawLog({
      action: "Notificación de Formulario de Contacto",
      recipient: toAddresses.join(", "),
      sender: fromEmail,
      subject,
      region,
      configurationSet,
      status: "FAILED",
      errorDetails: `${error?.name || "SESError"}: ${errorMsg}`,
      startTime,
      endTime,
    });

    await logSentEmail(toAddresses.join(", "), subject, htmlBody, {
      status: "FAILED",
      errorDetails: `${error?.name || "SESError"}: ${errorMsg}`,
      metadata: baseMetadata,
    });
    throw error;
  }
}
