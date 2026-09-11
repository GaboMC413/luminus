import React from "react";
import type { Metadata } from "next";
import { Hero } from "../../components/marketing/Hero";
import { ProblemSection } from "../../components/marketing/about/ProblemSection";
import { FeatureGrid } from "../../components/marketing/FeatureGrid";
import { PlatformSection } from "../../components/marketing/about/PlatformSection";
import { CTASection } from "../../components/marketing/CTASection";
import { aboutContent } from "../../content/about";

export const metadata: Metadata = {
  title: "Sobre Nosotros | LUMINUS LATAM",
  description:
    "Conoce nuestra historia, visión y los principios fundamentales de LUMINUS: una plataforma que integra comunidad, especialistas y tecnología consciente en América Latina.",
  alternates: {
    canonical: "https://luminuslatam.com/sobre-nosotros",
  },
  openGraph: {
    type: "website",
    locale: "es_LA",
    url: "https://luminuslatam.com/sobre-nosotros",
    siteName: "LUMINUS LATAM",
    title: "Sobre Nosotros | LUMINUS LATAM",
    description:
      "Conoce nuestra historia, visión y los principios fundamentales de LUMINUS: una plataforma que integra comunidad, especialistas y tecnología consciente en América Latina.",
    images: [
      {
        url: "https://luminuslatam.com/luminus_platform.jpg",
        secureUrl: "https://luminuslatam.com/luminus_platform.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "LUMINUS LATAM - Sobre Nosotros",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre Nosotros | LUMINUS LATAM",
    description:
      "Conoce nuestra historia, visión y los principios fundamentales de LUMINUS: una plataforma que integra comunidad, especialistas y tecnología consciente en América Latina.",
    images: ["https://luminuslatam.com/luminus_platform.jpg"],
  },
};

export default function SobreNosotrosPage() {
  return (
    <>
      {/* 1. Hero Section */}
      <Hero {...aboutContent.hero} gradientClass="hero-about-gradient" />

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
      <CTASection {...aboutContent.finalCta} cardBg="dark" />
    </>
  );
}
