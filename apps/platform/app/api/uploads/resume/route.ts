import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

const ALLOWED_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function getBucketConfig() {
  const bucket = process.env.S3_AVATAR_BUCKET;
  const region = process.env.S3_AVATAR_REGION ?? process.env.AWS_REGION ?? "us-east-1";
  const publicBaseUrl = process.env.S3_AVATAR_PUBLIC_BASE_URL;
  const accessKeyId = process.env.S3_AVATAR_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_AVATAR_SECRET_ACCESS_KEY;

  if (!bucket) {
    throw new Error("S3_AVATAR_BUCKET is not configured.");
  }

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("S3 avatar upload credentials are not configured.");
  }

  return { bucket, region, publicBaseUrl, accessKeyId, secretAccessKey };
}

function extensionForContentType(contentType: string) {
  if (contentType === "application/pdf") return "pdf";
  if (contentType === "application/msword") return "doc";
  if (contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  return "pdf";
}

export async function POST(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const contentType = typeof body?.contentType === "string" ? body.contentType : "application/pdf";
  const contentLength =
    typeof body?.contentLength === "number" && Number.isFinite(body.contentLength)
      ? body.contentLength
      : 0;

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json({ message: "Formato de archivo no permitido. Solo se aceptan PDF y Word." }, { status: 400 });
  }

  if (contentLength <= 0 || contentLength > MAX_RESUME_SIZE_BYTES) {
    return NextResponse.json({ message: "El archivo debe pesar menos de 10 MB." }, { status: 400 });
  }

  try {
    const { bucket, region, publicBaseUrl, accessKeyId, secretAccessKey } = getBucketConfig();
    const key = `resumes/${session.userId}/${randomUUID()}.${extensionForContentType(contentType)}`;
    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    const publicUrl = publicBaseUrl
      ? `${publicBaseUrl.replace(/\/$/, "")}/${key}`
      : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return NextResponse.json({ uploadUrl, key, publicUrl });
  } catch (error: any) {
    console.error("Error generating presigned URL for resume:", error);
    return NextResponse.json({ message: error.message || "Error al generar la URL de subida." }, { status: 500 });
  }
}
