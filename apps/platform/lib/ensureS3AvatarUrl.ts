import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getStorageConfig, getS3Client, getS3PublicUrl } from "./storage/s3Client";

const MAX_AVATAR_BYTES = 3 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function isTrustedFacebookAvatarHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return (
    lower === "graph.facebook.com" ||
    lower === "platform-lookaside.fbsbx.com" ||
    lower.endsWith(".fbsbx.com") ||
    lower.endsWith(".fbcdn.net")
  );
}

function isSafeStoredAvatarUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  if (trimmed.startsWith("blob:") && process.env.NODE_ENV !== "production") return true;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host.startsWith("169.254.")) return false;
    return true;
  } catch {
    return false;
  }
}

export async function ensureS3AvatarUrl(avatarUrl?: string | null, userId?: string): Promise<string | undefined> {
  if (!avatarUrl || typeof avatarUrl !== "string") {
    return avatarUrl || undefined;
  }

  const trimmed = avatarUrl.trim();
  if (!trimmed) {
    return "";
  }

  // Handle remote ephemeral avatars strictly from verified Facebook CDN HTTPS hosts
  if (trimmed.startsWith("https://")) {
    let parsedUrl: URL | null = null;
    try {
      parsedUrl = new URL(trimmed);
    } catch {
      return undefined;
    }

    if (parsedUrl.protocol === "https:" && isTrustedFacebookAvatarHost(parsedUrl.hostname)) {
      try {
        const res = await fetch(parsedUrl.href, {
          redirect: "error",
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const rawContentType = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
          const ext = ALLOWED_MIME_TYPES.get(rawContentType);
          if (!ext) {
            return undefined;
          }

          const arrayBuffer = await res.arrayBuffer();
          if (arrayBuffer.byteLength === 0 || arrayBuffer.byteLength > MAX_AVATAR_BYTES) {
            return undefined;
          }

          const buffer = Buffer.from(arrayBuffer);
          const safeUserId = userId ? userId.replace(/[^a-zA-Z0-9_-]/g, "") : "user";
          const key = `avatars/${safeUserId || "user"}/avatar.${ext}`;

          const { bucket } = getStorageConfig();
          const s3 = getS3Client();

          await s3.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: key,
              Body: buffer,
              ContentType: rawContentType === "image/jpg" ? "image/jpeg" : rawContentType,
              CacheControl: "public, max-age=31536000, immutable",
            })
          );

          console.log(`[AVATAR_S3_GUARD] Successfully cached Facebook avatar to S3 for user ${userId} in ${key}`);
          return getS3PublicUrl(key);
        }
      } catch (err) {
        console.warn("[AVATAR_S3_GUARD] Failed to cache Facebook avatar to S3, using original URL:", err);
        return parsedUrl.href;
      }
    }
  }

  if (!trimmed.startsWith("data:image/")) {
    return isSafeStoredAvatarUrl(trimmed) ? trimmed : undefined;
  }

  try {
    const matches = trimmed.match(/^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=\s]+)$/i);
    if (!matches) return undefined;

    const format = matches[1].toLowerCase();
    const base64Data = matches[2];
    const ext = format === "jpeg" || format === "jpg" ? "jpg" : format;
    const contentType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
    const buffer = Buffer.from(base64Data, "base64");

    if (buffer.byteLength === 0 || buffer.byteLength > MAX_AVATAR_BYTES) {
      return undefined;
    }

    const safeUserId = userId ? userId.replace(/[^a-zA-Z0-9_-]/g, "") : "user";
    const key = `avatars/${safeUserId || "user"}/avatar.${ext}`;

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

    console.log(`[AVATAR_S3_GUARD] Successfully converted Base64 avatar to S3 URL for user ${userId} in ${key}`);
    return getS3PublicUrl(key);
  } catch (err) {
    console.error("[AVATAR_S3_GUARD] Failed to convert Base64 avatar to S3:", err);
    return undefined;
  }
}
