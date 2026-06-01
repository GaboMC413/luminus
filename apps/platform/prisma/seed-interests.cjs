const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const categories = [
  {
    title: "Crecimiento Personal",
    items: [
      "Propósito de vida",
      "Cambios de vida",
      "Motivación",
      "Toma de decisiones",
      "Autoconocimiento",
      "Confianza personal",
      "Aprendizaje continuo",
      "Hábitos conscientes",
    ],
  },
  {
    title: "Bienestar Emocional",
    items: [
      "Bienestar emocional",
      "Equilibrio emocional",
      "Calma interior",
      "Acompañamiento personal",
      "Gestión emocional",
      "Relaciones saludables",
      "Comunicación consciente",
      "Autoestima",
    ],
  },
  {
    title: "Salud y Medicina",
    items: [
      "Salud integral",
      "Bienestar físico",
      "Prevención",
      "Longevidad",
      "Dolor crónico",
      "Manejo del dolor",
      "Recuperación",
      "Alergias",
      "Salud hormonal",
      "Inmunidad",
      "Salud digestiva",
      "Peso saludable",
      "Salud cardiovascular",
      "Salud metabólica",
      "Salud sexual",
      "Fertilidad",
      "Embarazo",
    ],
  },
  {
    title: "Movimiento Físico",
    items: [
      "Cuidado del cuerpo",
      "Entrenamiento funcional",
      "Postura y movilidad",
      "Fuerza",
      "Masa muscular",
      "Resistencia",
      "Movimiento consciente",
      "Cardio",
      "Yoga y Pilates",
    ],
  },
  {
    title: "Nutrición",
    items: [
      "Alimentación saludable",
      "Nutrición diaria",
      "Alimentación consciente",
      "Cocina práctica",
      "Alimentación vegetal",
      "Suplementación",
      "Vitaminas",
      "Hidratación",
    ],
  },
  {
    title: "Estilo de Vida",
    items: [
      "Autocuidado",
      "Calidad de vida",
      "Rutinas saludables",
      "Organización personal",
      "Sueño reparador",
      "Descanso",
      "Balance vida personal",
      "Sustentabilidad",
    ],
  },
  {
    title: "Espiritualidad y Conexión",
    items: [
      "Atención plena",
      "Meditación",
      "Conexión interior",
      "Espiritualidad",
      "Experiencias conscientes",
      "Naturaleza",
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

  for (const [categoryIndex, category] of categories.entries()) {
    const savedCategory = await prisma.interestCategory.upsert({
      where: { slug: slugify(category.title) },
      update: {
        name: category.title,
        sortOrder: categoryIndex,
      },
      create: {
        name: category.title,
        slug: slugify(category.title),
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
  }

  console.log(`Seeded ${categories.length} interest categories and ${interestCount} interests.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
