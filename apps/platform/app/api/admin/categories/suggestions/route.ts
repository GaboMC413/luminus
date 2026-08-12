import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  const session = getCurrentSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.id || !body.action) {
      return NextResponse.json({ message: "ID de sugerencia y acción obligatorios." }, { status: 400 });
    }

    const { id, action, categoryId, targetType, customName } = body;


    const suggestion = await prisma.categorySuggestion.findUnique({
      where: { id },
    });

    if (!suggestion) {
      return NextResponse.json({ message: "Sugerencia no encontrada." }, { status: 404 });
    }

    if (action === "reject") {
      await prisma.categorySuggestion.update({
        where: { id },
        data: { status: "rejected" },
      });
      return NextResponse.json({ success: true, message: "Sugerencia rechazada." });
    }

    if (action === "approve") {
      if (!categoryId) {
        return NextResponse.json({ message: "Debes seleccionar una categoría destino." }, { status: 400 });
      }

      const nameToUse = (customName || suggestion.name).trim();
      const slug = slugify(nameToUse);
      const typeToCreate = targetType || (suggestion.type === "SPECIALIST_AREA" ? "SPECIALIST_AREA" : "USER_INTEREST");

      if (typeToCreate === "SPECIALIST_AREA") {
        const count = await prisma.specialistArea.count({ where: { categoryId } });
        await prisma.specialistArea.upsert({
          where: { slug },
          update: { categoryId, name: nameToUse, isActive: true },
          create: { categoryId, name: nameToUse, slug, sortOrder: count, isActive: true },
        });
      } else {
        const count = await prisma.interest.count({ where: { categoryId } });
        await prisma.interest.upsert({
          where: { slug },
          update: { categoryId, name: nameToUse, isActive: true },
          create: { categoryId, name: nameToUse, slug, sortOrder: count, isActive: true },
        });
      }

      await prisma.categorySuggestion.update({
        where: { id },
        data: {
          status: "approved",
          categoryId,
        },
      });

      return NextResponse.json({ success: true, message: "Sugerencia aprobada e incorporada." });
    }

    return NextResponse.json({ message: "Acción no válida." }, { status: 400 });
  } catch (error: any) {
    console.error("Failed to process suggestion:", error);
    return NextResponse.json({ message: "Error al procesar la sugerencia." }, { status: 500 });
  }
}
