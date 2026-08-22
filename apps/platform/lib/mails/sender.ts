import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import fs from "fs";
import path from "path";
import { renderPasswordResetEmailHtml } from "./passwordReset";
import { renderWelcomeEmailHtml } from "./welcome";
import { renderEmailChangeVerificationHtml } from "./emailChange";

function getSesClient() {
  const region = process.env.SES_REGION || "us-east-1";
  const accessKeyId = process.env.SES_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SES_SECRET_ACCESS_KEY;

  if (accessKeyId && secretAccessKey) {
    return new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  // AWS Amplify IAM Service Role
  return new SESClient({ region });
}

function isSesConfigured() {
  return (
    process.env.NODE_ENV === "production" ||
    Boolean(process.env.SES_REGION || (process.env.SES_ACCESS_KEY_ID && process.env.SES_SECRET_ACCESS_KEY))
  );
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

  writeLocalEmailPreview(email, subject, htmlBody);

  if (!isSesConfigured()) {
    console.log(`[SES DISABLED] Password reset email for ${email} generated locally. Code: ${code}`);
    await logSentEmail(email, subject, htmlBody);
    return { success: true, mode: "local-preview", code };
  }

  const sesClient = getSesClient();

  const command = new SendEmailCommand({
    Source: fromEmail,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
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
          Data: `Tu código de recuperación de contraseña de LUMINUS es: ${code}. Vence en 15 minutos.`,
          Charset: "UTF-8",
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

  writeLocalEmailPreview(email, subject, htmlBody);

  if (!isSesConfigured()) {
    console.log(`[SES DISABLED] Welcome email for ${email} generated locally.`);
    await logSentEmail(email, subject, htmlBody);
    return { success: true, mode: "local-preview" };
  }

  const sesClient = getSesClient();

  const command = new SendEmailCommand({
    Source: fromEmail,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
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
          Data: `¡Te damos la bienvenida a LUMINUS, ${name}! Nos alegra acompañarte en este espacio de bienestar integral.`,
          Charset: "UTF-8",
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

  writeLocalEmailPreview(email, subject, htmlBody);

  if (!isSesConfigured()) {
    console.log(`[SES DISABLED] Email change verification for ${email} generated locally. Code: ${code}`);
    await logSentEmail(email, subject, htmlBody);
    return { success: true, mode: "local-preview", code };
  }

  const sesClient = getSesClient();

  const command = new SendEmailCommand({
    Source: fromEmail,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
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
          Data: `Tu código para confirmar tu nuevo correo en LUMINUS es: ${code}. Vence en 15 minutos.`,
          Charset: "UTF-8",
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
  const fromEmail = "LUMINUS Eventos <eventos@luminuslatam.com>";
  const { renderEventRegistrationEmailHtml } = await import("./inscription");
  const htmlBody = renderEventRegistrationEmailHtml(options);
  const subject = `[LUMINUS] Confirmación de inscripción: ${options.eventTitle || "Evento de Bienestar"}`;

  writeLocalEmailPreview(email, subject, htmlBody);

  if (!isSesConfigured()) {
    console.log(`[SES DISABLED] Event registration email for ${email} generated locally.`);
    await logSentEmail(email, subject, htmlBody);
    return { success: true, mode: "local-preview" };
  }

  const sesClient = getSesClient();

  const command = new SendEmailCommand({
    Source: fromEmail,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
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
          Data: `Hola ${options.firstName || "Usuario"},\n\nTe has inscripto a la entrevista online "${options.eventTitle || "Evento LUMINUS"}".\n\nPodrás ver el estreno el ${options.eventDate || "Próximamente"} a las ${options.timeText || "18:00 hs (GMT-3)"}.\n\nEquipo de LUMINUS Eventos.`,
          Charset: "UTF-8",
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

