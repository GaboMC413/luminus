import fs from "fs";
import path from "path";
import { getDbEvents } from "@/lib/events";
import {
  Navbar,
  SpecialistsHero,
  SpecialistsOverviewCard,
  SpecialistsInterviewsSection,
  SpecialistsDisciplines,
  SpecialistsPlatformFeatures,
  SpecialistsControlBanner,
  SpecialistsProcessSteps,
  SpecialistsFaq,
  SpecialistsClosingCta,
  Footer,
} from "@/components";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Para Especialistas | LUMINUS - Red Profesional de Bienestar",
  description: "Desarrolla tu práctica profesional dentro de LUMINUS. Da visibilidad a tu trabajo, ofrece sesiones introductorias y conecta con personas en toda Latinoamérica.",
};

export default async function SpecialistsPage() {
  let dbEvents: any[] = [];
  let jsonEvents: any[] = [];

  // 1. Fetch from DB
  const rawDb = await getDbEvents();
  if (Array.isArray(rawDb) && rawDb.length > 0) {
    dbEvents = rawDb;
  }

  // 2. Fetch local JSON events fallback
  try {
    let jsonPath = path.join(process.cwd(), "apps", "marketing", "data", "youtube_videos.json");
    if (!fs.existsSync(jsonPath)) {
      jsonPath = path.join(process.cwd(), "data", "youtube_videos.json");
    }
    if (fs.existsSync(jsonPath)) {
      jsonEvents = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    }
  } catch (fsErr) {
    console.warn("[SpecialistsPage] Error reading youtube_videos.json:", fsErr);
  }

  // Deduplicate: DB events take priority over jsonEvents
  const dbKeys = new Set<string>();
  dbEvents.forEach((item) => {
    const youtubeId = item.youtubeId || item.youtube_id;
    if (youtubeId) dbKeys.add(youtubeId);
    if (item.slug) dbKeys.add(item.slug);
    if (item.title) dbKeys.add(item.title.trim().toLowerCase());
  });

  const filteredJsonEvents = jsonEvents.filter((item) => {
    if (item.youtube_id && dbKeys.has(item.youtube_id)) return false;
    if (item.slug && dbKeys.has(item.slug)) return false;
    if (item.title && dbKeys.has(item.title.trim().toLowerCase())) return false;
    return true;
  });

  const events = [...dbEvents, ...filteredJsonEvents];

  return (
    <main className="w-full min-h-screen bg-white flex flex-col justify-start items-start">
      <Navbar />
      <div className="w-full pt-[64px]">
        <SpecialistsHero />
        <SpecialistsOverviewCard />
        <SpecialistsInterviewsSection
          events={events}
          title="Una red que ya reúne distintas miradas"
          subtitle="Especialistas de diferentes áreas ya participan en LUMINUS, compartiendo su experiencia y acercando nuevos enfoques sobre el bienestar."
        />
        <SpecialistsPlatformFeatures />
        <SpecialistsControlBanner />
        <SpecialistsProcessSteps />
        <SpecialistsFaq />
        <SpecialistsClosingCta />
      </div>
      <Footer />
    </main>
  );
}
