import type { Metadata } from "next";
import { getDbEvents } from "@/lib/events";
import { Navbar, Footer } from "@/components";
import { UpcomingEventsTimeline } from "@/components/events/UpcomingEventsTimeline";
import { PastEventsGrid } from "@/components/events/PastEventsGrid";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Próximas Fechas | LUMINUS LATAM",
  description: "Conoce las próximas charlas en vivo, entrevistas y talleres con especialistas del bienestar. Participa y reserva tu lugar.",
  alternates: { canonical: "https://luminuslatam.com/proximasfechas" },
  openGraph: {
    title: "Próximas Fechas | LUMINUS LATAM",
    description: "Conoce las próximas charlas en vivo, entrevistas y talleres con especialistas del bienestar. Participa y reserva tu lugar.",
    url: "https://luminuslatam.com/proximasfechas",
    siteName: "LUMINUS LATAM",
    images: [
      {
        url: "/luminus_events.jpg",
        secureUrl: "https://luminuslatam.com/luminus_events.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Próximas Fechas | LUMINUS LATAM",
      },
    ],
    locale: "es_LA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Próximas Fechas | LUMINUS LATAM",
    description: "Conoce las próximas charlas en vivo, entrevistas y talleres con especialistas del bienestar. Participa y reserva tu lugar.",
    images: ["/luminus_events.jpg"],
  },
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
