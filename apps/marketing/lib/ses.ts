import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const WEBSITE_URL = "https://luminuslatam.com";
const LOGO_IMAGE_URL = `${WEBSITE_URL}/logo-mails.png`;

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

function formatSenderAddress(email: string, defaultName: string): string {
  const trimmed = email.trim();
  if (trimmed.includes("<") && trimmed.includes(">")) {
    return trimmed;
  }
  return `"${defaultName}" <${trimmed}>`;
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

function renderMarketingLayout(title: string, contentHtml: string, alignCenter: boolean = true): string {
  const textAlign = alignCenter ? "center" : "left";
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff !important; color: #0f172a !important; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 580px; margin: 0 auto; padding: 40px 24px; background-color: #ffffff !important; color: #0f172a !important; text-align: ${textAlign};">
    
    <!-- HERO HEADER -->
    <div style="margin-bottom: 36px; text-align: center;">
      <a href="${WEBSITE_URL}" target="_blank" style="display: inline-block; border: 0; outline: none; text-decoration: none;">
        <img src="${LOGO_IMAGE_URL}" alt="LUMINUS" width="160" height="28" style="display: block; width: 160px; height: auto; margin: 0 auto; border: 0; outline: none; text-decoration: none;" />
      </a>
    </div>

    <!-- MAIN CONTENT -->
    <div style="text-align: ${textAlign};">
      ${contentHtml}
    </div>

    <!-- FOOTER -->
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 36px 0 28px 0;" />
    
    <div style="text-align: center; max-width: 500px; margin: 0 auto; padding: 0;">
      <p style="font-size: 15px; font-weight: 700; margin: 0 0 10px 0; line-height: 1.4; color: #0f172a; text-align: center;">
        Una red para conectar, aprender y cuidar tu bienestar.
      </p>
      <p style="font-size: 13.5px; line-height: 1.6; opacity: 0.8; margin: 0 0 24px 0; color: #475569; text-align: center;">
        Conectamos personas y especialistas de distintas áreas en un mismo espacio para compartir experiencias, acceder a nuevas perspectivas y encontrar formas de cuidar el bienestar que se adapten a cada persona y momento de su vida.
      </p>
      <p style="margin: 0; font-size: 13px; color: #94a3b8; text-align: center;">© 2026 LUMINUS Latam. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>`;
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
  const rawFrom = process.env.NOTIFICATION_FROM_EMAIL || process.env.SES_FROM_EMAIL || "notificaciones@luminuslatam.com";
  const fromEmail = formatSenderAddress(rawFrom, "LUMINUS LATAM");

  const envRecipients = process.env.CONTACT_NOTIFICATION_EMAILS
    ? process.env.CONTACT_NOTIFICATION_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
    : null;

  const toAddresses = envRecipients && envRecipients.length > 0 ? envRecipients : DEFAULT_CONTACT_RECIPIENTS;

  const subject = `[LUMINUS WEB] ${data.motivo} - ${data.nombre} ${data.apellido}`;

  const contentHtml = `
    <!-- Top Operational Badge -->
    <div style="margin-bottom: 20px; text-align: left;">
      <span style="display: inline-block; background-color: #f1f5f9; color: #334155; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 5px 12px; border-radius: 20px; border: 1px solid #cbd5e1;">
        Nuevo contacto desde la Web
      </span>
    </div>

    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 6px 0; color: #0f172a; text-align: left;">
      ${data.nombre} ${data.apellido}
    </h1>
    
    <p style="font-size: 14px; color: #64748b; margin: 0 0 22px 0; text-align: left;">
      Se ha puesto en contacto a través de la web.
    </p>

    <!-- Data Summary Table Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: left;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 110px;">Motivo:</td>
          <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${data.motivo}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Email:</td>
          <td style="padding: 6px 0; color: #0f172a;"><a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${data.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Teléfono:</td>
          <td style="padding: 6px 0; color: #0f172a;">${data.telefono || "No proporcionado"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">País:</td>
          <td style="padding: 6px 0; color: #0f172a;">${data.pais || "No especificado"}</td>
        </tr>
      </table>
    </div>

    <!-- Message Content Box -->
    <div style="margin-bottom: 28px; text-align: left;">
      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; color: #475569;">MENSAJE:</div>
      <div style="font-size: 14.5px; line-height: 1.6; background-color: #ffffff; padding: 18px 20px; border-radius: 14px; border: 1px solid #e2e8f0; white-space: pre-wrap; color: #1e293b; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
${data.mensaje}
      </div>
    </div>
  `;

  const htmlBody = renderMarketingLayout(subject, contentHtml, false);
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
    ...(process.env.SES_CONFIGURATION_NOTIFICACIONES && {
      ConfigurationSetName: process.env.SES_CONFIGURATION_NOTIFICACIONES,
    }),
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
  const rawFrom = process.env.EVENT_FROM_EMAIL || "eventos@luminuslatam.com";
  const fromEmail = formatSenderAddress(rawFrom, "LUMINUS LATAM Eventos");
  const subject = `[LUMINUS] Confirmación de inscripción: ${data.eventTitle || "Evento de Bienestar"}`;
  const firstName = data.firstName || "Usuario";
  const formattedDate = formatDateSpanish(data.eventDate);
  const formattedTime = data.timeText || "18:00 hs (GMT-3)";
  const youtubeLink = data.youtubeUrl || (data.eventSlug ? `https://luminuslatam.com/proximasfechas/${data.eventSlug}` : "https://www.youtube.com/@luminus_latam");
  const coverImageUrl = data.eventCoverUrl || LOGO_IMAGE_URL;

  const contentHtml = `
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
  `;

  const htmlBody = renderMarketingLayout(subject, contentHtml, true);
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
    ...(process.env.SES_CONFIGURATION_EVENTOS && {
      ConfigurationSetName: process.env.SES_CONFIGURATION_EVENTOS,
    }),
  });

  try {
    const response = await sesClient.send(command);
    await logSentEmail(data.email, subject, htmlBody);
    return { success: true, messageId: response.MessageId };
  } catch (error: any) {
    console.error(`❌ AWS SES Error completo al enviar correo a ${data.email}:`, JSON.stringify(error, null, 2));
    await logSentEmail(data.email, subject, htmlBody);
    throw error;
  }
}
