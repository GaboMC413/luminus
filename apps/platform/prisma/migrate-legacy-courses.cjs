const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...values] = trimmed.split("=");
        const val = values.join("=").replace(/^["']|["']$/g, "").trim();
        if (key && !process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    }
  }
}

loadEnvFile(path.resolve(__dirname, "../.env.local"));
loadEnvFile(path.resolve(__dirname, "../.env"));

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando migración de datos de legacyCourses a specialist_courses...");

  const profiles = await prisma.specialistProfile.findMany({
    where: {
      legacyCourses: {
        not: null,
      },
    },
  });

  console.log(`Se encontraron ${profiles.length} perfiles con posible información en legacyCourses.`);

  let totalMigrated = 0;
  let totalSkipped = 0;

  for (const profile of profiles) {
    const legacy = profile.legacyCourses;
    if (!Array.isArray(legacy) || legacy.length === 0) {
      continue;
    }

    const existingCourses = await prisma.specialistCourse.findMany({
      where: { userId: profile.userId },
      select: { name: true },
    });
    const existingNames = new Set(existingCourses.map((c) => c.name.toLowerCase()));

    for (const courseItem of legacy) {
      if (!courseItem) continue;

      let name = "";
      let description = "";
      let type = null;
      let modality = null;
      let url = null;
      let coverUrl = null;
      let institution = null;

      if (typeof courseItem === "string") {
        name = courseItem.trim();
      } else if (typeof courseItem === "object") {
        name = (courseItem.name || courseItem.title || courseItem.courseName || "").toString().trim();
        description = (courseItem.description || "").toString().trim();
        type = courseItem.type ? courseItem.type.toString().trim() : null;
        modality = courseItem.modality ? courseItem.modality.toString().trim() : null;
        url = courseItem.url ? courseItem.url.toString().trim() : null;
        coverUrl = courseItem.coverUrl ? courseItem.coverUrl.toString().trim() : null;
        institution = courseItem.institution ? courseItem.institution.toString().trim() : null;
      }

      if (!name) {
        continue;
      }

      if (existingNames.has(name.toLowerCase())) {
        totalSkipped += 1;
        continue;
      }

      await prisma.specialistCourse.create({
        data: {
          userId: profile.userId,
          name,
          description: description || name,
          type,
          modality,
          url,
          coverUrl,
          institution,
          isActive: true,
        },
      });

      existingNames.add(name.toLowerCase());
      totalMigrated += 1;
    }
  }

  console.log(`Migración completada. Cursos creados: ${totalMigrated}, omitidos por duplicados: ${totalSkipped}.`);
}

main()
  .catch((error) => {
    console.error("Error en migración de legacyCourses:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
