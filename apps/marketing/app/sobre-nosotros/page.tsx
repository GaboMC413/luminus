import React from "react";
import type { Metadata } from "next";
import { Hero } from "../../components/marketing/Hero";
import { ProblemSection } from "../../components/marketing/about/ProblemSection";
import { FeatureGrid } from "../../components/marketing/FeatureGrid";
import { PlatformSection } from "../../components/marketing/about/PlatformSection";
import { CTASection } from "../../components/marketing/CTASection";
import { aboutContent } from "../../content/about";

export const metadata: Metadata = {
  title: "LUMINUS Latam | Sobre Nosotros",
  description: "Conoce el origen, misión, visión y los principios que definen a LUMINUS: una red de bienestar humana, conectada y consciente en América Latina.",
};

export default function SobreNosotrosPage() {
  return (
    <>
      {/* 1. Hero Section */}
      <Hero {...aboutContent.hero} />

      {/* 2. Sección: Por qué existe LUMINUS */}
      <ProblemSection {...aboutContent.problem} />

      {/* 3. Sección: Nuestra respuesta */}
      <FeatureGrid {...aboutContent.response} />

      {/* 4. Sección: Misión, visión y propósito */}
      <FeatureGrid {...aboutContent.mission} />

      {/* 5. Sección: Principios */}
      <FeatureGrid {...aboutContent.principles} />

      {/* 6. Sección: Qué estamos construyendo */}
      <PlatformSection {...aboutContent.platform} />

      {/* 7. Sección final CTA */}
      <CTASection {...aboutContent.finalCta} />
    </>
  );
}
