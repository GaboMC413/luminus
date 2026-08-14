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
  title: "Entrevistas y Encuentros | LUMINUS - Experiencias de Bienestar",
  description: "Descubre entrevistas y encuentros que reúnen distintas perspectivas para acercar nuevas formas de entender el bienestar, compartir experiencias y conectar con ideas.",
};

export default function EntrevistasPage() {
  return (
    <main className="w-full min-h-screen bg-white flex flex-col justify-start items-start">
      <Navbar />
      <div className="w-full pt-[64px]">
        <EventsHero />
        <EventsOverviewCard />
        <InterviewsSection />
        <EventsVoicesCallout />
        <EventsFormatsGrid />
        <EventsClosingCta />
      </div>
      <Footer />
    </main>
  );
}
