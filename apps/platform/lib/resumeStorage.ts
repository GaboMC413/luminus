import { GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const ALLOWED_RESUME_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024;

export function getResumeStorageConfig() {
  const bucket = process.env.S3_RESUME_BUCKET?.trim();
  const region = process.env.S3_RESUME_REGION?.trim() || process.env.AWS_REGION || "us-east-1";
  const accessKeyId = process.env.S3_RESUME_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_RESUME_SECRET_ACCESS_KEY?.trim();

  if (!bucket) throw new Error("S3_RESUME_BUCKET is not configured.");
  if (!accessKeyId || !secretAccessKey) throw new Error("S3 resume credentials are not configured.");

  return { bucket, region, accessKeyId, secretAccessKey };
}

export function createResumeS3Client() {
  const { region, accessKeyId, secretAccessKey } = getResumeStorageConfig();
  return new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
}

export function extensionForResumeContentType(contentType: string) {
  if (contentType === "application/pdf") return "pdf";
  if (contentType === "application/msword") return "doc";
  if (contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  return null;
}

export function normalizeResumeFileName(fileName: unknown, extension: string) {
  const rawName = typeof fileName === "string" ? fileName.trim() : "";
  const withoutPath = rawName.split(/[\\/]/).pop() || "";
  const safeName = withoutPath
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._ -]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 120)
    .trim();
  return safeName || `curriculum.${extension}`;
}

export function isResumeKeyForUser(key: string, userId: string) {
  return key.startsWith(`resumes/${userId}/`) && !key.includes("..") && !key.includes("\\");
}

export async function verifyUploadedResume(options: {
  key: string;
  userId: string;
  expectedContentType?: string;
  expectedSize?: number;
}) {
  const { bucket } = getResumeStorageConfig();
  if (!isResumeKeyForUser(options.key, options.userId)) {
    throw new Error("El archivo no pertenece al usuario autenticado.");
  }

  const response = await createResumeS3Client().send(new HeadObjectCommand({ Bucket: bucket, Key: options.key }));
  const contentType = response.ContentType || "";
  const contentLength = response.ContentLength || 0;

  if (response.Metadata?.owner !== options.userId) throw new Error("Propietario del archivo inconsistente.");
  if (!ALLOWED_RESUME_CONTENT_TYPES.has(contentType)) throw new Error("Formato almacenado no permitido.");
  if (contentLength <= 0 || contentLength > MAX_RESUME_SIZE_BYTES) throw new Error("Tamaño almacenado no permitido.");
  if (options.expectedContentType && options.expectedContentType !== contentType) throw new Error("Tipo de archivo inconsistente.");
  if (options.expectedSize && options.expectedSize !== contentLength) throw new Error("Tamaño de archivo inconsistente.");

  return { contentType, contentLength };
}

export async function createResumeDownloadUrl(key: string) {
  const { bucket } = getResumeStorageConfig();
  const client = createResumeS3Client();
  const metadata = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
  const extension = extensionForResumeContentType(metadata.ContentType || "") || "pdf";
  const fileName = metadata.Metadata?.originalfilename
    ? decodeURIComponent(metadata.Metadata.originalfilename)
    : `curriculum.${extension}`;

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentType: metadata.ContentType,
      ResponseContentDisposition: `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      ResponseCacheControl: "private, no-store",
    }),
    { expiresIn: 300 },
  );
}

export function isAllowedLegacyResumeUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;

    const avatarBaseUrl = process.env.S3_AVATAR_PUBLIC_BASE_URL?.trim();
    if (avatarBaseUrl && url.origin === new URL(avatarBaseUrl).origin) return url.pathname.includes("/resumes/");

    const bucket = process.env.S3_AVATAR_BUCKET?.trim();
    const region = process.env.S3_AVATAR_REGION?.trim() || process.env.AWS_REGION || "us-east-1";
    return !!bucket && url.hostname === `${bucket}.s3.${region}.amazonaws.com` && url.pathname.startsWith("/resumes/");
  } catch {
    return false;
  }
}
