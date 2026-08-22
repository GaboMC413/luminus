import { NextResponse } from "next/server";
import { prisma } from "@/lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.get("debug");

  if (debug === "1") {
    try {
      const count = await prisma.event.count();
      const sample = await prisma.event.findFirst({ select: { id: true, title: true, isUpcoming: true } });
      return NextResponse.json({
        ok: true,
        databaseUrlConfigured: Boolean(process.env.DATABASE_URL || process.env.secrets),
        eventCount: count,
        sampleEvent: sample,
      });
    } catch (err: any) {
      return NextResponse.json({
        ok: false,
        databaseUrlConfigured: Boolean(process.env.DATABASE_URL || process.env.secrets),
        error: err?.message || String(err),
      });
    }
  }

  try {
    const type = searchParams.get("type"); // "upcoming" | "past" | null (all)
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    if (slug || id) {
      const event = await prisma.event.findFirst({
        where: id ? { id } : { slug: slug! },
      });
      if (!event) {
        return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
      }
      return NextResponse.json(event);
    }

    const now = new Date();
    let where: Record<string, unknown> = {};

    if (type === "upcoming") {
      where = {
        OR: [
          { isUpcoming: true },
          { date: { gte: now } },
        ],
      };
    } else if (type === "past") {
      where = {
        isUpcoming: false,
        date: { lt: now },
      };
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: type === "upcoming" ? "asc" : "desc" },
    });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error("[Marketing /api/events Error]:", error);
    return NextResponse.json({ error: "Error al obtener los eventos." }, { status: 500 });
  }
}
