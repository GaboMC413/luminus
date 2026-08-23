import { prisma } from "./db";

export { prisma };

export function extractYoutubeId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export function normalizeCategory(category?: string | null): string {
  if (!category) return "";
  const norm = category.trim().toLowerCase();
  if (norm.includes("vinculo") || norm.includes("vínculo") || norm.includes("relacion") || norm.includes("relación")) {
    return "Vínculos";
  }
  if (norm.includes("movimiento") || norm.includes("actividad") || norm.includes("fisic") || norm.includes("físic")) {
    return "Movimiento Físico";
  }
  if (norm.includes("crecimiento")) return "Crecimiento Personal";
  if (norm.includes("emocional")) return "Bienestar Emocional";
  if (norm.includes("salud") || norm.includes("integral")) return "Salud Integral";
  if (norm.includes("nutricion") || norm.includes("nutrición")) return "Nutrición";
  if (norm.includes("espiritual")) return "Espiritualidad";
  if (norm.includes("terapia")) return "Terapias Complementarias";
  return category.trim();
}

export function normalizeEvent(ev: any) {
  if (!ev) return null;
  const rawLink = ev.link || null;
  const ytId = ev.youtubeId || ev.youtube_id || extractYoutubeId(rawLink) || null;
  const finalLink = rawLink || (ytId ? `https://www.youtube.com/watch?v=${ytId}` : null);
  const normalizedCat = normalizeCategory(ev.category);

  return {
    ...ev,
    id: ev.id,
    slug: ev.slug || null,
    title: ev.title || "",
    description: ev.description || "",
    location: ev.location || null,
    category: normalizedCat || ev.category || null,
    date: ev.date ? (ev.date instanceof Date ? ev.date.toISOString() : String(ev.date)) : null,
    link: finalLink,

    // CamelCase properties (Prisma)
    speakerName: ev.speakerName || ev.speaker_name || null,
    speakerBio: ev.speakerBio || ev.speaker_bio || null,
    timeText: ev.timeText || ev.time_text || null,
    coverUrl: ev.coverUrl || ev.cover_url || null,
    youtubeId: ytId,
    isUpcoming: ev.isUpcoming !== undefined ? Boolean(ev.isUpcoming) : (ev.is_upcoming !== undefined ? Boolean(ev.is_upcoming) : true),

    // Snake_case aliases for components that consume snake_case
    speaker_name: ev.speakerName || ev.speaker_name || null,
    speaker_bio: ev.speakerBio || ev.speaker_bio || null,
    time_text: ev.timeText || ev.time_text || null,
    cover_url: ev.coverUrl || ev.cover_url || null,
    youtube_id: ytId,
    is_upcoming: ev.isUpcoming !== undefined ? Boolean(ev.isUpcoming) : (ev.is_upcoming !== undefined ? Boolean(ev.is_upcoming) : true),
  };
}

export async function getDbEvents(options?: { type?: "upcoming" | "past"; slug?: string; id?: string }) {
  try {
    if (options?.slug || options?.id) {
      const event = await prisma.event.findFirst({
        where: options.id
          ? { id: options.id }
          : { slug: options.slug },
      });
      return event ? normalizeEvent(event) : null;
    }

    const now = new Date();
    let where: Record<string, unknown> = {};

    if (options?.type === "upcoming") {
      where = {
        OR: [
          { isUpcoming: true },
          { date: { gte: now } },
        ],
      };
    } else if (options?.type === "past") {
      where = {
        isUpcoming: false,
        date: { lt: now },
      };
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: options?.type === "upcoming" ? "asc" : "desc" },
    });

    return events.map(normalizeEvent).filter(Boolean);
  } catch (error) {
    console.warn("[getDbEvents] Error querying Prisma events:", error);
    return [];
  }
}
