import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { DarkFeatureShowcase } from "@/components/DarkFeatureShowcase";
import { FeatureCards } from "@/components/FeatureCards";
import { TripleCards } from "@/components/TripleCards";
import { CategoriesGrid } from "@/components/CategoriesGrid";
import { SpecialistsHighlight } from "@/components/SpecialistsHighlight";
import { ConversationSection } from "@/components/ConversationSection";
import { InterviewsSection } from "@/components/InterviewsSection";
import { ForSpecialistsSection } from "@/components/ForSpecialistsSection";
import { PricingSection } from "@/components/PricingSection";
import { FaqSection } from "@/components/FaqSection";
import { ContactBanner } from "@/components/ContactBanner";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans flex flex-col antialiased">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        <Hero />
        <DarkFeatureShowcase />
        <FeatureCards />
        <TripleCards />
        <CategoriesGrid />
        <SpecialistsHighlight />
        <ConversationSection />
        <InterviewsSection />
        <ForSpecialistsSection />
        <PricingSection />
        <FaqSection />
        <ContactBanner />
      </main>
      <Footer />
    </div>
  );
}
