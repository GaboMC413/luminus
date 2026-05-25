import React from "react";
import { Hero } from "../components/marketing/Hero";
import { FeatureGrid } from "../components/marketing/FeatureGrid";
import { BenefitsGrid } from "../components/marketing/BenefitsGrid";
import { PricingSection } from "../components/marketing/PricingSection";
import { TrustSection } from "../components/marketing/TrustSection";
import { CTASection } from "../components/marketing/CTASection";
import { homeContent } from "../content/home";

export default function Home() {
  return (
    <>
      {/* 1. Hero Section */}
      <Hero {...homeContent.hero} />

      {/* 2. Sección: Qué puedes hacer dentro de LUMINUS */}
      <FeatureGrid {...homeContent.features} />

      {/* 3. Sección de valor emocional (Beneficios) */}
      <BenefitsGrid {...homeContent.benefits} />

      {/* 4. Sección de planes */}
      <PricingSection {...homeContent.pricing} />

      {/* 5. Sección de confianza / aclaración */}
      <TrustSection {...homeContent.trust} />

      {/* 6. CTA final */}
      <CTASection {...homeContent.finalCta} />
    </>
  );
}
