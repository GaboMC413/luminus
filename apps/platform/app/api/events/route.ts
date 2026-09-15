import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Only return active upcoming events
    const events = await prisma.event.findMany({
      where: {
        isUpcoming: true,
      },
      orderBy: { date: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        speakerName: true,
        speakerBio: true,
        category: true,
        coverUrl: true,
        date: true,
        timeText: true,
        location: true,
        link: true,
        isUpcoming: true,
      },
    });

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("[Platform /api/events Error]:", error);
    return NextResponse.json({ events: [], error: "Error al obtener eventos." }, { status: 500 });
  }
}
