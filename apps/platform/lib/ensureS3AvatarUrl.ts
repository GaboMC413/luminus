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
    const key = `avatars/migrated/${userId || "user"}_${Date.now()}.${ext}`;

    const s3 = new S3Client({
      region: process.env.S3_AVATAR_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.S3_AVATAR_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_AVATAR_SECRET_ACCESS_KEY || "",
      },
    });

    const bucket = process.env.S3_AVATAR_BUCKET || "luminus-dev-avatars";
    const baseUrl = process.env.S3_AVATAR_PUBLIC_BASE_URL || `https://${bucket}.s3.us-east-1.amazonaws.com`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: `image/${format}`,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    console.log(`[AVATAR_S3_GUARD] Successfully converted Base64 avatar to S3 URL for user ${userId}`);
    return `${baseUrl}/${key}`;
  } catch (err) {
    console.error("[AVATAR_S3_GUARD] Failed to convert Base64 avatar to S3:", err);
    return avatarUrl;
  }
}
