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

const categories = [
  {
    title: "Crecimiento Personal",
    icon: "sunny",
    iconFilled: true,
    color: "#F59E0B",
    bgColor: "#FEF3C7",
    items: [
      "Autoconocimiento",
      "Propósito",
      "Hábitos",
      "Creatividad",
      "Emprendimiento",
      "Desarrollo profesional",
    ],
    specialistAreas: [
      "Coaching de vida",
      "Coaching ejecutivo",
      "Coaching ontológico",
      "Orientación vocacional",
      "Mentoría profesional",
      "Desarrollo de liderazgo",
      "Desarrollo organizacional",
      "Facilitación de procesos",
      "Formación en habilidades blandas",
    ],
  },
  {
    title: "Bienestar Emocional",
    icon: "mood",
    iconFilled: true,
    color: "#F472B6",
    bgColor: "#FBCFE8",
    items: [
      "Autocuidado",
      "Autoestima",
      "Inteligencia emocional",
      "Gestión del estrés",
      "Resiliencia",
      "Salud mental",
    ],
    specialistAreas: [
      "Psicología",
      "Psicoterapia",
      "Terapia cognitivo-conductual",
      "Terapia sistémica",
      "Terapia gestáltica",
      "Terapia humanista",
      "Psicología positiva",
      "Acompañamiento en duelo",
      "Arteterapia",
      "Musicoterapia",
    ],
  },
  {
    title: "Salud Integral",
    icon: "stethoscope",
    iconFilled: true,
    color: "#2563EB",
    bgColor: "#DBEAFE",
    items: [
      "Sueño",
      "Longevidad",
      "Salud digestiva",
      "Salud hormonal",
      "Prevención",
      "Bienestar corporal",
    ],
    specialistAreas: [
      "Medicina general",
      "Medicina integrativa",
      "Medicina funcional",
      "Fisioterapia",
      "Terapia ocupacional",
      "Osteopatía",
      "Quiropraxia",
      "Medicina del dolor",
      "Medicina del sueño",
      "Ginecología",
      "Endocrinología",
    ],
  },
  {
    title: "Movimiento Físico",
    icon: "directions_run",
    iconFilled: true,
    color: "#EF4444",
    bgColor: "#FECACA",
    items: [
      "Entrenamiento",
      "Running",
      "Yoga",
      "Pilates",
      "Danza",
      "Senderismo",
      "Ciclismo",
      "Natación",
    ],
    specialistAreas: [
      "Entrenamiento personal",
      "Entrenamiento funcional",
      "Entrenamiento de fuerza",
      "Preparación física",
      "Yoga",
      "Pilates",
      "Movilidad",
      "Danza",
      "Calistenia",
      "Entrenamiento postural",
      "Acondicionamiento físico",
    ],
  },
  {
    title: "Nutrición",
    icon: "nutrition",
    iconFilled: true,
    color: "#84CC16",
    bgColor: "#ECFCCB",
    items: [
      "Alimentación consciente",
      "Alimentación vegetal",
      "Nutrición deportiva",
      "Cocina",
      "Suplementación",
    ],
    specialistAreas: [
      "Nutrición clínica",
      "Nutrición deportiva",
      "Nutrición funcional",
      "Nutrición vegetariana",
      "Nutrición vegana",
      "Nutrición materno-infantil",
      "Nutrición digestiva",
      "Nutrición hormonal",
      "Psiconutrición",
      "Educación alimentaria",
    ],
  },
  {
    title: "Espiritualidad",
    icon: "self_improvement",
    iconFilled: true,
    color: "#6D28D9",
    bgColor: "#EDE9FE",
    items: [
      "Meditación",
      "Mindfulness",
      "Respiración",
      "Filosofía",
      "Naturaleza",
      "Desarrollo espiritual",
    ],
    specialistAreas: [
      "Meditación",
      "Mindfulness",
      "Respiración consciente",
      "Acompañamiento espiritual",
      "Filosofía práctica",
      "Prácticas contemplativas",
      "Sonoterapia",
      "Facilitación de retiros",
      "Desarrollo espiritual",
    ],
  },
  {
    title: "Vínculos",
    icon: "person_celebrate",
    iconFilled: true,
    color: "#F97316",
    bgColor: "#FECACA",
    items: [
      "Pareja",
      "Familia",
      "Amistad",
      "Crianza",
      "Sexualidad",
      "Comunidad",
      "Comunicación",
    ],
    specialistAreas: [
      "Terapia de pareja",
      "Terapia familiar",
      "Sexología",
      "Terapia sexual",
      "Mediación familiar",
      "Orientación parental",
      "Psicología perinatal",
      "Acompañamiento en crianza",
      "Comunicación interpersonal",
    ],
  },
  {
    title: "Terapias Complementarias",
    icon: "spa",
    iconFilled: true,
    color: "#14B8A6",
    bgColor: "#CCFBF1",
    items: [
      "Acupuntura",
      "Ayurveda",
      "Reiki",
      "Masajes",
      "Aromaterapia",
      "Reflexología",
      "Sonoterapia",
      "Terapia floral",
    ],
    specialistAreas: [
      "Acupuntura",
      "Medicina tradicional china",
      "Ayurveda",
      "Reiki",
      "Masoterapia",
      "Aromaterapia",
      "Reflexología",
      "Sonoterapia",
      "Terapia floral",
      "Terapias energéticas",
      "Biomagnetismo",
    ],
  },
];

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  let interestCount = 0;
  let areaCount = 0;

  for (const [categoryIndex, category] of categories.entries()) {
    const savedCategory = await prisma.interestCategory.upsert({
      where: { slug: slugify(category.title) },
      update: {
        name: category.title,
        icon: category.icon,
        iconFilled: category.iconFilled,
        color: category.color,
        bgColor: category.bgColor,
        sortOrder: categoryIndex,
      },
      create: {
        name: category.title,
        slug: slugify(category.title),
        icon: category.icon,
        iconFilled: category.iconFilled,
        color: category.color,
        bgColor: category.bgColor,
        sortOrder: categoryIndex,
      },
    });

    for (const [interestIndex, interestName] of category.items.entries()) {
      await prisma.interest.upsert({
        where: { slug: slugify(interestName) },
        update: {
          categoryId: savedCategory.id,
          name: interestName,
          sortOrder: interestIndex,
          isActive: true,
        },
        create: {
          categoryId: savedCategory.id,
          name: interestName,
          slug: slugify(interestName),
          sortOrder: interestIndex,
          isActive: true,
        },
      });
      interestCount += 1;
    }

    for (const [areaIndex, areaName] of (category.specialistAreas || []).entries()) {
      await prisma.specialistArea.upsert({
        where: { slug: slugify(areaName) },
        update: {
          categoryId: savedCategory.id,
          name: areaName,
          sortOrder: areaIndex,
          isActive: true,
        },
        create: {
          categoryId: savedCategory.id,
          name: areaName,
          slug: slugify(areaName),
          sortOrder: areaIndex,
          isActive: true,
        },
      });
      areaCount += 1;
    }
  }

  console.log(`Seeded ${categories.length} categories, ${interestCount} user interests, and ${areaCount} specialist areas.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
