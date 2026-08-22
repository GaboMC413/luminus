import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

function getSesV2Client(): SESv2Client {
  const region = process.env.SES_REGION || process.env.AWS_REGION || "us-east-1";
  const accessKeyId = process.env.SES_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SES_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  if (accessKeyId && secretAccessKey) {
    return new SESv2Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  // AWS Amplify IAM Compute Role
  return new SESv2Client({ region });
}

function isSesConfigured() {
  if (process.env.NODE_ENV === "production") {
    return true;
  }
  return Boolean(process.env.SES_ACCESS_KEY_ID && process.env.SES_SECRET_ACCESS_KEY);
}

async function logSentEmail(recipient: string, subject: string, htmlBody: string) {
  try {
    const { prisma } = await import("@/lib/db");
    await prisma.sentEmailLog.create({
      data: {
        recipient,
        subject,
        htmlBody,
      },
    });
  } catch (err) {
    console.error("Failed to log sent email into sent_email_logs:", err);
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
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || process.env.SES_FROM_EMAIL || "notificaciones@luminuslatam.com";

  const envRecipients = process.env.CONTACT_NOTIFICATION_EMAILS
    ? process.env.CONTACT_NOTIFICATION_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
    : null;

  const toAddresses = envRecipients && envRecipients.length > 0 ? envRecipients : DEFAULT_CONTACT_RECIPIENTS;

  const subject = `[LUMINUS Contacto] ${data.motivo} - ${data.nombre} ${data.apellido}`;

  const htmlBody = `
    <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="font-size: 20px; color: #0f172a; margin-bottom: 16px;">Nuevo Mensaje de Contacto</h2>
      <p style="margin-bottom: 8px;"><strong>Motivo:</strong> ${data.motivo}</p>
      <p style="margin-bottom: 8px;"><strong>Nombre:</strong> ${data.nombre} ${data.apellido}</p>
      <p style="margin-bottom: 8px;"><strong>Email:</strong> ${data.email}</p>
      <p style="margin-bottom: 8px;"><strong>Teléfono:</strong> ${data.telefono || "No proporcionado"}</p>
      <p style="margin-bottom: 8px;"><strong>País:</strong> ${data.pais || "No especificado"}</p>
      <div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${data.mensaje}</div>
    </div>
  `;

  const textBody = `NUEVO MENSAJE DE CONTACTO:\nMotivo: ${data.motivo}\nNombre: ${data.nombre} ${data.apellido}\nEmail: ${data.email}\nMensaje:\n${data.mensaje}`;

  if (!isSesConfigured()) {
    console.log(`[SES DISABLED] Contact notification email for ${toAddresses.join(", ")} logged locally.`);
    await logSentEmail(toAddresses.join(", "), subject, htmlBody);
    return { success: true, mode: "local-preview" };
  }

  const sesClient = getSesV2Client();

  const command = new SendEmailCommand({
    FromEmailAddress: fromEmail,
    Destination: {
      ToAddresses: toAddresses,
    },
    Content: {
      Simple: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: "UTF-8",
          },
          Text: {
            Data: textBody,
            Charset: "UTF-8",
          },
        },
      },
    },
    ConfigurationSetName: "luminus-notificaciones",
  });

  try {
    const response = await sesClient.send(command);
    await logSentEmail(toAddresses.join(", "), subject, htmlBody);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error(`[SES ERROR] Failed to send contact notification email:`, error);
    await logSentEmail(toAddresses.join(", "), subject, htmlBody);
    throw error;
  }
}

export interface EventRegistrationEmailPayload {
  firstName: string;
  lastName?: string;
  email: string;
  eventTitle: string;
  eventCoverUrl?: string | null;
  eventDate?: string | null;
  timeText?: string | null;
  speakerName?: string | null;
  youtubeUrl?: string | null;
  eventSlug?: string | null;
}

export async function sendEventRegistrationEmail(data: EventRegistrationEmailPayload) {
  const fromEmail = process.env.EVENT_FROM_EMAIL || "eventos@luminuslatam.com";
  const subject = `[LUMINUS] Confirmación de inscripción: ${data.eventTitle || "Evento de Bienestar"}`;
  const firstName = data.firstName || "Usuario";
  const formattedDate = data.eventDate || "Próximamente";
  const formattedTime = data.timeText || "18:00 hs (GMT-3)";
  const youtubeLink = data.youtubeUrl || (data.eventSlug ? `https://luminuslatam.com/proximasfechas/${data.eventSlug}` : "https://www.youtube.com/@luminus_latam");

  const htmlBody = `
    <div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; text-align: center; margin-bottom: 16px;">¡Hola ${firstName}!</h1>
      <p style="font-size: 15px; color: #334155; text-align: center; margin-bottom: 6px;">Te has inscripto a la entrevista online <strong>${data.eventTitle}</strong>.</p>
      <p style="font-size: 15px; color: #475569; text-align: center; margin-bottom: 24px;">Podrás ver el estreno el ${formattedDate} a las ${formattedTime}.</p>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${youtubeLink}" style="display: inline-block; padding: 12px 24px; background-color: #0284c7; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">Ver transmisión de YouTube</a>
      </div>
    </div>
  `;

  const textBody = `Hola ${firstName},\n\nTe has inscripto a la entrevista online "${data.eventTitle}".\n\nPodrás ver el estreno el ${formattedDate} a las ${formattedTime}.\n\nEquipo de LUMINUS Eventos.`;

  if (!isSesConfigured()) {
    console.log(`[SES DISABLED] Event registration email for ${data.email} logged locally.`);
    await logSentEmail(data.email, subject, htmlBody);
    return { success: true, mode: "local-preview" };
  }

  const sesClient = getSesV2Client();

  const command = new SendEmailCommand({
    FromEmailAddress: fromEmail,
    Destination: {
      ToAddresses: [data.email],
    },
    Content: {
      Simple: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: "UTF-8",
          },
          Text: {
            Data: textBody,
            Charset: "UTF-8",
          },
        },
      },
    },
    ConfigurationSetName: "luminus-eventos",
  });

  try {
    const response = await sesClient.send(command);
    await logSentEmail(data.email, subject, htmlBody);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error(`[SES ERROR] Failed to send event registration email to ${data.email}:`, error);
    await logSentEmail(data.email, subject, htmlBody);
    throw error;
  }
}
