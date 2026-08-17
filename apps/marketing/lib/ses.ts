import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const region = process.env.SES_REGION || process.env.AWS_REGION || "us-east-1";
const accessKeyId = process.env.SES_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.SES_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

const sesClient = new SESClient({
  region,
  ...(accessKeyId && secretAccessKey
    ? {
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      }
    : {}),
});

export interface ContactNotificationPayload {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  pais?: string;
  motivo: string;
  mensaje: string;
}

const DEFAULT_RECIPIENTS = ["info@luminuslatam.com", "gabrielmedcap@hotmail.com"];

export async function sendContactNotificationEmail(data: ContactNotificationPayload) {
  const fromEmail = process.env.SES_FROM_EMAIL || "info@luminuslatam.com";
  
  const envRecipients = process.env.CONTACT_NOTIFICATION_EMAILS
    ? process.env.CONTACT_NOTIFICATION_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
    : null;

  const toAddresses = envRecipients && envRecipients.length > 0 ? envRecipients : DEFAULT_RECIPIENTS;

  const subject = `[LUMINUS Contacto] ${data.motivo} - ${data.nombre} ${data.apellido}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; color: #18181b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
          .header { border-bottom: 2px solid #f4f4f5; padding-bottom: 16px; margin-bottom: 24px; }
          .header h1 { font-size: 22px; font-weight: 600; margin: 0; color: #09090b; }
          .badge { display: inline-block; background: #6d28d9; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-top: 8px; }
          .field-group { margin-bottom: 16px; }
          .label { font-size: 12px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
          .value { font-size: 15px; color: #18181b; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0; word-break: break-word; }
          .footer { margin-top: 32px; font-size: 12px; color: #a1a1aa; text-align: center; border-top: 1px solid #f4f4f5; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nuevo Mensaje de Contacto</h1>
            <span class="badge">${data.motivo}</span>
          </div>

          <div class="field-group">
            <div class="label">Nombre completo</div>
            <div class="value">${data.nombre} ${data.apellido}</div>
          </div>

          <div class="field-group">
            <div class="label">Correo Electrónico</div>
            <div class="value"><a href="mailto:${data.email}" style="color: #6d28d9; text-decoration: none;">${data.email}</a></div>
          </div>

          <div class="field-group">
            <div class="label">Teléfono</div>
            <div class="value">${data.telefono || "No proporcionado"}</div>
          </div>

          <div class="field-group">
            <div class="label">País</div>
            <div class="value">${data.pais || "No especificado"}</div>
          </div>

          <div class="field-group">
            <div class="label">Motivo de consulta</div>
            <div class="value">${data.motivo}</div>
          </div>

          <div class="field-group">
            <div class="label">Mensaje</div>
            <div class="value" style="white-space: pre-wrap;">${data.mensaje}</div>
          </div>

          <div class="footer">
            Este correo fue generado automáticamente desde la web de LUMINUS.
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
NUEVO MENSAJE DE CONTACTO - LUMINUS
===================================
Motivo: ${data.motivo}

Nombre: ${data.nombre} ${data.apellido}
Email: ${data.email}
Teléfono: ${data.telefono || "No proporcionado"}
País: ${data.pais || "No especificado"}

Mensaje:
${data.mensaje}
  `.trim();

  const command = new SendEmailCommand({
    Source: fromEmail,
    Destination: {
      ToAddresses: toAddresses,
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: htmlContent,
          Charset: "UTF-8",
        },
        Text: {
          Data: textContent,
          Charset: "UTF-8",
        },
      },
    },
  });

  return await sesClient.send(command);
}
