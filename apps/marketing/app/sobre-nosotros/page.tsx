import React from "react";
import type { Metadata } from "next";
import { Hero } from "../../components/marketing/Hero";
import { ProblemSection } from "../../components/marketing/about/ProblemSection";
import { FeatureGrid } from "../../components/marketing/FeatureGrid";
import { PlatformSection } from "../../components/marketing/about/PlatformSection";
import { CTASection } from "../../components/marketing/CTASection";
import { aboutContent } from "../../content/about";

export const metadata: Metadata = {
  title: "Sobre Nosotros | LUMINUS Latam",
  description: "Conoce nuestra historia, visión y los principios fundamentales de LUMINUS: una plataforma que integra comunidad, especialistas y tecnología consciente en América Latina.",
};

export default function SobreNosotrosPage() {
  return (
    <>
      {/* 1. Hero Section */}
      <Hero {...aboutContent.hero} />

      {/* 2. Sección: Por qué existe LUMINUS */}
      <ProblemSection id="porque-existe" {...aboutContent.problem} />

      {/* 3. Sección: Nuestra respuesta */}
      <FeatureGrid id="respuesta-luminus" {...aboutContent.response} />

      {/* 4. Sección: Misión, visión y propósito */}
      <FeatureGrid id="mision-y-vision" {...aboutContent.mission} />

      {/* 5. Sección: Principios */}
      <FeatureGrid id="principios" {...aboutContent.principles} />

      {/* 6. Sección: Qué estamos construyendo */}
      <PlatformSection id="plataforma" {...aboutContent.platform} />

      {/* 7. Sección: Etapa actual */}
      <PlatformSection id="etapa-actual" {...aboutContent.currentStage} />

      {/* 7. Sección final CTA */}
      <CTASection {...aboutContent.finalCta} />
    </>
  );
}
