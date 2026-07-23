import React from "react";
import type { Metadata } from "next";
import { Hero } from "../components/marketing/Hero";
import { FeatureGrid } from "../components/marketing/FeatureGrid";
import { BenefitsGrid } from "../components/marketing/BenefitsGrid";
import { PricingSection } from "../components/marketing/PricingSection";
import { TrustSection } from "../components/marketing/TrustSection";
import { CTASection } from "../components/marketing/CTASection";
import { homeContent } from "../content/home";

export const metadata: Metadata = {
  title: "LUMINUS Latam | Conecta con tu bienestar integral",
  description: "Una plataforma de bienestar contemporánea que conecta personas, especialistas y organizaciones en una red humana de acompañamiento y aprendizaje consciente.",
};

export default function Home() {
  return (
    <>
      {/* 1. Hero Section */}
      <Hero {...homeContent.hero} gradientClass="hero-home-gradient" />

      {/* 2. Sección: Qué puedes hacer dentro de LUMINUS */}
      <FeatureGrid id="que-hacer" {...homeContent.features} />

      {/* 3. Sección de valor emocional (Beneficios) */}
      <BenefitsGrid id="acompanamiento" {...homeContent.benefits} />

      {/* 4. Sección de planes */}
      <PricingSection id="planes-bienestar" {...homeContent.pricing} />

      {/* 5. Sección de confianza / aclaración */}
      <TrustSection id="confianza" {...homeContent.trust} />

      {/* 6. CTA final */}
      <CTASection {...homeContent.finalCta} cardBg="dark" />
    </>
  );
}
