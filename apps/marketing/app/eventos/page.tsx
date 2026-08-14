import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";
import {
  Navbar,
  EventsHero,
  EventsOverviewCard,
  InterviewsSection,
  EventsVoicesCallout,
  EventsFormatsGrid,
  EventsClosingCta,
  Footer,
} from "@/components";

export const metadata = {
  title: "Eventos y Encuentros | LUMINUS - Experiencias de Bienestar",
  description: "Descubre entrevistas y encuentros que reúnen distintas perspectivas para acercar nuevas formas de entender el bienestar, compartir experiencias y conectar con ideas.",
};

export default async function EventosPage() {
  let events = [];
  
  try {
    // 1. Attempt to fetch from Supabase
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false });

    if (data && data.length > 0) {
      events = data;
      console.log(`Fetched ${events.length} events from Supabase`);
    } else {
      if (error) {
        console.warn("Supabase query failed, falling back to local JSON:", error.message);
      } else {
        console.log("Supabase events table is empty, falling back to local JSON");
      }
    }
  } catch (err) {
    console.warn("Could not connect to Supabase or fetch data, falling back to local JSON:", err);
  }

  // 2. If Supabase has no data or fails, load from the generated JSON
  if (events.length === 0) {
    try {
      const jsonPath = path.join(process.cwd(), "apps", "marketing", "data", "youtube_videos.json");
      if (fs.existsSync(jsonPath)) {
        events = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        console.log(`Loaded ${events.length} events from local fallback JSON`);
      } else {
        const altPath = path.join(process.cwd(), "data", "youtube_videos.json");
        if (fs.existsSync(altPath)) {
          events = JSON.parse(fs.readFileSync(altPath, "utf8"));
          console.log(`Loaded ${events.length} events from local fallback JSON (alt path)`);
        }
      }
    } catch (fsErr) {
      console.error("Error reading local fallback JSON:", fsErr);
    }
  }

  return (
    <main className="w-full min-h-screen bg-white flex flex-col justify-start items-start">
      <Navbar />
      <div className="w-full pt-[64px]">
        <EventsHero />
        <EventsOverviewCard />
        <InterviewsSection events={events} isGrid={false} />
        <EventsVoicesCallout />
        <EventsFormatsGrid />
        <EventsClosingCta />
      </div>
      <Footer />
    </main>
  );
}
