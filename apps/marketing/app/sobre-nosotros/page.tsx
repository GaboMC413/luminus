import React from "react";
import type { Metadata } from "next";
import AboutHeroSection from "../../components/AboutHeroSection";
import AboutExistSection from "../../components/AboutExistSection";
import AboutResponseSection from "../../components/AboutResponseSection";
import AboutMissionSection from "../../components/AboutMissionSection";
import AboutPrinciplesSection from "../../components/AboutPrinciplesSection";
import AboutBuildingSection from "../../components/AboutBuildingSection";
import AboutFinalCTA from "../../components/AboutFinalCTA";

export const metadata: Metadata = {
  title: "LUMINUS Latam | Sobre Nosotros",
  description: "Conoce el origen, misión, visión y los principios que definen a LUMINUS: una red de bienestar humana, conectada y consciente en América Latina.",
};

export default function SobreNosotrosPage() {
  return (
    <>
      {/* 1. Hero Section */}
      <AboutHeroSection />

      {/* 2. Sección: Por qué existe LUMINUS */}
      <AboutExistSection />

      {/* 3. Sección: Nuestra respuesta */}
      <AboutResponseSection />

      {/* 4. Sección: Misión, visión y propósito */}
      <AboutMissionSection />

      {/* 5. Sección: Principios */}
      <AboutPrinciplesSection />

      {/* 6. Sección: Qué estamos construyendo */}
      <AboutBuildingSection />

      {/* 7. Sección final CTA */}
      <AboutFinalCTA />
    </>
  );
}
