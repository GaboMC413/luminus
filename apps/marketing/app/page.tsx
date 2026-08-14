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
  let events = [];
  
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false });

    if (data && data.length > 0) {
      events = data;
      console.log(`[Home] Fetched ${events.length} events from Supabase`);
    } else {
      if (error) {
        console.warn("[Home] Supabase query failed, falling back to local JSON:", error.message);
      }
    }
  } catch (err) {
    console.warn("[Home] Could not connect to Supabase or fetch data, falling back to local JSON:", err);
  }

  if (events.length === 0) {
    try {
      const jsonPath = path.join(process.cwd(), "apps", "marketing", "data", "youtube_videos.json");
      if (fs.existsSync(jsonPath)) {
        events = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        console.log(`[Home] Loaded ${events.length} events from local fallback JSON`);
      } else {
        const altPath = path.join(process.cwd(), "data", "youtube_videos.json");
        if (fs.existsSync(altPath)) {
          events = JSON.parse(fs.readFileSync(altPath, "utf8"));
          console.log(`[Home] Loaded ${events.length} events from local fallback JSON (alt path)`);
        }
      }
    } catch (fsErr) {
      console.error("[Home] Error reading local fallback JSON:", fsErr);
    }
  }

  // Get the latest 8 events for the home page carousel
  const homeEvents = events.slice(0, 8);

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
        <InterviewsSection events={homeEvents} />
        <ForSpecialistsSection />
        <PricingSection />
        <FaqSection />
        <ContactBanner />
      </main>
      <Footer />
    </div>
  );
}
