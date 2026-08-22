import fs from "fs";
import path from "path";
import { getDbEvents } from "@/lib/events";
import { Navbar, Footer } from "@/components";
import { UpcomingEventsTimeline } from "@/components/events/UpcomingEventsTimeline";
import { PastEventsGrid } from "@/components/events/PastEventsGrid";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Próximas Fechas | LUMINUS - Encuentros y Talleres",
  description: "Descubre y reserva tu lugar para los próximos talleres, encuentros y conversaciones en vivo sobre bienestar en LUMINUS.",
};

async function fetchJsonEvents(): Promise<any[]> {
  try {
    const jsonPath = path.join(process.cwd(), "apps", "marketing", "data", "youtube_videos.json");
    if (fs.existsSync(jsonPath)) return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const altPath = path.join(process.cwd(), "data", "youtube_videos.json");
    if (fs.existsSync(altPath)) return JSON.parse(fs.readFileSync(altPath, "utf8"));
  } catch (fsErr) {
    console.error("[ProximasFechas] Error loading local JSON:", fsErr);
  }
  return [];
}

export default async function ProximasFechasPage() {
  const [upcomingFromDb, pastFromDb, jsonEvents] = await Promise.all([
    getDbEvents({ type: "upcoming" }),
    getDbEvents({ type: "past" }),
    fetchJsonEvents(),
  ]);

  const safeUpcomingDb = Array.isArray(upcomingFromDb) ? upcomingFromDb : [];
  const safePastDb = Array.isArray(pastFromDb) ? pastFromDb : [];

  // Upcoming: DB first, fallback a JSON
  const upcomingDbKeys = new Set(safeUpcomingDb.map((e: any) => e.slug || e.id));
  const upcomingJsonFallback = jsonEvents.filter((e: any) => {
    if (e.is_upcoming !== true) return false;
    const key = e.slug || e.id || e.youtube_id;
    return key && !upcomingDbKeys.has(key);
  });
  const upcomingEvents = [...safeUpcomingDb, ...upcomingJsonFallback].sort((a, b) => {
    const dA = a.date ? new Date(a.date).getTime() : 0;
    const dB = b.date ? new Date(b.date).getTime() : 0;
    return dA - dB;
  });

  // Past: DB first, fill with JSON
  const pastDbKeys = new Set(safePastDb.map((e: any) => e.slug || e.id || e.youtube_id));
  const pastJsonFallback = jsonEvents.filter((e: any) => {
    if (e.is_upcoming === true) return false;
    const key = e.slug || e.id || e.youtube_id;
    return key && !pastDbKeys.has(key);
  });
  const pastEvents = [...safePastDb, ...pastJsonFallback].sort((a, b) => {
    const dA = a.date ? new Date(a.date).getTime() : 0;
    const dB = b.date ? new Date(b.date).getTime() : 0;
    return dB - dA;
  });

  return (
    <main className="w-full min-h-screen bg-white flex flex-col justify-start items-start">
      <Navbar />
      <div className="w-full pt-[64px] flex-1 flex flex-col">
        <UpcomingEventsTimeline events={upcomingEvents} />
        {pastEvents.length > 0 && (
          <PastEventsGrid
            events={pastEvents}
            subtitle="Fechas pasadas."
          />
        )}
      </div>
      <Footer />
    </main>
  );
}
