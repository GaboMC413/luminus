import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import fs from "fs";
import path from "path";
import { renderPasswordResetEmailHtml, renderWelcomeEmailHtml } from "./templates";

function getSesClient() {
  const region = process.env.SES_REGION;
  const accessKeyId = process.env.SES_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SES_SECRET_ACCESS_KEY;

  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error("SES email configuration is missing.");
  }

  return new SESClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function isSesConfigured() {
  return !!(
    process.env.SES_REGION &&
    process.env.SES_ACCESS_KEY_ID &&
    process.env.SES_SECRET_ACCESS_KEY &&
    process.env.SES_FROM_EMAIL
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
  } catch (error) {
    console.error("Failed to log sent email to database:", error);
  }
}

export async function sendPasswordResetEmail(email: string, code: string) {
  const htmlBody = renderPasswordResetEmailHtml(code);

  if (process.env.NODE_ENV === "development") {
    writeLocalEmailPreview(email, "Codigo de recuperacion de LUMINUS", htmlBody);
  }

  await logSentEmail(email, "Codigo de recuperacion de LUMINUS", htmlBody);

  if (!isSesConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[SES BYPASS]: AWS SES credentials or configuration are missing. Skipping password reset email to ${email}. Code: ${code}`
      );
      return;
    }
    throw new Error("AWS SES credentials or configuration are missing.");
  }

  const fromEmail = process.env.SES_FROM_EMAIL;

  const client = getSesClient();
  const command = new SendEmailCommand({
    Source: `LUMINUS <${fromEmail}>`,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: "Codigo de recuperacion de LUMINUS",
      },
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: [
            "Hola,",
            "",
            "Recibimos una solicitud para restablecer tu contrasena de LUMINUS.",
            `Tu codigo de recuperacion es: ${code}`,
            "",
            "Este codigo vence en 15 minutos. Si no solicitaste este cambio, puedes ignorar este correo.",
            "",
            "LUMINUS",
          ].join("\n"),
        },
        Html: {
          Charset: "UTF-8",
          Data: htmlBody,
        },
      },
    },
  });

  await client.send(command);
}

export async function sendEmailChangeVerificationEmail(email: string, code: string) {
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <h2 style="margin: 0 0 16px;">Confirma tu nuevo email</h2>
      <p>Recibimos una solicitud para cambiar el email de tu cuenta LUMINUS.</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 24px 0;">${code}</p>
      <p>Este codigo vence en 15 minutos.</p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      <p style="margin-top: 32px;">LUMINUS</p>
    </div>
  `;

  if (process.env.NODE_ENV === "development") {
    writeLocalEmailPreview(email, "Codigo para confirmar tu email de LUMINUS", htmlBody);
  }

  await logSentEmail(email, "Codigo para confirmar tu email de LUMINUS", htmlBody);

  if (!isSesConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[SES BYPASS]: AWS SES credentials or configuration are missing. Skipping email change verification email to ${email}. Code: ${code}`
      );
      return;
    }
    throw new Error("AWS SES credentials or configuration are missing.");
  }

  const fromEmail = process.env.SES_FROM_EMAIL;

  const client = getSesClient();
  const command = new SendEmailCommand({
    Source: `LUMINUS <${fromEmail}>`,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: "Codigo para confirmar tu email de LUMINUS",
      },
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: [
            "Hola,",
            "",
            "Recibimos una solicitud para cambiar el email de tu cuenta LUMINUS.",
            `Tu codigo de confirmacion es: ${code}`,
            "",
            "Este codigo vence en 15 minutos. Si no solicitaste este cambio, puedes ignorar este correo.",
            "",
            "LUMINUS",
          ].join("\n"),
        },
        Html: {
          Charset: "UTF-8",
          Data: htmlBody,
        },
      },
    },
  });

  await client.send(command);
}

export async function sendWelcomeEmail(email: string, name?: string) {
  const htmlBody = renderWelcomeEmailHtml(name || "Usuario");
  const subject = "¡Te damos la bienvenida a LUMINUS!";

  if (process.env.NODE_ENV === "development") {
    writeLocalEmailPreview(email, subject, htmlBody);
  }

  await logSentEmail(email, subject, htmlBody);

  if (!isSesConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[SES BYPASS]: AWS SES credentials or configuration are missing. Skipping welcome email to ${email}.`
      );
      return;
    }
    throw new Error("AWS SES credentials or configuration are missing.");
  }

  const fromEmail = process.env.SES_FROM_EMAIL;
  const client = getSesClient();

  const command = new SendEmailCommand({
    Source: `LUMINUS <${fromEmail}>`,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlBody,
        },
      },
    },
  });

  await client.send(command);
}
