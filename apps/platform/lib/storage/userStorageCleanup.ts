import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getStorageConfig, getS3Client } from "./s3Client";

/**
 * Permanently deletes all AWS S3 folders and files associated with a given user
 * from the unified bucket (avatars, feed images, and resumes).
 * Called when an administrator deletes a user permanently from the admin manager.
 */
export async function deleteUserS3Data(userId: string): Promise<{ deletedCount: number }> {
  if (!userId || typeof userId !== "string") {
    return { deletedCount: 0 };
  }

  const { bucket } = getStorageConfig();
  const s3 = getS3Client();

  const prefixes = [
    `avatars/${userId}/`,
    `feed/${userId}/`,
    `resumes/${userId}/`,
  ];

  let totalDeleted = 0;

  for (const prefix of prefixes) {
    try {
      let isTruncated = true;
      let continuationToken: string | undefined = undefined;

      while (isTruncated) {
        const listRes: any = await s3.send(
          new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix,
            ContinuationToken: continuationToken,
          })
        );

        if (listRes.Contents && listRes.Contents.length > 0) {
          const objectsToDelete = listRes.Contents.map((item: any) => ({ Key: item.Key! }));
          await s3.send(
            new DeleteObjectsCommand({
              Bucket: bucket,
              Delete: { Objects: objectsToDelete },
            })
          );
          totalDeleted += objectsToDelete.length;
        }

        isTruncated = !!listRes.IsTruncated;
        continuationToken = listRes.NextContinuationToken;
      }
    } catch (err) {
      console.error(`[deleteUserS3Data] Error purging S3 prefix "${prefix}" for user "${userId}":`, err);
    }
  }

  console.log(`[deleteUserS3Data] Purged ${totalDeleted} S3 objects for user "${userId}".`);
  return { deletedCount: totalDeleted };
}
