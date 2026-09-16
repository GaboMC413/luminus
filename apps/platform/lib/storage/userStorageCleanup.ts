import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

/**
 * Permanently deletes all AWS S3 folders and files associated with a given user
 * from the unified production bucket (avatars, feed images, and resumes).
 * Called when an administrator deletes a user permanently from the admin manager.
 */
export async function deleteUserS3Data(userId: string): Promise<{ deletedCount: number }> {
  if (!userId || typeof userId !== "string") {
    return { deletedCount: 0 };
  }

  let bucket =
    process.env.S3_STORAGE_BUCKET?.trim() ||
    process.env.S3_BUCKET?.trim() ||
    "luminus-storage-prod-905418193825-us-east-1-an";

  if (bucket === "luminus-storage-prod" || bucket === "luminus-dev-avatars") {
    bucket = "luminus-storage-prod-905418193825-us-east-1-an";
  }

  const region =
    process.env.S3_STORAGE_REGION?.trim() ||
    process.env.S3_REGION?.trim() ||
    "us-east-1";

  const accessKeyId =
    process.env.S3_STORAGE_ACCESS_KEY_ID?.trim() ||
    process.env.S3_ACCESS_KEY_ID?.trim() ||
    process.env.AWS_ACCESS_KEY_ID?.trim();

  const secretAccessKey =
    process.env.S3_STORAGE_SECRET_ACCESS_KEY?.trim() ||
    process.env.S3_SECRET_ACCESS_KEY?.trim() ||
    process.env.AWS_SECRET_ACCESS_KEY?.trim();

  const s3 = new S3Client({
    region,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });

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
