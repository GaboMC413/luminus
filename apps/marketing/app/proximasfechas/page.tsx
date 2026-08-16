import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";
import { Navbar, Footer } from "@/components";
import { UpcomingEventsTimeline } from "@/components/events/UpcomingEventsTimeline";
import { PastEventsGrid } from "@/components/events/PastEventsGrid";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Próximas Fechas | LUMINUS - Encuentros y Talleres",
  description: "Descubre y reserva tu lugar para los próximos talleres, encuentros y conversaciones en vivo sobre bienestar en LUMINUS.",
};

export default async function ProximasFechasPage() {
  let supabaseEvents: any[] = [];
  let jsonEvents: any[] = [];

  // 1. Fetch from Supabase
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (data && data.length > 0) {
        supabaseEvents = data;
      } else if (error) {
        console.warn("Supabase query failed for ProximasFechas:", error.message);
      }
    }
  } catch (err) {
    console.warn("Could not connect to Supabase for ProximasFechas:", err);
  }

  // 2. Fetch local JSON events
  try {
    const jsonPath = path.join(process.cwd(), "apps", "marketing", "data", "youtube_videos.json");
    if (fs.existsSync(jsonPath)) {
      jsonEvents = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    } else {
      const altPath = path.join(process.cwd(), "data", "youtube_videos.json");
      if (fs.existsSync(altPath)) {
        jsonEvents = JSON.parse(fs.readFileSync(altPath, "utf8"));
      }
    }
  } catch (fsErr) {
    console.error("Error loading local JSON for ProximasFechas:", fsErr);
  }

  // 3. Filter upcoming events
  const now = new Date();
  const upcomingMap = new Map<string, any>();

  const processUpcomingEvent = (ev: any) => {
    if (!ev) return;
    const isUpcoming =
      ev.is_upcoming === true ||
      (ev.is_upcoming !== false &&
        ev.date &&
        !isNaN(new Date(ev.date).getTime()) &&
        new Date(ev.date) >= now);

    if (isUpcoming) {
      const key = ev.slug || ev.id || ev.youtube_id;
      if (key && !upcomingMap.has(key)) {
        upcomingMap.set(key, ev);
      }
    }
  };

  supabaseEvents.forEach(processUpcomingEvent);
  jsonEvents.forEach(processUpcomingEvent);

  const upcomingEvents = Array.from(upcomingMap.values()).sort((a: any, b: any) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateA - dateB;
  });

  // 4. Filter ALL past events for the historic section, sorted descending by date (newest past event first)
  const combinedList = [...supabaseEvents, ...jsonEvents];
  const pastEventsMap = new Map<string, any>();

  combinedList.forEach((item: any) => {
    if (!item) return;
    if (item.is_upcoming === true) return;
    if (item.date) {
      const d = new Date(item.date);
      if (!isNaN(d.getTime()) && d > now) return;
    }
    const key = item.youtube_id || item.id || item.slug;
    if (key && !pastEventsMap.has(key)) {
      pastEventsMap.set(key, item);
    }
  });

  const pastEvents = Array.from(pastEventsMap.values()).sort((a: any, b: any) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
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
