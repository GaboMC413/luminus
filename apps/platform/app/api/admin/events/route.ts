import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      title,
      description,
      speakerName,
      speakerBio,
      category,
      date,
      timeText,
      location,
      coverUrl,
      youtubeId,
      link,
      isUpcoming,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "El título del evento es obligatorio." }, { status: 400 });
    }

    // Generate slug
    const generateSlug = (t: string) =>
      t
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .substring(0, 80) + "-" + Math.random().toString(36).substring(2, 6);

    const dateVal = date ? new Date(date) : null;

    if (id) {
      // Update existing
      const updated = await prisma.event.update({
        where: { id },
        data: {
          title,
          description: description || "",
          speakerName: speakerName || null,
          speakerBio: speakerBio || null,
          category: category || null,
          date: dateVal && !isNaN(dateVal.getTime()) ? dateVal : null,
          timeText: timeText || null,
          location: location || null,
          coverUrl: coverUrl || null,
          youtubeId: youtubeId || null,
          link: link || null,
          isUpcoming: Boolean(isUpcoming),
        },
      });
      return NextResponse.json({ success: true, event: updated });
    } else {
      // Create new
      const slug = generateSlug(title);
      const created = await prisma.event.create({
        data: {
          slug,
          title,
          description: description || "",
          speakerName: speakerName || null,
          speakerBio: speakerBio || null,
          category: category || null,
          date: dateVal && !isNaN(dateVal.getTime()) ? dateVal : null,
          timeText: timeText || null,
          location: location || null,
          coverUrl: coverUrl || null,
          youtubeId: youtubeId || null,
          link: link || null,
          isUpcoming: isUpcoming !== undefined ? Boolean(isUpcoming) : true,
        },
      });
      return NextResponse.json({ success: true, event: created });
    }
  } catch (error: any) {
    console.error("[API Admin Events Error]:", error);
    return NextResponse.json({ error: error.message || "Error guardando el evento." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de evento no proporcionado." }, { status: 400 });
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Admin Events Delete Error]:", error);
    return NextResponse.json({ error: error.message || "Error eliminando el evento." }, { status: 500 });
  }
}
