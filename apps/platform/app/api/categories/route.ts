import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/db");

    const categories = await prisma.interestCategory.findMany({
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        interests: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    const result = categories
      .filter((cat) => cat.name !== "Otro" && cat.name !== "Otros")
      .map((cat) => ({
        id: cat.id,
        title: cat.name,
        slug: cat.slug,
        icon: cat.icon || "label",
        iconFilled: cat.iconFilled,
        color: cat.color || "#3B82F6",
        bgColor: cat.bgColor || "#DBEAFE",
        items: cat.interests.map((item: any) => item.name).filter((name: string) => name !== "Otro" && name !== "Otros"),
      }));

    return NextResponse.json({ categories: result });
  } catch (error) {
    console.error("Failed to fetch public categories:", error);
    return NextResponse.json({ categories: [] });
  }
}
