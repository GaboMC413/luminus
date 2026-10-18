import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { getDbEvents, checkIsUpcoming } from "@/lib/events";
import { Navbar, Footer } from "@/components";
import { RecordingsGrid } from "@/components/events/RecordingsGrid";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Grabaciones | LUMINUS LATAM",
  description: "Accede a la videoteca completa de conversaciones, entrevistas y actividades grabadas con especialistas en bienestar.",
  alternates: { canonical: "https://luminuslatam.com/grabaciones" },
  openGraph: {
    title: "Grabaciones | LUMINUS LATAM",
    description: "Accede a la videoteca completa de conversaciones, entrevistas y actividades grabadas con especialistas en bienestar.",
    url: "https://luminuslatam.com/grabaciones",
    siteName: "LUMINUS LATAM",
    images: [
      {
        url: "/luminus_events.jpg",
        secureUrl: "https://luminuslatam.com/luminus_events.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Grabaciones | LUMINUS LATAM",
      },
    ],
    locale: "es_LA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grabaciones | LUMINUS LATAM",
    description: "Accede a la videoteca completa de conversaciones, entrevistas y actividades grabadas con especialistas en bienestar.",
    images: ["/luminus_events.jpg"],
  },
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
    if (checkIsUpcoming(item)) return false;
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
