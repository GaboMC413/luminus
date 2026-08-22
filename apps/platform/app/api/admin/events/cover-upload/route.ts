import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

const ALLOWED_CONTENT_TYPES = new Set(["image/webp", "image/png", "image/jpeg", "image/jpg"]);
const MAX_COVER_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function getBucketConfig() {
  const bucket = process.env.S3_EVENTS_BUCKET || process.env.S3_AVATAR_BUCKET;
  const region = process.env.S3_AVATAR_REGION ?? process.env.AWS_REGION ?? "us-east-1";
  const publicBaseUrl = process.env.S3_EVENTS_PUBLIC_BASE_URL || process.env.S3_AVATAR_PUBLIC_BASE_URL;
  const accessKeyId = process.env.S3_AVATAR_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_AVATAR_SECRET_ACCESS_KEY;

  if (!bucket) {
    throw new Error("S3 bucket is not configured.");
  }

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("S3 upload credentials are not configured.");
  }

  return { bucket, region, publicBaseUrl, accessKeyId, secretAccessKey };
}

function extensionForContentType(contentType: string) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/jpeg" || contentType === "image/jpg") return "jpg";
  return "webp";
}

export async function POST(request: Request) {
  try {
    const session = getCurrentSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const contentType = typeof body?.contentType === "string" ? body.contentType : "image/jpeg";
    const contentLength =
      typeof body?.contentLength === "number" && Number.isFinite(body.contentLength)
        ? body.contentLength
        : 0;

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return NextResponse.json({ message: "Formato de imagen no permitido (solo PNG, JPG, WebP)." }, { status: 400 });
    }

    if (contentLength <= 0 || contentLength > MAX_COVER_SIZE_BYTES) {
      return NextResponse.json({ message: "La portada debe pesar menos de 5 MB." }, { status: 400 });
    }

    const { bucket, region, publicBaseUrl, accessKeyId, secretAccessKey } = getBucketConfig();
    const key = `event-covers/${randomUUID()}.${extensionForContentType(contentType)}`;
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

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 120 });
    const publicUrl = publicBaseUrl
      ? `${publicBaseUrl.replace(/\/$/, "")}/${key}`
      : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return NextResponse.json({ uploadUrl, key, publicUrl });
  } catch (err: any) {
    console.error("[S3 Event Cover Upload Route Error]:", err);
    return NextResponse.json({ message: err?.message || "Error al obtener URL presignada de S3." }, { status: 500 });
  }
}
