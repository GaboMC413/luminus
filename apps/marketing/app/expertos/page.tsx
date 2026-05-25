import React from "react";
import type { Metadata } from "next";
import { Hero } from "../../components/marketing/Hero";
import { BenefitsGrid } from "../../components/marketing/BenefitsGrid";
import { FeatureGrid } from "../../components/marketing/FeatureGrid";
import { ComparisonSection } from "../../components/marketing/ComparisonSection";
import { StepsSection } from "../../components/marketing/StepsSection";
import { TrustSection } from "../../components/marketing/TrustSection";
import { CTASection } from "../../components/marketing/CTASection";
import { expertsContent } from "../../content/experts";

export const metadata: Metadata = {
  title: "LUMINUS Latam | Para Expertos y Profesionales del Bienestar",
  description: "Lleva tu práctica profesional a una red de confianza diseñada para amplificar tu impacto y conectar con personas interesadas en su salud integral.",
};

export default function ExpertosPage() {
  return (
    <>
      {/* 1. Hero Section */}
      <Hero {...expertsContent.hero} />

      {/* 2. Sección: Por qué formar parte de LUMINUS */}
      <BenefitsGrid {...expertsContent.benefits} />

      {/* 3. Sección: Qué podrán hacer los expertos en LUMINUS */}
      <FeatureGrid {...expertsContent.features} />

      {/* 4. Sección: Diferencia entre usuario general y experto */}
      <ComparisonSection {...expertsContent.comparison} />

      {/* 5. Sección: Cómo empezar */}
      <StepsSection {...expertsContent.steps} />

      {/* 6. Sección de confianza */}
      <TrustSection {...expertsContent.trust} />

      {/* 7. CTA final */}
      <CTASection {...expertsContent.finalCta} />
    </>
  );
}
