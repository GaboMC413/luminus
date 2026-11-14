import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

const LEGACY_ICON_UPGRADE: Record<string, string> = {
  sunny: "sun",
  mood: "smile",
  stethoscope: "heart-pulse",
  ecg_heart: "heart-pulse",
  directions_run: "dumbbell",
  exercise: "dumbbell",
  nutrition: "apple",
  self_improvement: "sparkle",
  person_celebrate: "blend",
  join_inner: "blend",
  spa: "flower",
  label: "tag",
};

const LEGACY_COLOR_UPGRADE: Record<string, { color: string; bgColor: string }> = {
  "#F59E0B": { color: "#D97706", bgColor: "#FFFBEB" },
  "#B45309": { color: "#D97706", bgColor: "#FFFBEB" },
  "#F472B6": { color: "#DB2777", bgColor: "#FDF2F8" },
  "#BE185D": { color: "#DB2777", bgColor: "#FDF2F8" },
  "#0450FB": { color: "#2563EB", bgColor: "#EFF6FF" },
  "#1D4ED8": { color: "#2563EB", bgColor: "#EFF6FF" },
  "#EF4444": { color: "#DC2626", bgColor: "#FEF2F2" },
  "#BE123C": { color: "#DC2626", bgColor: "#FEF2F2" },
  "#84CC16": { color: "#4D7C0F", bgColor: "#F7FEE7" },
  "#6D28D9": { color: "#9333EA", bgColor: "#FAF5FF" },
  "#7E22CE": { color: "#9333EA", bgColor: "#FAF5FF" },
  "#F97316": { color: "#EA580C", bgColor: "#FFF7ED" },
  "#C2410C": { color: "#EA580C", bgColor: "#FFF7ED" },
  "#14B8A6": { color: "#0F766E", bgColor: "#F0FDFA" },
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/db");

    const categories = await prisma.interestCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        interests: {
          orderBy: { sortOrder: "asc" },
        },
        specialistAreas: {
          orderBy: { sortOrder: "asc" },
        },
        categorySuggestions: {
          where: { status: "pending" },
        },
      },
    });

    const suggestions = await prisma.categorySuggestion.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                fullName: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const normalizedCategories = await Promise.all(
      categories.map(async (cat) => {
        const rawIcon = (cat.icon || "tag").trim().toLowerCase();
        const nextIcon = LEGACY_ICON_UPGRADE[rawIcon] || rawIcon;
        const rawColor = (cat.color || "#2563EB").trim().toUpperCase();
        const upgradedColors = LEGACY_COLOR_UPGRADE[rawColor];
        const nextColor = upgradedColors ? upgradedColors.color : cat.color || "#2563EB";
        const nextBgColor = upgradedColors ? upgradedColors.bgColor : cat.bgColor || "#EFF6FF";

        if (nextIcon !== cat.icon || nextColor !== cat.color || nextBgColor !== cat.bgColor) {
          await prisma.interestCategory
            .update({
              where: { id: cat.id },
              data: { icon: nextIcon, color: nextColor, bgColor: nextBgColor },
            })
            .catch(() => {});
        }

        return {
          ...cat,
          icon: nextIcon,
          color: nextColor,
          bgColor: nextBgColor,
        };
      })
    );

    return NextResponse.json({ categories: normalizedCategories, suggestions });
  } catch (error) {
    console.error("Failed to fetch admin categories:", error);
    return NextResponse.json({ message: "Error al obtener categorías." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.name || typeof body.name !== "string") {
      return NextResponse.json({ message: "El nombre de la categoría es obligatorio." }, { status: 400 });
    }

    const name = body.name.trim();
    const slug = slugify(name);
    const icon = typeof body.icon === "string" ? body.icon.trim() : "label";
    const iconFilled = body.iconFilled !== false;
    const color = typeof body.color === "string" ? body.color.trim() : "#3B82F6";
    const bgColor = typeof body.bgColor === "string" ? body.bgColor.trim() : "#DBEAFE";

    const { prisma } = await import("@/lib/db");

    const count = await prisma.interestCategory.count();

    const category = await prisma.interestCategory.create({
      data: {
        name,
        slug,
        icon,
        iconFilled,
        color,
        bgColor,
        sortOrder: count,
      },
      include: {
        interests: true,
        specialistAreas: true,
      },
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    console.error("Failed to create category:", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ message: "Ya existe una categoría con ese nombre." }, { status: 400 });
    }
    return NextResponse.json({ message: "Error al crear la categoría." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return PATCH(request);
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.id) {
      return NextResponse.json({ message: "ID de categoría obligatorio." }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (typeof body.name === "string" && body.name.trim()) {
      updateData.name = body.name.trim();
      updateData.slug = slugify(body.name.trim());
    }
    if (typeof body.icon === "string") updateData.icon = body.icon.trim();
    if (typeof body.iconFilled === "boolean") updateData.iconFilled = body.iconFilled;
    if (typeof body.color === "string") updateData.color = body.color.trim();
    if (typeof body.bgColor === "string") updateData.bgColor = body.bgColor.trim();
    if (typeof body.sortOrder === "number") updateData.sortOrder = body.sortOrder;

    const { prisma } = await import("@/lib/db");

    const category = await prisma.interestCategory.update({
      where: { id: body.id },
      data: updateData,
      include: {
        interests: true,
        specialistAreas: true,
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json({ message: "Error al actualizar la categoría." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID de categoría obligatorio." }, { status: 400 });
    }

    const { prisma } = await import("@/lib/db");

    await prisma.interestCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json({ message: "Error al eliminar la categoría." }, { status: 500 });
  }
}
