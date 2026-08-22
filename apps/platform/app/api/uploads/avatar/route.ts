import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

const ALLOWED_CONTENT_TYPES = new Set(["image/webp", "image/png", "image/jpeg"]);
const MAX_AVATAR_SIZE_BYTES = 3 * 1024 * 1024;

function extensionForContentType(contentType: string) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/jpeg") return "jpg";
  return "webp";
}

export async function POST(request: Request) {
  const session = getCurrentSession();

  const body = await request.json().catch(() => null);
  const contentType = typeof body?.contentType === "string" ? body.contentType : "image/webp";
  const contentLength =
    typeof body?.contentLength === "number" && Number.isFinite(body.contentLength)
      ? body.contentLength
      : 0;

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json({ message: "Formato de imagen no permitido." }, { status: 400 });
  }

  if (contentLength <= 0 || contentLength > MAX_AVATAR_SIZE_BYTES) {
    return NextResponse.json({ message: "La imagen debe pesar menos de 3 MB." }, { status: 400 });
  }

  const bucket = process.env.S3_AVATAR_BUCKET || process.env.S3_BUCKET;
  const region = process.env.S3_AVATAR_REGION || process.env.S3_REGION || "us-east-1";
  const publicBaseUrl = process.env.S3_AVATAR_PUBLIC_BASE_URL || process.env.S3_PUBLIC_BASE_URL;
  const accessKeyId = process.env.S3_AVATAR_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_AVATAR_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  if (!bucket) {
    return NextResponse.json({ message: "S3_AVATAR_BUCKET no está configurado." }, { status: 500 });
  }

  const userIdOrTemp = session?.userId || `temp-${randomUUID()}`;
  const key = `avatars/${userIdOrTemp}/${randomUUID()}.${extensionForContentType(contentType)}`;

  const s3 = new S3Client({
    region,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
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
}
