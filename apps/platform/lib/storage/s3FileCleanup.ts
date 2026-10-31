import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getStorageConfig, getS3Client } from "./s3Client";

export interface DeleteS3FileOptions {
  /**
   * If provided, validates that the S3 key belongs strictly to this user ID
   * (e.g. `avatars/${expectedUserId}/...` or `feed/${expectedUserId}/...`).
   * Prevents any user from deleting files owned by other users.
   */
  expectedUserId?: string;
  /**
   * Expected top-level folder prefix (e.g. 'avatars', 'feed', 'events/covers', 'resumes')
   */
  expectedFolder?: string;
}

/**
 * Safely deletes a specific file from our unified S3 bucket by its public URL or key.
 *
 * Safety Guardrails:
 * 1. Checks that the URL belongs strictly to our production/dev S3 bucket.
 * 2. Never deletes external URLs (Google OAuth avatars, Unsplash, external CDNs).
 * 3. Never deletes local assets (e.g. '/Profile Image...').
 * 4. Never deletes folder markers (keys ending with '/').
 * 5. If expectedUserId is provided, ensures key matches user-scoped folder.
 * 6. Isolated with try/catch so S3 errors never abort the parent transaction.
 *
 * @returns boolean indicating whether the file was matched and submitted for deletion.
 */
export async function deleteS3FileByUrl(
  fileUrl?: string | null,
  options?: DeleteS3FileOptions
): Promise<boolean> {
  if (!fileUrl || typeof fileUrl !== "string") {
    return false;
  }

  const { bucket, region, publicBaseUrl } = getStorageConfig();
  const s3Client = getS3Client();

  const trimmed = fileUrl.trim();

  // Guard: ignore base64 strings
  if (trimmed.startsWith("data:")) {
    return false;
  }

  // Guard: ignore local relative paths
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return false;
  }

  let key = "";

  // Check if it's a full URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);

      // Verify domain belongs to our S3 bucket
      const isOurS3 =
        parsed.hostname.includes(bucket) ||
        parsed.hostname === `${bucket}.s3.${region}.amazonaws.com` ||
        parsed.hostname === `${bucket}.s3.amazonaws.com` ||
        parsed.origin === new URL(publicBaseUrl).origin;

      if (!isOurS3) {
        // External URL (e.g. Google OAuth, Unsplash) - strictly ignore
        return false;
      }

      key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
    } catch {
      return false;
    }
  } else {
    // Relative S3 key (e.g. "avatars/123/avatar.webp")
    key = trimmed.replace(/^\/+/, "");
  }

  // Guard: Never delete folder markers
  if (!key || key.endsWith("/")) {
    return false;
  }

  // Guard: Validate allowed top-level prefixes
  const allowedPrefixes = ["avatars/", "feed/", "events/covers/", "resumes/"];
  const matchesPrefix = allowedPrefixes.some((p) => key.startsWith(p));
  if (!matchesPrefix) {
    console.warn(`[deleteS3FileByUrl] Key "${key}" does not match allowed prefixes. Ignored.`);
    return false;
  }

  // Guard: Validate folder constraint if specified
  if (options?.expectedFolder) {
    const expectedPrefix = options.expectedFolder.endsWith("/")
      ? options.expectedFolder
      : `${options.expectedFolder}/`;
    if (!key.startsWith(expectedPrefix)) {
      console.warn(`[deleteS3FileByUrl] Key "${key}" does not match expected folder "${expectedPrefix}". Ignored.`);
      return false;
    }
  }

  // Guard: Validate user ownership if specified
  if (options?.expectedUserId) {
    const parts = key.split("/");
    // Format: folder/userId/filename
    if (parts.length >= 3 && parts[1] !== options.expectedUserId) {
      console.warn(`[deleteS3FileByUrl] Security reject: user "${options.expectedUserId}" tried to delete key belonging to "${parts[1]}".`);
      return false;
    }
  }

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    console.log(`[deleteS3FileByUrl] Successfully deleted S3 file: ${key}`);
    return true;
  } catch (error: any) {
    console.error(`[deleteS3FileByUrl] Error deleting S3 file "${key}":`, error?.message || error);
    return false;
  }
}
