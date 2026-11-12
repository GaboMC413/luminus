import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
        specialistAreas: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    const result = categories
      .filter((cat) => cat.name !== "Otro" && cat.name !== "Otros")
      .map((cat) => {
        const rawIcon = (cat.icon || "tag").trim().toLowerCase();
        const icon = LEGACY_ICON_UPGRADE[rawIcon] || rawIcon;
        const rawColor = (cat.color || "#2563EB").trim().toUpperCase();
        const upgradedColors = LEGACY_COLOR_UPGRADE[rawColor];
        return {
          id: cat.id,
          title: cat.name,
          slug: cat.slug,
          icon,
          iconFilled: cat.iconFilled,
          color: upgradedColors ? upgradedColors.color : cat.color || "#2563EB",
          bgColor: upgradedColors ? upgradedColors.bgColor : cat.bgColor || "#EFF6FF",
          items: cat.interests
            .map((item: any) => item.name)
            .filter((name: string) => name !== "Otro" && name !== "Otros"),
          specialistAreas: (cat.specialistAreas || []).map((area: any) => area.name),
        };
      });

    return NextResponse.json({ categories: result });
  } catch (error) {
    console.error("Failed to fetch public categories:", error);
    return NextResponse.json({ categories: [] });
  }
}
