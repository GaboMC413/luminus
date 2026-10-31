import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { getCurrentActiveUser } from "@/lib/auth/session";
import { getStorageConfig, getS3Client, getS3PublicUrl } from "@/lib/storage/s3Client";

export const runtime = "nodejs";

const ALLOWED_CONTENT_TYPE = "image/webp";
const MAX_POST_IMAGE_SIZE_BYTES = 1 * 1024 * 1024; // Strictly <= 1 MB

export async function POST(request: Request) {
  try {
    const session = await getCurrentActiveUser();

    if (!session || !session.userId) {
      return NextResponse.json(
        { message: "No autorizado. Inicia sesión para publicar." },
        { status: 401 }
      );
    }

    const { bucket } = getStorageConfig();
    const s3 = getS3Client();

    const reqContentType = request.headers.get("content-type") || "";

    // Direct Multipart/FormData upload branch
    if (reqContentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ message: "No se envió ningún archivo." }, { status: 400 });
      }

      if (file.size > MAX_POST_IMAGE_SIZE_BYTES) {
        return NextResponse.json({ message: "La imagen excede el límite permitido de 1 MB." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const key = `feed/${session.userId}/${randomUUID()}.webp`;

      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: ALLOWED_CONTENT_TYPE,
          CacheControl: "public, max-age=31536000, immutable",
        })
      );

      const publicUrl = getS3PublicUrl(key);
      return NextResponse.json({ publicUrl, key, sizeBytes: file.size });
    }

    // Presigned PUT URL generation branch
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

    // User-scoped folder structure inside feed: feed/${userId}/${randomUUID()}.webp
    const key = `feed/${session.userId}/${randomUUID()}.webp`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 120 });
    const publicUrl = getS3PublicUrl(key);

    return NextResponse.json({ uploadUrl, key, publicUrl });
  } catch (err: any) {
    console.error("[S3 Post Image Upload Route Error]:", err);
    return NextResponse.json(
      { message: err?.message || "Error al procesar la subida de imagen." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentActiveUser();

    if (!session || !session.userId) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl : "";

    if (!imageUrl) {
      return NextResponse.json({ message: "URL de imagen no provista." }, { status: 400 });
    }

    const { deleteS3FileByUrl } = await import("@/lib/storage/s3FileCleanup");
    const deleted = await deleteS3FileByUrl(imageUrl, {
      expectedUserId: session.userId,
      expectedFolder: "feed",
    });

    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    console.error("[S3 Post Image Delete Route Error]:", err);
    return NextResponse.json({ message: "Error al eliminar la imagen." }, { status: 500 });
  }
}
