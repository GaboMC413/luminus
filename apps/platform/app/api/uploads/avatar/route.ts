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

  let bucket =
    process.env.S3_STORAGE_BUCKET?.trim() ||
    process.env.S3_BUCKET?.trim() ||
    process.env.S3_AVATAR_BUCKET?.trim() ||
    "luminus-storage-prod-905418193825-us-east-1-an";
  if (bucket === "luminus-storage-prod" || bucket === "luminus-dev-avatars") {
    bucket = "luminus-storage-prod-905418193825-us-east-1-an";
  }
  const region = process.env.S3_STORAGE_REGION?.trim() || process.env.S3_REGION?.trim() || process.env.S3_AVATAR_REGION?.trim() || "us-east-1";
  let publicBaseUrl =
    process.env.S3_STORAGE_PUBLIC_BASE_URL?.trim() ||
    process.env.S3_PUBLIC_BASE_URL?.trim() ||
    process.env.S3_AVATAR_PUBLIC_BASE_URL?.trim();
  if (publicBaseUrl && publicBaseUrl.includes("luminus-storage-prod.s3")) {
    publicBaseUrl = publicBaseUrl.replace("luminus-storage-prod.s3", "luminus-storage-prod-905418193825-us-east-1-an.s3");
  }
  const accessKeyId =
    process.env.S3_STORAGE_ACCESS_KEY_ID?.trim() ||
    process.env.S3_ACCESS_KEY_ID?.trim() ||
    process.env.S3_AVATAR_ACCESS_KEY_ID?.trim() ||
    process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey =
    process.env.S3_STORAGE_SECRET_ACCESS_KEY?.trim() ||
    process.env.S3_SECRET_ACCESS_KEY?.trim() ||
    process.env.S3_AVATAR_SECRET_ACCESS_KEY?.trim() ||
    process.env.AWS_SECRET_ACCESS_KEY?.trim();

  if (!bucket) {
    return NextResponse.json({ message: "S3_BUCKET no está configurado." }, { status: 500 });
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
