import fs from "fs";
import path from "path";
import { getDbEvents } from "@/lib/events";
import {
  Navbar,
  Hero,
  DarkFeatureShowcase,
  FeatureCards,
  CategoriesGrid,
  SpecialistsHighlight,
  ConversationSection,
  InterviewsSection,
  ForSpecialistsSection,
  PricingSection,
  FaqSection,
  ContactBanner,
  Footer,
} from "@/components";

export const revalidate = 0;

export default async function Home() {
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
    console.warn("[Home] Error reading youtube_videos.json:", fsErr);
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
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans flex flex-col antialiased">
      <Navbar />
      <main className="flex-1 w-full flex flex-col pt-[64px]">
        <Hero />
        <DarkFeatureShowcase />
        <FeatureCards />
        <CategoriesGrid />
        <SpecialistsHighlight />
        <ConversationSection />
        <InterviewsSection events={events} />
        <ForSpecialistsSection />
        <PricingSection />
        <FaqSection />
        <ContactBanner />
      </main>
      <Footer />
    </div>
  );
}
