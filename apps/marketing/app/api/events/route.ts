import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Singleton para evitar múltiples instancias
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "upcoming" | "past" | null (all)
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    // Buscar por slug o id (para página de detalle de evento)
    if (slug || id) {
      const event = await prisma.event.findFirst({
        where: id
          ? { id }
          : { slug: slug! },
      });
      if (!event) {
        return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
      }
      return NextResponse.json(event);
    }

    // Filtrar por upcoming / past
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
