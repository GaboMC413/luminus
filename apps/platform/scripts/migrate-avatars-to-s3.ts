import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "../lib/db";

const s3Client = new S3Client({
  region: process.env.S3_AVATAR_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_AVATAR_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_AVATAR_SECRET_ACCESS_KEY || "",
  },
});

const S3_BUCKET = process.env.S3_AVATAR_BUCKET || "luminus-dev-avatars";
const PUBLIC_BASE_URL = process.env.S3_AVATAR_PUBLIC_BASE_URL || `https://${S3_BUCKET}.s3.us-east-1.amazonaws.com`;

async function migrateAvatars() {
  console.log(`🚀 Iniciando migración de avatares Base64 a AWS S3 (${S3_BUCKET})...\n`);

  const profiles = await prisma.userProfile.findMany({
    where: {
      avatarUrl: {
        startsWith: "data:image/",
      },
    },
    select: {
      userId: true,
      firstName: true,
      lastName: true,
      fullName: true,
      avatarUrl: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  console.log(`🔍 Encontrados ${profiles.length} perfiles con foto Base64 para migrar.`);

  let migratedCount = 0;
  let errorCount = 0;

  for (const p of profiles) {
    if (!p.avatarUrl) continue;

    const name = p.fullName || `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.userId;

    try {
      const matches = p.avatarUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        console.warn(`⚠️ No se pudo decodificar el formato Base64 para ${name} (${p.userId})`);
        errorCount++;
        continue;
      }

      const [, format, base64Data] = matches;
      const ext = format === "jpeg" ? "jpg" : format;
      const contentType = `image/${format}`;
      const imageBuffer = Buffer.from(base64Data, "base64");
      const key = `avatars/migrated/${p.userId}.${ext}`;

      // 1. Upload to AWS S3
      await s3Client.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
          Body: imageBuffer,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000, immutable",
        })
      );

      const s3Url = `${PUBLIC_BASE_URL}/${key}`;

      // 2. Update PostgreSQL UserProfile avatarUrl
      await prisma.userProfile.update({
        where: { userId: p.userId },
        data: { avatarUrl: s3Url },
      });

      migratedCount++;
      console.log(`  ✅ Migrado [${name}] -> S3 URL: ${s3Url}`);
    } catch (err) {
      errorCount++;
      console.error(`  ❌ Error al migrar a [${name}] (${p.userId}):`, err);
    }
  }

  console.log(`\n🎉 PROCESO DE MIGRACIÓN FINALIZADO`);
  console.log(`  - Exitosos: ${migratedCount}`);
  console.log(`  - Errores: ${errorCount}`);
  console.log(`  - Total procesados: ${profiles.length}`);
}

migrateAvatars()
  .catch((err) => {
    console.error("❌ Error grave durante la migración:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
