import React from "react";
import type { Metadata } from "next";
import { Sparkles, Check, CheckCircle2, ChevronRight, Clock, ArrowRight, Shield, HeartHandshake, User, Users, Eye } from "lucide-react";
import { Hero } from "../../components/marketing/Hero";
import { BenefitsGrid } from "../../components/marketing/BenefitsGrid";
import { PricingSection } from "../../components/marketing/PricingSection";
import { TrustSection } from "../../components/marketing/TrustSection";
import { Section } from "../../components/ui/Section";
import { Container } from "../../components/ui/Container";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { especialistasContent } from "../../content/especialistas";

export const metadata: Metadata = {
  title: "LUMINUS Latam | Para Especialistas y Profesionales del Bienestar",
  description: "Lleva tu práctica profesional a una red de confianza diseñada para amplificar tu impacto y conectar con personas interesadas en su salud integral.",
};

export default function EspecialistasPage() {
  return (
    <>
      {/* 1. Hero Section */}
      <Hero {...especialistasContent.hero} />

      {/* 2. Sección: Por qué formar parte de LUMINUS (Benefits) */}
      <BenefitsGrid {...especialistasContent.benefits} />

      {/* 3. Sección: Dos formas de participar como especialista */}
      <Section id="participar-especialista" borderBottom bg="slate-50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-radial from-luminus-pink/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="orange" className="mb-4">Participación</Badge>
          <h2 className="font-display text-3xl font-black tracking-tight text-black sm:text-5xl">
            {especialistasContent.participation.title}
          </h2>
          {especialistasContent.participation.subtitle && (
            <p className="mt-4 text-lg text-slate-600 font-semibold leading-relaxed">
              {especialistasContent.participation.subtitle}
            </p>
          )}
        </div>

        {/* Dynamic Cards Grid */}
        <div className="mx-auto grid max-w-md grid-cols-1 gap-12 md:max-w-5xl md:grid-cols-2 md:gap-8 lg:gap-12 items-stretch">
          {especialistasContent.participation.items.map((item, idx) => (
            <div key={idx} className={`${item.cardBg} rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between`}>
              {/* Top Badge */}
              {item.isPopular ? (
                <div className="absolute -top-4 left-6 flex items-center gap-1.5 rounded-full bg-black border-2 border-black px-4 py-1.5 text-xs font-black text-white shadow-bold-sm z-20">
                  <Sparkles className="h-3.5 w-3.5 text-luminus-orange" />
                  <span>{item.badgeText}</span>
                </div>
              ) : (
                item.badgeText && (
                  <div className="absolute -top-4 left-6 z-20">
                    <span className={`inline-flex items-center rounded-full border-2 border-black px-3 py-1.5 text-xs font-black text-black shadow-bold-sm ${item.badgeBg}`}>
                      {item.badgeText}
                    </span>
                  </div>
                )
              )}
              
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="mb-6 mt-2 flex flex-col items-start">
                    <h3 className="font-display text-3xl font-black text-black">
                      {item.title}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-xl font-extrabold text-black">
                        {item.priceText}
                      </span>
                      {item.priceDetail && (
                        <span className="text-sm font-bold text-slate-500">
                          {item.priceDetail}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm leading-relaxed mb-6 font-semibold ${item.isPopular ? "text-slate-900" : "text-slate-700"}`}>
                    {item.description}
                  </p>
                  
                  <hr className="border-black/10 my-6" />
                  
                  <ul className="space-y-4 mb-8">
                    {item.inclusions.map((inclusion, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-3 text-sm text-black font-bold">
                        <Check className="h-5 w-5 shrink-0 text-emerald-600 stroke-[3px] mt-0.5" />
                        <span>{inclusion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {item.note && (
                    <p className="text-[11px] leading-relaxed text-slate-500 mb-6 font-semibold bg-white/60 p-3 rounded-xl border border-black/5">
                      {item.note}
                    </p>
                  )}
                  <Button 
                    variant={item.isPopular ? "primary" : "secondary"} 
                    href={item.ctaLink}
                    className="w-full justify-center py-4 px-6 text-base font-bold border-2 border-black"
                  >
                    {item.ctaText}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Sección: Sesiones introductorias de 15 minutos */}
      <Section id="sesiones-introductorias" borderBottom bg="white">
        <div className="absolute right-10 top-10 w-72 h-72 bg-luminus-lime/5 rounded-full blur-3xl pointer-events-none" />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Copy */}
          <div className="lg:col-span-7 text-left flex flex-col items-start">
            <Badge variant="pink" icon={<Clock className="h-4 w-4" />} className="mb-6">
              Conexión de Valor
            </Badge>

            <h2 className="font-display text-3xl font-black tracking-tight text-black sm:text-5xl mb-6">
              {especialistasContent.introSessions.title}
            </h2>
            
            <p className="text-lg leading-relaxed text-black font-extrabold mb-6">
              {especialistasContent.introSessions.subtitle}
            </p>

            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-700 font-semibold mb-8">
              {especialistasContent.introSessions.paragraphs.map((pText, pIdx) => (
                <p key={pIdx}>{pText}</p>
              ))}
            </div>

            <Button variant="primary" href={especialistasContent.introSessions.ctaLink}>
              {especialistasContent.introSessions.ctaText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Right Column: Premium Booking Simulator widget */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[400px] rounded-[2.5rem] border-2 border-black bg-white p-6 shadow-bold-lg transition-transform duration-300 hover:rotate-1 relative overflow-hidden">
              {/* Badge representing Plus */}
              <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-black px-3 py-1 text-[10px] font-black text-white shadow-bold-sm">
                <Sparkles className="h-3 w-3 text-luminus-orange" />
                <span>PLUS</span>
              </div>

              {/* Specialist Profile Mockup */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-full border-2 border-black bg-luminus-pink flex items-center justify-center font-display text-xl font-black text-black shadow-bold-sm shrink-0">
                  SL
                </div>
                <div>
                  <h4 className="font-display font-black text-black leading-tight">Dr. Sofía López</h4>
                  <p className="text-xs text-slate-500 font-bold">Terapeuta & Coach de Vida</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-600 font-black">Sesión de 15 min disponible</span>
                  </div>
                </div>
              </div>

              {/* Interactive slot simulator */}
              <div className="border-t-2 border-dashed border-black/10 pt-4 mb-6">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
                  Selecciona un horario introductorio
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {["10:00 AM", "11:30 AM", "15:15 PM", "16:00 PM", "17:30 PM", "18:45 PM"].map((timeSlot, tsIdx) => (
                    <button
                      key={tsIdx}
                      className={`py-2 px-1 text-xs font-black rounded-xl border border-black shadow-bold-sm transition-all duration-150 ${
                        tsIdx === 2
                          ? "bg-luminus-lime text-black"
                          : "bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {timeSlot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Callout box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-black/10 flex items-start gap-3">
                <Clock className="h-5 w-5 text-luminus-orange shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h5 className="text-xs font-black text-black">Conexión Express 100% gratuita</h5>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-0.5">
                    Un espacio rápido para conocer tu enfoque, resolver dudas rápidas y evaluar si deseas comenzar un acompañamiento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 5. Sección: Funciones pensadas para especialistas del bienestar */}
      <Section id="funciones-especialistas" borderBottom bg="slate-50">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="lime" className="mb-4">Herramientas</Badge>
          <h2 className="font-display text-3xl font-black tracking-tight text-black sm:text-5xl">
            {especialistasContent.features.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-700 font-semibold leading-relaxed">
            {especialistasContent.features.subtitle}
          </p>
        </div>

        {/* 6 Grid items with individual CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {especialistasContent.features.items.map((feat, idx) => (
            <div key={idx} className="flex flex-col justify-between rounded-[2.5rem] border-2 border-black bg-white p-8 shadow-bold hover:shadow-bold-lg hover:-translate-y-0.5 transition-all duration-150 group">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black shadow-bold-sm bg-black text-white mb-6 transition-transform duration-200 group-hover:scale-105">
                  {feat.icon}
                </div>
                <h3 className="font-display text-xl font-black text-black mb-3">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-700 font-semibold leading-relaxed mb-6">
                  {feat.description}
                </p>
              </div>

              <div>
                <a 
                  href={feat.ctaLink} 
                  className="inline-flex items-center gap-1 text-xs font-black text-black hover:text-luminus-blue transition-colors group/link"
                >
                  <span>{feat.ctaText}</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 6. Sección: Una primera conversación puede abrir una relación profesional */}
      <Section borderBottom bg="white" className="relative py-28 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-radial from-luminus-orange/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl md:text-5xl font-black leading-tight text-black mb-6">
              "Una primera conversación puede abrir una relación profesional"
            </h2>
            <div className="w-16 h-1.5 bg-luminus-orange mx-auto rounded-full mb-8 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto text-sm sm:text-base leading-relaxed text-slate-700 font-bold">
              <p>
                Las sesiones introductorias de 15 minutos permiten que los usuarios conozcan tu enfoque antes de avanzar con un servicio, tratamiento o proceso más profundo.
              </p>
              <p>
                Para los especialistas, son una forma simple de generar confianza, explicar cómo trabajan y conectar con personas que ya están buscando acompañamiento dentro de LUMINUS.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* 7. Sección: Planes para especialistas */}
      <div id="planes-especialistas">
        <PricingSection 
          plans={especialistasContent.pricing.plans}
          title={especialistasContent.pricing.title}
          subtitle={especialistasContent.pricing.subtitle}
          badge="Suscripciones"
        />
      </div>

      {/* 8. Sección: Una experiencia pensada para profesionales independientes */}
      <Section borderBottom bg="slate-50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Visual graphic represent of independence */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
            <div className="relative rounded-[2.5rem] border-2 border-black bg-luminus-lime/10 p-8 shadow-bold-lg max-w-[380px] w-full text-center hover:scale-[1.02] transition-transform duration-200">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-luminus-lime border-2 border-black text-black shadow-bold-sm mb-6">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl font-black text-black mb-4">
                100% Independiente
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700 font-bold mb-6">
                Tú mantienes tu independencia profesional, defines tu enfoque, tus servicios, tus precios, condiciones y la forma en que decides acompañar a cada persona.
              </p>
              <div className="flex items-center justify-center gap-2 border border-dashed border-black/20 p-3 rounded-2xl bg-white/60">
                <Sparkles className="h-4 w-4 text-luminus-orange shrink-0 animate-pulse" />
                <span className="text-[11px] text-slate-600 font-extrabold">
                  Conserva tu libertad e identidad profesional.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Statement Paragraphs */}
          <div className="lg:col-span-7 order-1 lg:order-2 text-left">
            <Badge variant="lime" className="mb-4">Práctica Libre</Badge>
            <h2 className="font-display text-3xl font-black tracking-tight text-black sm:text-5xl mb-6">
              {especialistasContent.independence.title}
            </h2>
            <div className="space-y-6 text-base sm:text-lg leading-relaxed text-slate-700 font-bold">
              {especialistasContent.independence.paragraphs.map((para, paraIdx) => (
                <p key={paraIdx}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 9. Sección: Cómo funciona (5 steps custom grid) */}
      <Section id="como-funciona" borderBottom bg="white">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="orange" className="mb-4">Paso a Paso</Badge>
          <h2 className="font-display text-3xl font-black tracking-tight text-black sm:text-5xl">
            {especialistasContent.stepsSection.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-700 font-semibold leading-relaxed">
            {especialistasContent.stepsSection.subtitle}
          </p>
        </div>

        {/* Custom 5 column grid responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {especialistasContent.stepsSection.steps.map((step, idx) => (
            <div 
              key={idx}
              className={`relative flex flex-col justify-between rounded-[2rem] border-2 border-black bg-white p-6 ${step.shadowColor} hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 group`}
            >
              {/* Number indicator */}
              <div className="flex items-baseline justify-between mb-6">
                <span className={`font-display text-5xl font-black tracking-tight ${step.numColor} transition-transform duration-200 group-hover:scale-110`}>
                  {step.num}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black border border-black shadow-bold-sm ${step.badgeBg}`}>
                  Paso {step.num}
                </span>
              </div>

              <div>
                <h3 className="font-display text-lg font-black text-black mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 font-bold leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center">
          <Button variant="primary" href={especialistasContent.stepsSection.ctaLink}>
            {especialistasContent.stepsSection.ctaText}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </Section>

      {/* 10. Sección: Empieza sin compromiso */}
      <TrustSection {...especialistasContent.trust} />

      {/* 11. Sección: Empieza tu camino como Especialista LUMINUS (Custom Final CTA with double button) */}
      <Section id="comenzar-camino" bg="white" borderBottom className="py-24 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-luminus-orange/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-5xl px-6">
          <div className="relative rounded-[2.5rem] border-2 border-black p-8 md:p-16 text-center shadow-bold-lg overflow-hidden bg-luminus-orange/15">
            
            {/* Subtle connecting lines */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-luminus-blue/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-luminus-lime/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              {/* Sparkle icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black border-2 border-black shadow-bold-sm mb-6 text-luminus-orange">
                <span className="flex items-center justify-center [&>svg]:h-6 [&>svg]:w-6">
                  {especialistasContent.finalCta.icon}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-display text-3xl font-black text-black sm:text-5xl leading-tight mb-4">
                {especialistasContent.finalCta.title}
              </h2>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-800 leading-relaxed mb-8 max-w-2xl font-bold whitespace-pre-line">
                {especialistasContent.finalCta.subtitle}
              </p>

              {/* Dual neobrutalist buttons side-by-side */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Button 
                  variant="primary" 
                  href={especialistasContent.finalCta.ctaLink}
                  className="w-full sm:w-auto px-8 py-4 border-2 border-black text-base font-black shadow-bold"
                >
                  {especialistasContent.finalCta.ctaText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="secondary" 
                  href={especialistasContent.finalCta.secondaryCtaLink}
                  className="w-full sm:w-auto px-8 py-4 border-2 border-black bg-white text-black font-black shadow-bold-sm"
                >
                  {especialistasContent.finalCta.secondaryCtaText}
                </Button>
              </div>

              {/* Microcopy info below button */}
              {especialistasContent.finalCta.microcopy && (
                <p className="text-xs text-slate-500 font-bold mt-6">
                  * Aprobación sujeta a revisión. Podrás completar tu perfil posterior al registro.
                </p>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* 12. Microcopy legal footer text */}
      <section className="bg-slate-50 py-8 border-b-2 border-black">
        <Container className="text-center">
          <p className="max-w-4xl mx-auto text-[11px] leading-relaxed text-slate-500 font-semibold text-justify sm:text-center px-4">
            {especialistasContent.legalFootnote.text}
          </p>
        </Container>
      </section>
    </>
  );
}
