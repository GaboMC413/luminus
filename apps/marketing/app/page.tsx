import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";
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


export default async function Home() {
  let supabaseEvents: any[] = [];
  let jsonEvents: any[] = [];

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (data && data.length > 0) {
        supabaseEvents = data;
      }
    }
  } catch (err) {
    console.warn("[Home] Could not connect to Supabase:", err);
  }

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

  const events = [...supabaseEvents, ...jsonEvents];

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
