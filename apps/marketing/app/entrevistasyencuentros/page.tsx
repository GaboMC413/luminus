import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { getDbEvents } from "@/lib/events";
import {
  Navbar,
  EventsHero,
  EventsOverviewCard,
  InterviewsSection,
  EventsVoicesCallout,
  EventsFormatsGrid,
  EventsFaq,
  EventsClosingCta,
  Footer,
} from "@/components";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eventos y Actividades | LUMINUS Latam",
  description: "Talleres, charlas en vivo y experiencias diseñadas para acercar el bienestar integral a tu vida. Únete a nuestros encuentros y accede a la videoteca en YouTube.",
};

export default async function EntrevistasYEncuentrosPage() {
  let events: any[] = [];

  // 1. Fetch from PostgreSQL via direct Prisma helper
  const dbEvents = await getDbEvents();
  if (Array.isArray(dbEvents) && dbEvents.length > 0) {
    events = dbEvents;
  }

  // 2. Fallback to local JSON if DB returned nothing
  if (events.length === 0) {
    try {
      const jsonPath = path.join(process.cwd(), "apps", "marketing", "data", "youtube_videos.json");
      if (fs.existsSync(jsonPath)) {
        events = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      } else {
        const altPath = path.join(process.cwd(), "data", "youtube_videos.json");
        if (fs.existsSync(altPath)) {
          events = JSON.parse(fs.readFileSync(altPath, "utf8"));
        }
      }
    } catch (fsErr) {
      console.error("[EntrevistasPage] Error reading local JSON:", fsErr);
    }
  }

  return (
    <main className="w-full min-h-screen bg-white flex flex-col justify-start items-start">
      <Navbar />
      <div className="w-full pt-[64px]">
        <EventsHero />
        <EventsOverviewCard />
        <InterviewsSection
          events={events}
          isGrid={false}
          title="Entrevistas disponibles para ver en cualquier momento"
        />
        <EventsVoicesCallout />
        <EventsFormatsGrid />
        <EventsFaq />
        <EventsClosingCta />
      </div>
      <Footer />
    </main>
  );
}
