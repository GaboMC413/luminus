import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

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
    if (!body || !body.categoryId || !body.name || typeof body.name !== "string") {
      return NextResponse.json({ message: "Categoría y nombre de área de especialista son obligatorios." }, { status: 400 });
    }

    const name = body.name.trim();
    const slug = slugify(name);

    const { prisma } = await import("@/lib/db");

    const count = await prisma.specialistArea.count({
      where: { categoryId: body.categoryId },
    });

    const specialistArea = await prisma.specialistArea.create({
      data: {
        categoryId: body.categoryId,
        name,
        slug,
        sortOrder: count,
        isActive: true,
      },
    });

    return NextResponse.json({ specialistArea });
  } catch (error: any) {
    console.error("Failed to create specialist area:", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ message: "Ya existe un área de especialista con ese nombre o slug." }, { status: 400 });
    }
    return NextResponse.json({ message: "Error al crear el área de especialista." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = getCurrentSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.id) {
      return NextResponse.json({ message: "ID de área obligatorio." }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (typeof body.name === "string" && body.name.trim()) {
      updateData.name = body.name.trim();
      updateData.slug = slugify(body.name.trim());
    }
    if (typeof body.categoryId === "string") updateData.categoryId = body.categoryId;
    if (typeof body.isActive === "boolean") updateData.isActive = body.isActive;
    if (typeof body.sortOrder === "number") updateData.sortOrder = body.sortOrder;

    const { prisma } = await import("@/lib/db");

    const specialistArea = await prisma.specialistArea.update({
      where: { id: body.id },
      data: updateData,
    });

    return NextResponse.json({ specialistArea });
  } catch (error) {
    console.error("Failed to update specialist area:", error);
    return NextResponse.json({ message: "Error al actualizar el área de especialista." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = getCurrentSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID de área obligatorio." }, { status: 400 });
    }

    const { prisma } = await import("@/lib/db");

    await prisma.specialistArea.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete specialist area:", error);
    return NextResponse.json({ message: "Error al eliminar el área de especialista." }, { status: 500 });
  }
}
