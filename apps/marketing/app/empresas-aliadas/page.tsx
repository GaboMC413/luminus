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
  title: "Empresas Aliadas | LUMINUS Latam",
  description: "Co-diseña el futuro del bienestar regional con nosotros. Únete a las organizaciones que integran salud integral y desarrollo humano en América Latina.",
};

export default function EmpresasAliadasPage() {
  return (
    <>
      {/* 1. Hero Section */}
      <Hero {...empresasAliadasContent.hero} gradientClass="hero-companies-gradient" />

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
        <div className="absolute right-10 top-10 w-96 h-96 bg-[#FFE0C2]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Narrative texts */}
          <div className="lg:col-span-7 text-left flex flex-col items-start animate-fadeIn">
            <Badge variant="orange" className="mb-6">
              Una Visión Regional
            </Badge>

            <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6 leading-tight">
              {empresasAliadasContent.latamVision.title}
            </h2>
            <div className="space-y-6 text-base sm:text-lg leading-relaxed text-slate-600 font-medium">
              <p>{empresasAliadasContent.latamVision.description}</p>
              <div className="border border-slate-200 border-l-4 border-l-[#D4E600] pl-6 text-slate-700 font-medium bg-[#F4F8B8]/30 py-4 pr-4 rounded-3xl shadow-soft mt-4">
                {empresasAliadasContent.latamVision.highlight}
              </div>
            </div>
          </div>

          {/* Right Column: Key Pillars Card */}
          <div className="lg:col-span-5 animate-fadeIn">
            <div className="card rounded-3xl border border-slate-200/80 bg-[#FFE0C2]/30 p-8 shadow-soft transition-all duration-300 hover:shadow-medium hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-[#FF7700] text-white shadow-soft mb-6">
                {empresasAliadasContent.latamVision.cardIcon}
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-6">
                {empresasAliadasContent.latamVision.cardTitle}
              </h3>
              <ul className="space-y-4">
                {empresasAliadasContent.latamVision.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#B84A00] stroke-[2px] mt-0.5" />
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
              <div className="card rounded-3xl border border-slate-200/80 bg-[#F4F8B8]/30 p-8 md:p-10 shadow-soft transition-all duration-300 hover:shadow-medium hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-[#D4E600] text-[#7A8500] shadow-soft mb-6">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 mb-4">
                  Red de Bienestar Co-creada
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 font-medium mb-6">
                  {empresasAliadasContent.supportValue.highlight}
                </p>
                <div className="flex items-center gap-3 border border-dashed border-slate-200 p-4 rounded-2xl bg-white/80">
                  <Sparkles className="h-5 w-5 text-[#FF7700] shrink-0 animate-pulse" />
                  <span className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Súmate como Empresa Aliada y sé parte de la co-creación de impacto.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Bullets */}
            <div className="lg:col-span-7 order-1 lg:order-2 text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#FF7700] mb-3 block">
                Valor del Aporte
              </span>
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-8 leading-tight">
                {empresasAliadasContent.supportValue.title}
              </h2>
              
              <p className="text-base sm:text-lg leading-relaxed text-slate-600 font-medium mb-8">
                {empresasAliadasContent.supportValue.description}
              </p>

              <ul className="space-y-4">
                {empresasAliadasContent.supportValue.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3.5 text-sm sm:text-base text-slate-600 font-medium">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F4F8B8] text-[#7A8500] border border-[#D4E600]/30 text-[10px] font-semibold">
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
          <div className="card max-w-4xl mx-auto rounded-3xl border border-slate-200/80 bg-white/80 p-8 md:p-12 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-[#0450FB] text-white shadow-soft">
                <Shield className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-slate-900">
                  {empresasAliadasContent.transparency.title}
                </h3>
              </div>
            </div>
            
            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 font-medium pl-1">
              <p>{empresasAliadasContent.transparency.description}</p>
              <p className="border-t border-slate-100 pt-4 font-semibold text-slate-700 flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-[#FF7700] shrink-0 mt-0.5" />
                <span>{empresasAliadasContent.transparency.highlight}</span>
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* 7.5 Sección: Para quiénes es */}
      <div id="para-quienes-es">
        <FeatureGrid
          title={empresasAliadasContent.forWhom.title}
          subtitle={empresasAliadasContent.forWhom.subtitle}
          badge={empresasAliadasContent.forWhom.badge}
          items={empresasAliadasContent.forWhom.items}
          bg="white"
        />
      </div>

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
      <CTASection {...empresasAliadasContent.finalCta} cardBg="dark" />
    </>
  );
}
