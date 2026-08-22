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

function deduplicateEvents(events: any[]) {
  const seen = new Set<string>();
  return events.filter((e) => {
    const normTitle = (e.title || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();
    if (!normTitle) return true;
    if (seen.has(normTitle)) return false;
    seen.add(normTitle);
    return true;
  });
}

export default async function ProximasFechasPage() {
  const [upcomingFromDb, pastFromDb] = await Promise.all([
    getDbEvents({ type: "upcoming" }),
    getDbEvents({ type: "past" }),
  ]);

  const rawUpcoming = Array.isArray(upcomingFromDb) ? upcomingFromDb : [];
  const rawPast = Array.isArray(pastFromDb) ? pastFromDb : [];

  const upcomingEvents = deduplicateEvents(rawUpcoming).sort((a, b) => {
    const dA = a.date ? new Date(a.date).getTime() : 0;
    const dB = b.date ? new Date(b.date).getTime() : 0;
    return dA - dB;
  });

  const pastEvents = deduplicateEvents(rawPast).sort((a, b) => {
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
