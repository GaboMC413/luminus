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

export async function sendPasswordResetEmail(email: string, code: string) {
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || process.env.SES_FROM_EMAIL || "notificaciones@luminuslatam.com";
  const subject = "Código de recuperación de LUMINUS";
  const htmlBody = renderPasswordResetEmailHtml(code);
  const textBody = `Tu código de recuperación de contraseña de LUMINUS es: ${code}. Vence en 15 minutos.`;

  writeLocalEmailPreview(email, subject, htmlBody);

  if (!isSesConfigured()) {
    console.log(`[SES DISABLED] Password reset email for ${email} generated locally. Code: ${code}`);
    await logSentEmail(email, subject, htmlBody);
    return { success: true, mode: "local-preview", code };
  }

  const sesClient = getSesV2Client();

  const command = new SendEmailCommand({
    FromEmailAddress: fromEmail,
    Destination: {
      ToAddresses: [email],
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
    console.log(`[SES SUCCESS] Password reset email sent to ${email}. MessageId: ${response.MessageId}`);
    await logSentEmail(email, subject, htmlBody);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error(`[SES ERROR] Failed to send password reset email to ${email}:`, error);
    await logSentEmail(email, subject, htmlBody);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name: string = "Usuario") {
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || process.env.SES_FROM_EMAIL || "notificaciones@luminuslatam.com";
  const subject = "¡Te damos la bienvenida a LUMINUS!";
  const htmlBody = renderWelcomeEmailHtml(name);
  const textBody = `¡Te damos la bienvenida a LUMINUS, ${name}! Nos alegra acompañarte en este espacio de bienestar integral.`;

  writeLocalEmailPreview(email, subject, htmlBody);

  if (!isSesConfigured()) {
    console.log(`[SES DISABLED] Welcome email for ${email} generated locally.`);
    await logSentEmail(email, subject, htmlBody);
    return { success: true, mode: "local-preview" };
  }

  const sesClient = getSesV2Client();

  const command = new SendEmailCommand({
    FromEmailAddress: fromEmail,
    Destination: {
      ToAddresses: [email],
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
    console.log(`[SES SUCCESS] Welcome email sent to ${email}. MessageId: ${response.MessageId}`);
    await logSentEmail(email, subject, htmlBody);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error(`[SES ERROR] Failed to send welcome email to ${email}:`, error);
    await logSentEmail(email, subject, htmlBody);
    throw error;
  }
}

export async function sendEmailChangeVerificationEmail(email: string, code: string) {
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || process.env.SES_FROM_EMAIL || "notificaciones@luminuslatam.com";
  const subject = "Código para confirmar tu email de LUMINUS";
  const htmlBody = renderEmailChangeVerificationHtml(code);
  const textBody = `Tu código para confirmar tu nuevo correo en LUMINUS es: ${code}. Vence en 15 minutos.`;

  writeLocalEmailPreview(email, subject, htmlBody);

  if (!isSesConfigured()) {
    console.log(`[SES DISABLED] Email change verification for ${email} generated locally. Code: ${code}`);
    await logSentEmail(email, subject, htmlBody);
    return { success: true, mode: "local-preview", code };
  }

  const sesClient = getSesV2Client();

  const command = new SendEmailCommand({
    FromEmailAddress: fromEmail,
    Destination: {
      ToAddresses: [email],
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
    console.log(`[SES SUCCESS] Email change verification sent to ${email}. MessageId: ${response.MessageId}`);
    await logSentEmail(email, subject, htmlBody);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error(`[SES ERROR] Failed to send email change verification to ${email}:`, error);
    await logSentEmail(email, subject, htmlBody);
    throw error;
  }
}

export async function sendEventRegistrationEmail(
  email: string,
  options: import("./inscription").EventInscriptionEmailOptions
) {
  const fromEmail = process.env.EVENT_FROM_EMAIL || "eventos@luminuslatam.com";
  const { renderEventRegistrationEmailHtml } = await import("./inscription");
  const htmlBody = renderEventRegistrationEmailHtml(options);
  const subject = `[LUMINUS] Confirmación de inscripción: ${options.eventTitle || "Evento de Bienestar"}`;
  const textBody = `Hola ${options.firstName || "Usuario"},\n\nTe has inscripto a la entrevista online "${options.eventTitle || "Evento LUMINUS"}".\n\nPodrás ver el estreno el ${options.eventDate || "Próximamente"} a las ${options.timeText || "18:00 hs (GMT-3)"}.\n\nEquipo de LUMINUS Eventos.`;

  writeLocalEmailPreview(email, subject, htmlBody);

  if (!isSesConfigured()) {
    console.log(`[SES DISABLED] Event registration email for ${email} generated locally.`);
    await logSentEmail(email, subject, htmlBody);
    return { success: true, mode: "local-preview" };
  }

  const sesClient = getSesV2Client();

  const command = new SendEmailCommand({
    FromEmailAddress: fromEmail,
    Destination: {
      ToAddresses: [email],
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
    console.log(`[SES SUCCESS] Event registration email sent to ${email} from ${fromEmail}. MessageId: ${response.MessageId}`);
    await logSentEmail(email, subject, htmlBody);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error(`[SES ERROR] Failed to send event registration email to ${email}:`, error);
    await logSentEmail(email, subject, htmlBody);
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

  writeLocalEmailPreview(toAddresses.join(", "), subject, htmlBody);

  if (!isSesConfigured()) {
    console.log(`[SES DISABLED] Contact notification email for ${toAddresses.join(", ")} generated locally.`);
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
    console.log(`[SES SUCCESS] Contact notification email sent to ${toAddresses.join(", ")}. MessageId: ${response.MessageId}`);
    await logSentEmail(toAddresses.join(", "), subject, htmlBody);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error(`[SES ERROR] Failed to send contact notification email:`, error);
    await logSentEmail(toAddresses.join(", "), subject, htmlBody);
    throw error;
  }
}
