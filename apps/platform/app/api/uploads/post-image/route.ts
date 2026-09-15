import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

const ALLOWED_CONTENT_TYPE = "image/webp";
const MAX_POST_IMAGE_SIZE_BYTES = 1 * 1024 * 1024; // Strictly <= 1 MB

export async function POST(request: Request) {
  try {
    const session = getCurrentSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { message: "No autorizado. Inicia sesión para publicar." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const contentType = typeof body?.contentType === "string" ? body.contentType : "";
    const contentLength =
      typeof body?.contentLength === "number" && Number.isFinite(body.contentLength)
        ? body.contentLength
        : 0;

    // Strict validation: WebP format only
    if (contentType !== ALLOWED_CONTENT_TYPE) {
      return NextResponse.json(
        { message: "Formato no permitido. La imagen debe estar optimizada en formato WebP." },
        { status: 400 }
      );
    }

    // Strict validation: max 1 MB
    if (contentLength <= 0 || contentLength > MAX_POST_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { message: "La imagen excede el límite permitido de 1 MB." },
        { status: 400 }
      );
    }

    const bucket =
      process.env.S3_STORAGE_BUCKET?.trim() ||
      process.env.S3_FEED_BUCKET?.trim() ||
      process.env.S3_BUCKET?.trim() ||
      "luminus-storage-prod-905418193825-us-east-1-an";

    const region =
      process.env.S3_STORAGE_REGION?.trim() ||
      process.env.S3_FEED_REGION?.trim() ||
      process.env.S3_REGION?.trim() ||
      "us-east-1";

    const publicBaseUrl =
      process.env.S3_STORAGE_PUBLIC_BASE_URL?.trim() ||
      process.env.S3_FEED_PUBLIC_BASE_URL?.trim() ||
      process.env.S3_PUBLIC_BASE_URL?.trim();

    const accessKeyId =
      process.env.S3_STORAGE_ACCESS_KEY_ID?.trim() ||
      process.env.S3_FEED_ACCESS_KEY_ID?.trim() ||
      process.env.AWS_ACCESS_KEY_ID?.trim();

    const secretAccessKey =
      process.env.S3_STORAGE_SECRET_ACCESS_KEY?.trim() ||
      process.env.S3_FEED_SECRET_ACCESS_KEY?.trim() ||
      process.env.AWS_SECRET_ACCESS_KEY?.trim();

    if (!accessKeyId || !secretAccessKey) {
      console.error("[Post Image Upload Route]: Missing S3_STORAGE_ACCESS_KEY_ID or AWS_ACCESS_KEY_ID");
      return NextResponse.json(
        { message: "El servicio de almacenamiento no está configurado." },
        { status: 500 }
      );
    }

    // User-scoped folder structure inside feed: feed/${userId}/${randomUUID()}.webp
    const key = `feed/${session.userId}/${randomUUID()}.webp`;

    const s3 = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
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
    console.error("[S3 Post Image Upload Route Error]:", err);
    return NextResponse.json(
      { message: err?.message || "Error al obtener autorización de subida." },
      { status: 500 }
    );
  }
}
