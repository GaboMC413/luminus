import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getStorageConfig, getS3Client, getS3PublicUrl } from "./storage/s3Client";

export async function ensureS3AvatarUrl(avatarUrl?: string | null, userId?: string): Promise<string | undefined> {
  if (!avatarUrl || typeof avatarUrl !== "string") {
    return avatarUrl || undefined;
  }

  // Handle remote ephemeral avatars (e.g. Facebook CDN expiring links)
  if (
    avatarUrl.startsWith("http") &&
    (avatarUrl.includes("fbsbx.com") || avatarUrl.includes("facebook.com") || avatarUrl.includes("fbcdn.net"))
  ) {
    try {
      const res = await fetch(avatarUrl);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = res.headers.get("content-type") || "image/jpeg";
        const ext = contentType.includes("png") ? "png" : "jpg";
        const key = `avatars/${userId || "user"}/avatar.${ext}`;

        const { bucket } = getStorageConfig();
        const s3 = getS3Client();

        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            CacheControl: "public, max-age=31536000, immutable",
          })
        );

        console.log(`[AVATAR_S3_GUARD] Successfully cached Facebook avatar to S3 for user ${userId} in ${key}`);
        return getS3PublicUrl(key);
      }
    } catch (err) {
      console.warn("[AVATAR_S3_GUARD] Failed to cache Facebook avatar to S3, using original URL:", err);
      return avatarUrl;
    }
  }

  if (!avatarUrl.startsWith("data:image/")) {
    return avatarUrl;
  }

  try {
    const matches = avatarUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return avatarUrl;

    const [, format, base64Data] = matches;
    const ext = format === "jpeg" ? "jpg" : format;
    const buffer = Buffer.from(base64Data, "base64");
    const key = `avatars/${userId || "user"}/avatar.${ext}`;

    const { bucket } = getStorageConfig();
    const s3 = getS3Client();

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: `image/${format}`,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    console.log(`[AVATAR_S3_GUARD] Successfully converted Base64 avatar to S3 URL for user ${userId} in ${key}`);
    return getS3PublicUrl(key);
  } catch (err) {
    console.error("[AVATAR_S3_GUARD] Failed to convert Base64 avatar to S3:", err);
    return avatarUrl;
  }
}
