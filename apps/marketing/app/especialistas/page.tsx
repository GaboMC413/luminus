import {
  Navbar,
  SpecialistsHero,
  SpecialistsOverviewCard,
  SpecialistsDisciplines,
  SpecialistsPlatformFeatures,
  SpecialistsControlBanner,
  SpecialistsProcessSteps,
  SpecialistsFaq,
  SpecialistsClosingCta,
  Footer,
} from "@/components";

export const metadata = {
  title: "Para Especialistas | LUMINUS - Red Profesional de Bienestar",
  description: "Desarrolla tu práctica profesional dentro de LUMINUS. Da visibilidad a tu trabajo, ofrece sesiones introductorias y conecta con personas en toda Latinoamérica.",
};

export default function SpecialistsPage() {
  return (
    <main className="w-full min-h-screen bg-white flex flex-col justify-start items-start">
      <Navbar />
      <div className="w-full pt-[64px]">
        <SpecialistsHero />
        <SpecialistsOverviewCard />
        <SpecialistsDisciplines />
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
