import React from "react";
import type { Metadata } from "next";
import { CheckCircle2, Shield, HeartHandshake, Sparkles, Building, Award, Target, MessageSquare } from "lucide-react";
import { Hero } from "../../components/marketing/Hero";
import { FeatureGrid } from "../../components/marketing/FeatureGrid";
import { BenefitsGrid } from "../../components/marketing/BenefitsGrid";
import { PricingSection } from "../../components/marketing/PricingSection";
import { CTASection } from "../../components/marketing/CTASection";
import { Section } from "../../components/ui/Section";
import { Container } from "../../components/ui/Container";
import { Badge } from "../../components/ui/Badge";
import { empresasAliadasContent } from "../../content/empresas-aliadas";

export const metadata: Metadata = {
  title: "LUMINUS Latam | Empresas Aliadas",
  description: "Forma parte del grupo de organizaciones que acompañan y co-diseñan el futuro del bienestar y el desarrollo humano en América Latina.",
};

export default function EmpresasAliadasPage() {
  return (
    <>
      {/* 1. Hero Section */}
      <Hero {...empresasAliadasContent.hero} />

      {/* 2. Sección: Estamos construyendo mucho más que una plataforma */}
      <div id="construyendo-plataforma">
        <FeatureGrid 
          title={empresasAliadasContent.vision.title}
          subtitle={empresasAliadasContent.vision.subtitle}
          badge={empresasAliadasContent.vision.badge}
          items={empresasAliadasContent.vision.items}
          bg="slate-50"
        />
      </div>

      {/* 3. Sección: Una visión para América Latina */}
      <Section borderBottom bg="white">
        <div className="absolute right-10 top-10 w-72 h-72 bg-luminus-orange/5 rounded-full blur-3xl pointer-events-none" />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Narrative texts */}
          <div className="lg:col-span-7 text-left flex flex-col items-start">
            <Badge variant="orange" className="mb-6">
              Una Visión Regional
            </Badge>

            <h2 className="font-display text-4xl font-black tracking-tight text-black sm:text-5xl mb-6">
              {empresasAliadasContent.latamVision.title}
            </h2>
            <div className="space-y-6 text-base sm:text-lg leading-relaxed text-slate-700 font-semibold">
              <p>{empresasAliadasContent.latamVision.description}</p>
              <div className="border-2 border-black border-l-8 pl-6 text-black font-bold bg-luminus-lime/15 py-4 pr-4 rounded-[2rem] shadow-bold-sm mt-4">
                {empresasAliadasContent.latamVision.highlight}
              </div>
            </div>
          </div>

          {/* Right Column: Key Pillars Card */}
          <div className="lg:col-span-5">
            <div className="rounded-[2.5rem] border-2 border-black bg-luminus-orange/10 p-8 shadow-bold-lg transition-all duration-150">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-luminus-orange border-2 border-black text-black shadow-bold-sm mb-6">
                {empresasAliadasContent.latamVision.cardIcon}
              </div>
              <h3 className="font-display text-2xl font-black text-black mb-6">
                {empresasAliadasContent.latamVision.cardTitle}
              </h3>
              <ul className="space-y-4">
                {empresasAliadasContent.latamVision.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-800 font-bold">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 stroke-[3px] mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* 4. Sección: Empresas que creen en el futuro de LUMINUS */}
      <FeatureGrid
        title={empresasAliadasContent.philosophy.title}
        subtitle={empresasAliadasContent.philosophy.subtitle}
        badge={empresasAliadasContent.philosophy.badge}
        items={empresasAliadasContent.philosophy.items}
        bg="slate-50"
      />

      {/* 5. Sección: ¿Qué representa su aporte? */}
      <Section borderBottom bg="white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Visual graphic */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative rounded-[2.5rem] border-2 border-black bg-luminus-lime/10 p-8 md:p-10 shadow-bold-lg transition-all duration-150">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-luminus-lime border-2 border-black text-black shadow-bold-sm mb-6">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl font-black text-black mb-4">
                  Red de Bienestar Co-creada
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-slate-700 font-bold mb-6">
                  {empresasAliadasContent.supportValue.highlight}
                </p>
                <div className="flex items-center gap-3 border border-dashed border-black/20 p-4 rounded-2xl bg-white/60">
                  <Sparkles className="h-5 w-5 text-luminus-orange shrink-0 animate-pulse" />
                  <span className="text-xs text-slate-600 font-semibold leading-relaxed">
                    Súmate como Empresa Aliada y sé parte de la co-creación de impacto.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Bullets */}
            <div className="lg:col-span-7 order-1 lg:order-2 text-left">
              <span className="text-xs font-black uppercase tracking-wider text-luminus-orange mb-3 block">
                Valor del Aporte
              </span>
              <h2 className="font-display text-3xl font-black tracking-tight text-black sm:text-5xl mb-8">
                {empresasAliadasContent.supportValue.title}
              </h2>
              
              <p className="text-base sm:text-lg leading-relaxed text-slate-700 font-bold mb-8">
                {empresasAliadasContent.supportValue.description}
              </p>

              <ul className="space-y-4">
                {empresasAliadasContent.supportValue.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3.5 text-sm sm:text-base text-slate-800 font-bold">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-luminus-lime text-black border-2 border-black text-[10px] font-black">
                      {idx + 1}
                    </div>
                    <span className="pt-0.5 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* 6. Sección: Reconocimiento y participación */}
      <BenefitsGrid {...empresasAliadasContent.perks} />

      {/* 7. Sección: Independencia y transparencia */}
      <Section borderBottom bg="slate-50" className="relative overflow-hidden py-16">
        <Container>
          <div className="max-w-4xl mx-auto rounded-[2.5rem] border-2 border-black bg-white p-8 md:p-12 shadow-bold-lg transition-transform duration-300 hover:scale-[1.01]">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-luminus-blue text-white border-2 border-black shadow-bold-sm">
                <Shield className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-black text-black">
                  {empresasAliadasContent.transparency.title}
                </h3>
              </div>
            </div>
            
            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-700 font-semibold pl-1">
              <p>{empresasAliadasContent.transparency.description}</p>
              <p className="border-t border-black/10 pt-4 font-bold text-black flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-luminus-orange shrink-0 mt-0.5" />
                <span>{empresasAliadasContent.transparency.highlight}</span>
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* 8. Formas de participar */}
      <div id="formas-participar">
        <PricingSection 
          plans={empresasAliadasContent.plans.items} 
          badge={empresasAliadasContent.plans.badge}
          title={empresasAliadasContent.plans.title}
          subtitle={empresasAliadasContent.plans.subtitle}
        />
      </div>

      {/* 9. Sección final CTA */}
      <CTASection {...empresasAliadasContent.finalCta} />
    </>
  );
}
