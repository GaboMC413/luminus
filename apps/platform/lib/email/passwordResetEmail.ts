import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";

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

export async function sendPasswordResetEmail(email: string, code: string) {
  const fromEmail = process.env.SES_FROM_EMAIL;

  if (!fromEmail) {
    throw new Error("SES_FROM_EMAIL is missing.");
  }

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
          Data: `
            <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
              <h2 style="margin: 0 0 16px;">Codigo de recuperacion</h2>
              <p>Recibimos una solicitud para restablecer tu contrasena de LUMINUS.</p>
              <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 24px 0;">${code}</p>
              <p>Este codigo vence en 15 minutos.</p>
              <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
              <p style="margin-top: 32px;">LUMINUS</p>
            </div>
          `,
        },
      },
    },
  });

  await client.send(command);
}
