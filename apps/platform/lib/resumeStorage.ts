import { GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const ALLOWED_RESUME_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024;

export function getS3Config() {
  const bucket = process.env.S3_BUCKET?.trim();
  const region = process.env.S3_REGION?.trim() || "us-east-1";
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL?.trim();

  if (!bucket) throw new Error("S3_BUCKET is not configured.");

  return { bucket, region, publicBaseUrl };
}

/** Backwards-compatible alias used by resume routes */
export function getResumeStorageConfig() {
  return getS3Config();
}

export function createS3Client() {
  const { region } = getS3Config();
  const accessKeyId =
    process.env.S3_AVATAR_ACCESS_KEY_ID ||
    process.env.SES_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.S3_AVATAR_SECRET_ACCESS_KEY ||
    process.env.SES_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY;

  return new S3Client({
    region,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });
}

/** @deprecated use createS3Client */
export const createResumeS3Client = createS3Client;

export function extensionForResumeContentType(contentType: string) {
  if (contentType === "application/pdf") return "pdf";
  if (contentType === "application/msword") return "doc";
  if (contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  return null;
}

export function normalizeResumeFileName(fileName: unknown, extension: string) {
  const rawName = typeof fileName === "string" ? fileName.trim() : "";
  const withoutPath = rawName.split(/[\\\/]/).pop() || "";
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
  const { bucket } = getS3Config();
  if (!isResumeKeyForUser(options.key, options.userId)) {
    throw new Error("El archivo no pertenece al usuario autenticado.");
  }

  const response = await createS3Client().send(new HeadObjectCommand({ Bucket: bucket, Key: options.key }));
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
  const { bucket } = getS3Config();
  const client = createS3Client();
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

    const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL?.trim();
    if (publicBaseUrl && url.origin === new URL(publicBaseUrl).origin) return url.pathname.includes("/resumes/");

    const bucket = process.env.S3_BUCKET?.trim();
    const region = process.env.S3_REGION?.trim() || "us-east-1";
    return !!bucket && url.hostname === `${bucket}.s3.${region}.amazonaws.com` && url.pathname.startsWith("/resumes/");
  } catch {
    return false;
  }
}
