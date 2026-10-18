import { SESv2Client } from "@aws-sdk/client-sesv2";

/**
 * Retorna el cliente unificado de AWS SES v2.
 * En producción (AWS Amplify SSR / Lambda), no se pasan credenciales explícitas
 * para que el SDK v3 utilice automáticamente el Compute IAM Role adjunto a Amplify.
 * En desarrollo local, si existen SES_ACCESS_KEY_ID y SES_SECRET_ACCESS_KEY,
 * se utilizan dichas credenciales explícitas.
 */
export function getSesV2Client(): SESv2Client {
  const region = process.env.SES_REGION || process.env.AWS_REGION || "us-east-1";
  const sesAccessKey = process.env.SES_ACCESS_KEY_ID?.trim();
  const sesSecretKey = process.env.SES_SECRET_ACCESS_KEY?.trim();
  const sesSessionToken = process.env.SES_SESSION_TOKEN?.trim();

  // Si existen credenciales explícitas configuradas para SES
  if (sesAccessKey && sesSecretKey) {
    return new SESv2Client({
      region,
      credentials: {
        accessKeyId: sesAccessKey,
        secretAccessKey: sesSecretKey,
        ...(sesSessionToken && { sessionToken: sesSessionToken }),
      },
    });
  }

  // De lo contrario, dejar que el SDK v3 utilice automáticamente el Compute IAM Role de AWS Amplify
  return new SESv2Client({ region });
}
