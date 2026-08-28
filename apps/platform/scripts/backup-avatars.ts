import fs from "fs";
import path from "path";
import { prisma } from "../lib/db";

async function runBackup() {
  const backupDir = path.join(process.cwd(), "..", "backups", "avatars-base64");
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`📁 Directorio de respaldo preparado en: ${backupDir}`);

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

  console.log(`\n🔍 Encontrados ${profiles.length} perfiles con foto Base64 en PostgreSQL.`);

  const manifest: Array<{
    userId: string;
    email: string;
    fullName: string;
    fileSaved: string;
    base64Length: number;
    avatarUrlOriginal: string;
  }> = [];

  let savedCount = 0;

  for (const p of profiles) {
    if (!p.avatarUrl) continue;

    const matches = p.avatarUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      console.warn(`⚠️ No se pudo parsear el formato Base64 para el usuario ${p.userId}`);
      continue;
    }

    const [, format, base64Data] = matches;
    const ext = format === "jpeg" ? "jpg" : format;
    const sanitizedName = (p.fullName || `${p.firstName || ""} ${p.lastName || ""}`)
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "_") || p.userId;

    const fileName = `${savedCount + 1}_${p.userId.slice(0, 8)}_${sanitizedName}.${ext}`;
    const filePath = path.join(backupDir, fileName);

    const imageBuffer = Buffer.from(base64Data, "base64");
    fs.writeFileSync(filePath, imageBuffer);

    manifest.push({
      userId: p.userId,
      email: p.user?.email || "",
      fullName: p.fullName || `${p.firstName || ""} ${p.lastName || ""}`.trim(),
      fileSaved: fileName,
      base64Length: p.avatarUrl.length,
      avatarUrlOriginal: p.avatarUrl,
    });

    savedCount++;
    console.log(`  ✅ Guardada foto de [${manifest[manifest.length - 1].fullName}] -> ${fileName} (${(imageBuffer.length / 1024).toFixed(1)} KB)`);
  }

  const manifestPath = path.join(backupDir, "backup-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

  console.log(`\n🎉 RESPALDO LOCAL COMPLETADO EXITOSAMENTE`);
  console.log(`  - Fotos guardadas: ${savedCount}`);
  console.log(`  - Manifest JSON: ${manifestPath}`);
}

runBackup()
  .catch((err) => {
    console.error("❌ Error en el proceso de respaldo:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
