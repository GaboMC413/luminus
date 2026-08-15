import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";
import { Navbar, InterviewsSection, Footer } from "@/components";

export default async function EntrevistasListingPage() {
  let events = [];

  try {
    // 1. Attempt to fetch from Supabase
    if (supabase) {
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
    } else {
      console.warn("Supabase client not initialized, falling back to local JSON");
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
      <div className="w-full pt-[64px] flex-1 flex flex-col min-h-[110vh]">
        <InterviewsSection events={events} isGrid={true} showTitle={false} />
      </div>
      <Footer />
    </main>
  );
}
