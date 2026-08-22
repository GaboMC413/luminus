import fs from "fs";
import path from "path";
import { getDbEvents } from "@/lib/events";
import { Navbar, Footer } from "@/components";
import { RecordingsGrid } from "@/components/events/RecordingsGrid";

export const metadata = {
  title: "Grabaciones | LUMINUS - Encuentros y Entrevistas",
  description: "Revive los encuentros y entrevistas sobre bienestar de LUMINUS. Mira las grabaciones de conversaciones enriquecedoras con especialistas.",
};

export default async function GrabacionesListingPage() {
  let events: any[] = [];

  // 1. Fetch from PostgreSQL via direct Prisma helper
  const dbEvents = await getDbEvents({ type: "past" });
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
      console.error("[Grabaciones] Error reading local JSON:", fsErr);
    }
  }

  // Filter: recorded past events with a YouTube video
  const now = new Date();
  const recordedEvents = events.filter((item: any) => {
    if (item.isUpcoming === true || item.is_upcoming === true) return false;
    if (item.date) {
      const d = new Date(item.date);
      if (!isNaN(d.getTime()) && d > now) return false;
    }
    const youtubeId = item.youtubeId || item.youtube_id;
    const link = item.link || "";
    const hasYoutubeVideo = Boolean(
      youtubeId ||
      (link && (link.includes("watch?v=") || link.includes("youtu.be/")))
    );
    return hasYoutubeVideo;
  });

  return (
    <main className="w-full min-h-screen bg-white flex flex-col justify-start items-start">
      <Navbar />
      <div className="w-full pt-[64px] flex-1 flex flex-col min-h-[110vh]">
        <RecordingsGrid
          events={recordedEvents}
          title="Grabaciones"
          subtitle="Entrevistas y conversaciones sobre bienestar."
        />
      </div>
      <Footer />
    </main>
  );
}
