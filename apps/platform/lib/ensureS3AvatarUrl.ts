import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function ensureS3AvatarUrl(avatarUrl?: string | null, userId?: string): Promise<string | undefined> {
  if (!avatarUrl || typeof avatarUrl !== "string") {
    return avatarUrl || undefined;
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

    let bucket =
      process.env.S3_STORAGE_BUCKET?.trim() ||
      process.env.S3_BUCKET?.trim() ||
      process.env.S3_AVATAR_BUCKET?.trim() ||
      "luminus-storage-prod-905418193825-us-east-1-an";

    if (bucket === "luminus-storage-prod" || bucket === "luminus-dev-avatars") {
      bucket = "luminus-storage-prod-905418193825-us-east-1-an";
    }

    const region =
      process.env.S3_STORAGE_REGION?.trim() ||
      process.env.S3_REGION?.trim() ||
      process.env.S3_AVATAR_REGION?.trim() ||
      "us-east-1";

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

    const s3 = new S3Client({
      region,
      ...(accessKeyId && secretAccessKey
        ? { credentials: { accessKeyId, secretAccessKey } }
        : {}),
    });

    const baseUrl =
      process.env.S3_STORAGE_PUBLIC_BASE_URL?.trim() ||
      process.env.S3_PUBLIC_BASE_URL?.trim() ||
      `https://${bucket}.s3.${region}.amazonaws.com`;

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
    return `${baseUrl.replace(/\/$/, "")}/${key}`;
  } catch (err) {
    console.error("[AVATAR_S3_GUARD] Failed to convert Base64 avatar to S3:", err);
    return avatarUrl;
  }
}
