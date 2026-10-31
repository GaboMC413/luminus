import { S3Client } from "@aws-sdk/client-s3";

export interface S3StorageConfig {
  bucket: string;
  region: string;
  publicBaseUrl: string;
}

/**
 * Returns the normalized unified S3 storage configuration.
 *
 * Rules:
 * 1. Single source of truth for the entire application.
 * 2. Defaults safely to dev bucket ('luminus-storage-dev-905418193825-us-east-1-an')
 *    so local and non-configured environments NEVER accidentally write to production.
 * 3. Supports legacy alias normalization if shorthand names are passed.
 */
export function getStorageConfig(): S3StorageConfig {
  let bucket =
    process.env.S3_STORAGE_BUCKET?.trim() ||
    process.env.S3_BUCKET?.trim() ||
    process.env.S3_AVATAR_BUCKET?.trim() ||
    "luminus-storage-dev-905418193825-us-east-1-an";

  if (bucket === "luminus-storage-prod") {
    bucket = "luminus-storage-prod-905418193825-us-east-1-an";
  } else if (bucket === "luminus-storage-dev" || bucket === "luminus-dev-avatars") {
    bucket = "luminus-storage-dev-905418193825-us-east-1-an";
  }

  const region =
    process.env.S3_STORAGE_REGION?.trim() ||
    process.env.S3_REGION?.trim() ||
    process.env.S3_AVATAR_REGION?.trim() ||
    "us-east-1";

  const publicBaseUrl = (
    process.env.S3_STORAGE_PUBLIC_BASE_URL?.trim() ||
    process.env.S3_PUBLIC_BASE_URL?.trim() ||
    process.env.S3_AVATAR_PUBLIC_BASE_URL?.trim() ||
    `https://${bucket}.s3.${region}.amazonaws.com`
  ).replace(/\/$/, "");

  return { bucket, region, publicBaseUrl };
}

let cachedS3Client: S3Client | null = null;

/**
 * Returns an authenticated S3Client instance.
 */
export function getS3Client(): S3Client {
  if (cachedS3Client) {
    return cachedS3Client;
  }

  const { region } = getStorageConfig();

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

  cachedS3Client = new S3Client({
    region,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });

  return cachedS3Client;
}

/**
 * Returns the full public URL for a given S3 key.
 */
export function getS3PublicUrl(key: string): string {
  const { publicBaseUrl } = getStorageConfig();
  const cleanKey = key.replace(/^\/+/, "");
  return `${publicBaseUrl}/${cleanKey}`;
}
