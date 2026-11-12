import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

const defaultCategories = [
  {
    title: "Crecimiento Personal",
    icon: "sun",
    iconFilled: true,
    color: "#D97706",
    bgColor: "#FFFBEB",
    items: ["Autoconocimiento", "Propósito", "Hábitos", "Creatividad", "Emprendimiento", "Desarrollo profesional"],
    specialistAreas: ["Coaching de vida", "Coaching ejecutivo", "Coaching ontológico", "Orientación vocacional", "Mentoría profesional", "Desarrollo de liderazgo", "Desarrollo organizacional", "Facilitación de procesos", "Formación en habilidades blandas"],
  },
  {
    title: "Bienestar Emocional",
    icon: "smile",
    iconFilled: true,
    color: "#DB2777",
    bgColor: "#FDF2F8",
    items: ["Autocuidado", "Autoestima", "Inteligencia emocional", "Gestión del estrés", "Resiliencia", "Salud mental"],
    specialistAreas: ["Psicología", "Psicoterapia", "Terapia cognitivo-conductual", "Terapia sistémica", "Terapia gestáltica", "Terapia humanista", "Psicología positiva", "Acompañamiento en duelo", "Arteterapia", "Musicoterapia"],
  },
  {
    title: "Salud Integral",
    icon: "heart-pulse",
    iconFilled: true,
    color: "#2563EB",
    bgColor: "#EFF6FF",
    items: ["Sueño", "Longevidad", "Salud digestiva", "Salud hormonal", "Prevención", "Bienestar corporal"],
    specialistAreas: ["Medicina general", "Medicina integrativa", "Medicina funcional", "Fisioterapia", "Terapia ocupacional", "Osteopatía", "Quiropraxia", "Medicina del dolor", "Medicina del sueño", "Ginecología", "Endocrinología"],
  },
  {
    title: "Movimiento Físico",
    icon: "dumbbell",
    iconFilled: true,
    color: "#DC2626",
    bgColor: "#FEF2F2",
    items: ["Entrenamiento", "Running", "Yoga", "Pilates", "Danza", "Senderismo", "Ciclismo", "Natación"],
    specialistAreas: ["Entrenamiento personal", "Entrenamiento funcional", "Entrenamiento de fuerza", "Preparación física", "Yoga", "Pilates", "Movilidad", "Danza", "Calistenia", "Entrenamiento postural", "Acondicionamiento físico"],
  },
  {
    title: "Nutrición",
    icon: "apple",
    iconFilled: true,
    color: "#4D7C0F",
    bgColor: "#F7FEE7",
    items: ["Alimentación consciente", "Alimentación vegetal", "Nutrición deportiva", "Cocina", "Suplementación"],
    specialistAreas: ["Nutrición clínica", "Nutrición deportiva", "Nutrición funcional", "Nutrición vegetariana", "Nutrición vegana", "Nutrición materno-infantil", "Nutrición digestiva", "Nutrición hormonal", "Psiconutrición", "Educación alimentaria"],
  },
  {
    title: "Espiritualidad",
    icon: "sparkle",
    iconFilled: true,
    color: "#9333EA",
    bgColor: "#FAF5FF",
    items: ["Meditación", "Mindfulness", "Respiración", "Filosofía", "Naturaleza", "Desarrollo espiritual"],
    specialistAreas: ["Meditación", "Mindfulness", "Respiración consciente", "Acompañamiento espiritual", "Filosofía práctica", "Prácticas contemplativas", "Sonoterapia", "Facilitación de retiros", "Desarrollo espiritual"],
  },
  {
    title: "Vínculos",
    icon: "blend",
    iconFilled: true,
    color: "#EA580C",
    bgColor: "#FFF7ED",
    items: ["Pareja", "Familia", "Amistad", "Crianza", "Sexualidad", "Comunidad", "Comunicación"],
    specialistAreas: ["Terapia de pareja", "Terapia familiar", "Sexología", "Terapia sexual", "Mediación familiar", "Orientación parental", "Psicología perinatal", "Acompañamiento en crianza", "Comunicación interpersonal"],
  },
  {
    title: "Terapias Complementarias",
    icon: "flower",
    iconFilled: true,
    color: "#0F766E",
    bgColor: "#F0FDFA",
    items: ["Acupuntura", "Ayurveda", "Reiki", "Masajes", "Aromaterapia", "Reflexología", "Sonoterapia", "Terapia floral"],
    specialistAreas: ["Acupuntura", "Medicina tradicional china", "Ayurveda", "Reiki", "Masoterapia", "Aromaterapia", "Reflexología", "Sonoterapia", "Terapia floral", "Terapias energéticas", "Biomagnetismo"],
  },
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST() {
  const session = await getCurrentSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/db");

    for (let categoryIndex = 0; categoryIndex < defaultCategories.length; categoryIndex++) {
      const category = defaultCategories[categoryIndex];
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

      const validSlugs = category.items.map(slugify);

      await prisma.interest.updateMany({
        where: {
          categoryId: savedCategory.id,
          slug: { notIn: validSlugs },
        },
        data: {
          isActive: false,
        },
      });

      for (let interestIndex = 0; interestIndex < category.items.length; interestIndex++) {
        const interestName = category.items[interestIndex];
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
      }

      for (let areaIndex = 0; areaIndex < category.specialistAreas.length; areaIndex++) {
        const areaName = category.specialistAreas[areaIndex];
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
      }
    }

    return NextResponse.json({ success: true, message: "Categorías e intereses sincronizados con el estándar LUMINUS." });
  } catch (error) {
    console.error("Failed to reset categories:", error);
    return NextResponse.json({ message: "Error al reestablecer las categorías." }, { status: 500 });
  }
}
