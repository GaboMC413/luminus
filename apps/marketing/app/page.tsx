import React from "react";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import BenefitsSection from "../components/BenefitsSection";
import PricingSection from "../components/PricingSection";
import TrustSection from "../components/TrustSection";
import FinalCTA from "../components/FinalCTA";

export default function Home() {
  return (
    <>
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Sección: Qué puedes hacer dentro de LUMINUS */}
      <FeaturesSection />

      {/* 3. Sección de valor emocional (Beneficios) */}
      <BenefitsSection />

      {/* 4. Sección de planes */}
      <PricingSection />

      {/* 5. Sección de confianza / aclaración */}
      <TrustSection />

      {/* 6. CTA final */}
      <FinalCTA />
    </>
  );
}
