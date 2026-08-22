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

function formatDateSpanish(dateString?: string | null): string {
  if (!dateString) return "Próximamente";
  try {
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      const weekday = d.toLocaleDateString("es-ES", { weekday: "long" });
      const day = d.getDate();
      const month = d.toLocaleDateString("es-ES", { month: "long" });
      const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
      return `${capitalizedWeekday} ${day} de ${capitalizedMonth}`;
    }
  } catch (e) {}
  return dateString;
}

export async function sendEventRegistrationEmail(data: EventRegistrationEmailPayload) {
  const fromEmail = process.env.EVENT_FROM_EMAIL || "eventos@luminuslatam.com";
  const subject = `[LUMINUS] Confirmación de inscripción: ${data.eventTitle || "Evento de Bienestar"}`;
  const firstName = data.firstName || "Usuario";
  const formattedDate = formatDateSpanish(data.eventDate);
  const formattedTime = data.timeText || "18:00 hs (GMT-3)";
  const youtubeLink = data.youtubeUrl || (data.eventSlug ? `https://luminuslatam.com/proximasfechas/${data.eventSlug}` : "https://www.youtube.com/@luminus_latam");
  const coverImageUrl = data.eventCoverUrl || "https://luminuslatam.com/logo-mails.png";

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 16px; background-color: #f8fafc; margin: 0;">
      <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <!-- Header con Logo LUMINUS -->
        <div style="padding: 28px 24px; text-align: center; border-b: 1px solid #f1f5f9; background-color: #ffffff;">
          <img src="https://luminuslatam.com/logo-mails.png" alt="LUMINUS" style="height: 36px; display: inline-block; border: 0;" />
        </div>

        <div style="padding: 32px 28px;">
          <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 12px 0; color: #0f172a; text-align: center;">
            ¡Hola ${firstName}!
          </h1>

          <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 6px 0; text-align: center;">
            Te has inscripto a la entrevista online <strong>${data.eventTitle}</strong>.
          </p>

          <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 28px 0; text-align: center;">
            Podrás ver el estreno el <strong>${formattedDate}</strong> a las <strong>${formattedTime}</strong>.
          </p>

          <!-- Tarjeta del Evento -->
          <div style="background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); text-align: center;">
            ${coverImageUrl ? `<img src="${coverImageUrl}" alt="${data.eventTitle}" style="width: 100%; max-height: 300px; object-fit: cover; display: block; border: 0; border-top-left-radius: 15px; border-top-right-radius: 15px;" />` : ''}
            
            <div style="padding: 24px 20px 28px 20px; text-align: center;">
              <h2 style="font-size: 20px; font-weight: 700; line-height: 1.3; color: #0f172a; margin: 0 0 8px 0; text-align: center;">
                ${data.eventTitle}
              </h2>
              
              ${data.speakerName ? `<p style="font-size: 15px; font-weight: 600; color: #334155; margin: 0 0 6px 0; text-align: center;">Con ${data.speakerName}</p>` : ''}
              
              <p style="font-size: 14px; font-weight: 500; color: #64748b; margin: 0 0 20px 0; text-align: center;">
                ${formattedDate} • ${formattedTime}
              </p>
              
              <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
                <a href="${youtubeLink}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 13px 26px; border-radius: 12px; font-size: 14px; font-weight: 600; text-align: center;">
                  Ver transmisión en YouTube
                </a>
              </div>
            </div>
          </div>
        </div>

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
    console.log(`[SES START] Enviando correo de confirmación de evento a ${data.email} vía ${fromEmail}...`);
    const response = await sesClient.send(command);
    console.log(`✅ AWS SES Event Registration Email enviado a ${data.email}. MessageId: ${response.MessageId}`);
    await logSentEmail(data.email, subject, htmlBody);
    return { success: true, messageId: response.MessageId };
  } catch (error: any) {
    console.error(`❌ AWS SES Error completo al enviar correo a ${data.email}:`, JSON.stringify(error, null, 2));
    await logSentEmail(data.email, subject, htmlBody);
    throw error;
  }
}
