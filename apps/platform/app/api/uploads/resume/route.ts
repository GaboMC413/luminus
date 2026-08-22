import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import {
  ALLOWED_RESUME_CONTENT_TYPES,
  extensionForResumeContentType,
  getResumeStorageConfig,
  MAX_RESUME_SIZE_BYTES,
  normalizeResumeFileName,
} from "@/lib/resumeStorage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const contentType = typeof body?.contentType === "string" ? body.contentType : "application/pdf";
  const extension = extensionForResumeContentType(contentType);
  const contentLength =
    typeof body?.contentLength === "number" && Number.isFinite(body.contentLength)
      ? body.contentLength
      : 0;

  if (!ALLOWED_RESUME_CONTENT_TYPES.has(contentType) || !extension) {
    return NextResponse.json({ message: "Formato de archivo no permitido. Solo se aceptan PDF y Word." }, { status: 400 });
  }

  if (contentLength <= 0 || contentLength > MAX_RESUME_SIZE_BYTES) {
    return NextResponse.json({ message: "El archivo debe pesar menos de 10 MB." }, { status: 400 });
  }

  try {
    const { bucket, region, accessKeyId, secretAccessKey } = getResumeStorageConfig();
    const fileName = normalizeResumeFileName(body?.fileName, extension);
    const key = `resumes/${session.userId}/${randomUUID()}.${extension}`;
    const s3 = new S3Client({
      region,
      requestChecksumCalculation: "WHEN_REQUIRED",
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      CacheControl: "private, no-store",
      Metadata: {
        owner: session.userId,
        originalfilename: encodeURIComponent(fileName),
      },
    });
    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 60,
      unhoistableHeaders: new Set([
        "x-amz-meta-owner",
        "x-amz-meta-originalfilename",
      ]),
    });

    return NextResponse.json({ uploadUrl, key, fileName, contentType, contentLength, owner: session.userId });
  } catch (error: any) {
    console.error("Error generating presigned URL for resume:", error);
    return NextResponse.json({ message: error.message || "Error al generar la URL de subida." }, { status: 500 });
  }
}
