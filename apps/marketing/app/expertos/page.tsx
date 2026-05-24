import React from "react";
import type { Metadata } from "next";
import ExpertHeroSection from "../../components/ExpertHeroSection";
import ExpertBenefitsSection from "../../components/ExpertBenefitsSection";
import ExpertFeaturesSection from "../../components/ExpertFeaturesSection";
import ExpertComparisonSection from "../../components/ExpertComparisonSection";
import ExpertStepsSection from "../../components/ExpertStepsSection";
import ExpertTrustSection from "../../components/ExpertTrustSection";
import ExpertFinalCTA from "../../components/ExpertFinalCTA";

export const metadata: Metadata = {
  title: "LUMINUS Latam | Para Expertos y Profesionales del Bienestar",
  description: "Lleva tu práctica profesional a una red de confianza diseñada para amplificar tu impacto y conectar con personas interesadas en su salud integral.",
};

export default function ExpertosPage() {
  return (
    <>
      {/* 1. Hero Section */}
      <ExpertHeroSection />

      {/* 2. Sección: Por qué formar parte de LUMINUS */}
      <ExpertBenefitsSection />

      {/* 3. Sección: Qué podrán hacer los expertos en LUMINUS */}
      <ExpertFeaturesSection />

      {/* 4. Sección: Diferencia entre usuario general y experto */}
      <ExpertComparisonSection />

      {/* 5. Sección: Cómo empezar */}
      <ExpertStepsSection />

      {/* 6. Sección de confianza */}
      <ExpertTrustSection />

      {/* 7. CTA final */}
      <ExpertFinalCTA />
    </>
  );
}
