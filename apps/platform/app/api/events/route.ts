import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";
import { sendEventRegistrationEmail } from "@/lib/mails/sender";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const session = await getCurrentSession();
    let userEmail = "";
    if (session?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { email: true },
      });
      userEmail = user?.email || "";
    }

    if (type === "past") {
      let pastEvents = await prisma.event.findMany({
        where: {
          OR: [
            { isUpcoming: false },
            {
              AND: [
                { date: { not: null } },
                { date: { lt: today } },
              ],
            },
          ],
          AND: [
            {
              OR: [
                { youtubeId: { not: null } },
                { link: { contains: "youtube" } },
                { link: { contains: "youtu.be" } },
              ],
            },
          ],
        },
        orderBy: { date: "desc" },
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
          youtubeId: true,
          isUpcoming: true,
        },
      });

      // Fallback to local json data if DB has no recordings
      if (!pastEvents || pastEvents.length === 0) {
        try {
          const possiblePaths = [
            path.join(process.cwd(), "apps", "marketing", "data", "youtube_videos.json"),
            path.join(process.cwd(), "data", "youtube_videos.json"),
            path.join(process.cwd(), "..", "marketing", "data", "youtube_videos.json"),
          ];
          for (const jsonPath of possiblePaths) {
            if (fs.existsSync(jsonPath)) {
              const fileData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
              if (Array.isArray(fileData)) {
                pastEvents = fileData.map((item: any) => ({
                  id: item.youtube_id || item.id,
                  slug: item.slug || null,
                  title: item.title,
                  description: item.description || "",
                  speakerName: item.speaker_name || item.speakerName || null,
                  speakerBio: item.speaker_bio || item.speakerBio || null,
                  category: item.category || null,
                  coverUrl: item.cover_url || item.coverUrl || null,
                  date: item.date || null,
                  timeText: item.timeText || item.publishTimeText || null,
                  location: item.location || "YouTube",
                  link: item.link || (item.youtube_id ? `https://www.youtube.com/watch?v=${item.youtube_id}` : null),
                  youtubeId: item.youtube_id || item.youtubeId || null,
                  isUpcoming: false,
                }));
                break;
              }
            }
          }
        } catch (fsErr) {
          console.warn("[Platform /api/events] Error reading fallback youtube_videos.json:", fsErr);
        }
      }

      return NextResponse.json({ events: pastEvents || [] });
    }

    // Default: Only return active upcoming events whose date is today or in the future
    const events = await prisma.event.findMany({
      where: {
        isUpcoming: true,
        date: { gte: today },
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
        youtubeId: true,
        isUpcoming: true,
        inscriptions: userEmail
          ? {
              where: {
                guest: { email: userEmail.toLowerCase().trim() },
              },
              select: { id: true },
            }
          : false,
      },
    });

    const formattedEvents = events.map((event) => {
      const isRegistered = Boolean(
        Array.isArray((event as any).inscriptions) && (event as any).inscriptions.length > 0
      );
      const { inscriptions, ...rest } = event as any;
      return {
        ...rest,
        isRegistered,
      };
    });

    return NextResponse.json({ events: formattedEvents });
  } catch (error: any) {
    console.error("[Platform /api/events Error]:", error);
    return NextResponse.json({ events: [], error: "Error al obtener eventos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "No autorizado. Inicia sesión." }, { status: 401 });
    }

    const body = await request.json();
    const { eventId } = body || {};

    if (!eventId) {
      return NextResponse.json({ error: "Falta el ID del evento." }, { status: 400 });
    }

    const [user, event] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        include: { profile: true },
      }),
      prisma.event.findUnique({
        where: { id: eventId },
      }),
    ]);

    if (!user || !user.email) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
    }

    const cleanEmail = user.email.toLowerCase().trim();
    const firstName = user.profile?.firstName || user.email.split("@")[0] || "Invitado";
    const lastName = user.profile?.lastName || undefined;
    const city = user.profile?.city || undefined;
    const country = user.profile?.country || undefined;

    // Upsert EventGuest
    const guest = await prisma.eventGuest.upsert({
      where: { email: cleanEmail },
      update: {
        firstName,
        lastName,
        city,
        country,
      },
      create: {
        email: cleanEmail,
        firstName,
        lastName,
        city,
        country,
        isGuest: false,
      },
    });

    // Check existing inscription
    const existingInscription = await prisma.eventInscription.findUnique({
      where: {
        eventId_guestId: {
          eventId: event.id,
          guestId: guest.id,
        },
      },
    });

    if (existingInscription) {
      return NextResponse.json({
        success: true,
        alreadyRegistered: true,
        message: "Ya estás inscripto a este evento.",
      });
    }

    // Create inscription
    await prisma.eventInscription.create({
      data: {
        eventId: event.id,
        guestId: guest.id,
      },
    });

    // Send confirmation email asynchronously
    sendEventRegistrationEmail(cleanEmail, {
      firstName,
      eventTitle: event.title,
      eventCoverUrl: event.coverUrl,
      eventDate: event.date ? event.date.toISOString() : null,
      timeText: event.timeText,
      speakerName: event.speakerName,
      youtubeUrl: event.link || (event.youtubeId ? `https://www.youtube.com/watch?v=${event.youtubeId}` : null),
      eventSlug: event.slug,
      location: event.location || "Estreno en YouTube",
    }).catch((err) => {
      console.warn("[Async sendEventRegistrationEmail error]:", err);
    });

    return NextResponse.json({
      success: true,
      message: "¡Te has inscripto con éxito al evento!",
    });
  } catch (error: any) {
    console.error("[Platform Inscribe Event Error]:", error);
    return NextResponse.json(
      { error: "Error al inscribirse al evento." },
      { status: 500 }
    );
  }
}
