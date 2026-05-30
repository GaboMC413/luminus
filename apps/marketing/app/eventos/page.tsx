import React from "react";
import type { Metadata } from "next";
import { 
  Sparkles, 
  Calendar, 
  Tv, 
  ArrowRight, 
  Clock, 
  Users, 
  Heart, 
  ExternalLink,
  Info
} from "lucide-react";
import { Hero } from "../../components/marketing/Hero";
import { FeatureGrid } from "../../components/marketing/FeatureGrid";
import { Section } from "../../components/ui/Section";
import { Container } from "../../components/ui/Container";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { eventosContent } from "../../content/eventos";

export const metadata: Metadata = {
  title: "LUMINUS Latam | Eventos, Charlas y Experiencias de Bienestar",
  description: "Crea, comparte y participa en encuentros diseñados para acercar el bienestar integral a tu vida: charlas, entrevistas, talleres prácticos y contenidos online.",
};

export default function EventosPage() {
  return (
    <>
      {/* 1. Hero Section */}
      <Hero {...eventosContent.hero} />

      {/* 2. Sección: Una forma más cercana de explorar el bienestar */}
      <Section id="explorar-bienestar" borderBottom bg="slate-50">
        <div className="absolute left-10 top-10 w-72 h-72 bg-luminus-lime/5 rounded-full blur-3xl pointer-events-none" />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Title & Badge */}
          <div className="lg:col-span-5 text-left flex flex-col items-start">
            <Badge variant="lime" className="mb-6">
              Nuestra Mirada
            </Badge>
            <h2 className="font-display text-4xl font-black tracking-tight text-black sm:text-5xl leading-tight">
              {eventosContent.narrative.title}
            </h2>
            <div className="h-2 w-20 bg-luminus-blue rounded-full mt-6 shadow-bold-sm" />
          </div>

          {/* Right Column: Paragraphs */}
          <div className="lg:col-span-7 space-y-6 text-base sm:text-lg leading-relaxed text-slate-700 font-semibold">
            {eventosContent.narrative.paragraphs.map((pText, idx) => (
              <p key={idx} className={idx === 0 ? "text-black font-extrabold" : ""}>
                {pText}
              </p>
            ))}
          </div>
        </div>
      </Section>

      {/* 3. Sección: Qué hacemos en los eventos LUMINUS */}
      <Section id="que-hacemos" borderBottom bg="white">
        <SectionHeader
          badge={<Badge variant="orange">{eventosContent.whatWeDo.badge}</Badge>}
          title={eventosContent.whatWeDo.title}
          subtitle={eventosContent.whatWeDo.subtitle}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventosContent.whatWeDo.items.map((feat, idx) => (
            <Card
              key={idx}
              hoverEffect="lift-lg"
              className="group flex flex-col justify-between rounded-[2.5rem] border-2 border-black bg-white p-8 shadow-bold hover:shadow-bold-lg transition-all duration-150"
            >
              <div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black shadow-bold-sm mb-6 transition-transform duration-200 group-hover:scale-105 ${feat.accentBgClass}`}>
                  {feat.icon}
                </div>
                <h3 className="font-display text-xl font-black text-black mb-3">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* 4. Sección: Próximos eventos (Con Simulación e Integración a Luma) */}
      <Section id="proximos-eventos" borderBottom bg="slate-50">
        <div className="absolute right-10 top-1/4 w-80 h-80 bg-luminus-pink/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-stretch">
          {/* Left Column: Luma Redirect Explanation */}
          <div className="lg:col-span-6 flex flex-col justify-between text-left">
            <div>
              <Badge variant="pink" icon={<Calendar className="h-4 w-4" />} className="mb-6">
                {eventosContent.upcoming.badge}
              </Badge>
              <h2 className="font-display text-3xl font-black tracking-tight text-black sm:text-5xl mb-6">
                {eventosContent.upcoming.title}
              </h2>
              <p className="text-lg leading-relaxed text-black font-extrabold mb-6">
                {eventosContent.upcoming.description}
              </p>
              <p className="text-sm leading-relaxed text-slate-600 font-semibold mb-8">
                {eventosContent.upcoming.disclaimer}
              </p>
            </div>

            <div>
              <Button 
                variant="primary" 
                href={eventosContent.upcoming.ctaLink} 
                asExternal
                className="w-full sm:w-auto"
              >
                {eventosContent.upcoming.ctaText}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Column: Empty State Premium Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full rounded-[2.5rem] border-2 border-black bg-white p-8 shadow-bold-lg relative overflow-hidden flex flex-col justify-between">
              {/* Colored ribbon top border */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-luminus-orange via-luminus-pink to-luminus-lime" />
              
              <div className="pt-4">
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-luminus-orange/20 border-2 border-black px-3 py-1 text-xs font-black text-black shadow-bold-sm">
                    Aviso
                  </span>
                  <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 border-2 border-black text-slate-500 shadow-bold-sm mb-6">
                  <Info className="h-6 w-6" />
                </div>

                <h3 className="font-display text-2xl font-black text-black mb-3">
                  {eventosContent.upcoming.emptyState.title}
                </h3>
                
                <p className="text-sm text-slate-900 leading-relaxed font-bold mb-4">
                  {eventosContent.upcoming.emptyState.subtitle}
                </p>
                
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  {eventosContent.upcoming.emptyState.text}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t-2 border-dashed border-slate-200">
                <a
                  href={eventosContent.upcoming.emptyState.ctaLuma}
                  className="flex-1 text-center py-3 px-4 rounded-xl border-2 border-black bg-white text-xs font-black text-black shadow-bold-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150"
                >
                  {eventosContent.upcoming.emptyState.ctaLuma}
                </a>
                <a
                  href={eventosContent.upcoming.emptyState.ctaYoutube}
                  className="flex-1 text-center py-3 px-4 rounded-xl border-2 border-black bg-luminus-lime text-xs font-black text-black shadow-bold-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150"
                >
                  {eventosContent.upcoming.emptyState.ctaYoutube}
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 5. Sección: Eventos pasados y contenidos en YouTube */}
      <Section id="past-events" borderBottom bg="white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Illustrative YouTube Video Card Mockup */}
          <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
            <div className="relative rounded-[2.5rem] border-2 border-black bg-luminus-pink/10 p-6 shadow-bold-lg max-w-[400px] w-full hover:scale-[1.01] transition-transform duration-200">
              <div className="relative aspect-video rounded-2xl border-2 border-black overflow-hidden bg-black shadow-bold-sm group mb-4">
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent z-10" />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="h-14 w-14 rounded-full border-2 border-black bg-luminus-orange text-black flex items-center justify-center shadow-bold hover:scale-105 transition-transform duration-150 cursor-pointer">
                    <span className="ml-1 triangle text-black fill-black w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-black" />
                  </div>
                </div>
                {/* Mock screenshot placeholder representing healthy lifestyle video */}
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 font-bold text-xs uppercase tracking-wider">
                  Videoteca LUMINUS
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Badge variant="lime" className="px-2 py-0.5 text-[10px]">YouTube</Badge>
                <span className="text-[10px] text-slate-500 font-bold">120+ videos disponibles</span>
              </div>
              <h4 className="font-display font-black text-black leading-tight mb-2">
                Conversaciones sobre salud, emociones y hábitos
              </h4>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                Accede a nuestro canal para seguir aprendiendo a tu ritmo y revivir charlas de nuestros expertos.
              </p>
            </div>
          </div>

          {/* Right Column: Copy & Actions */}
          <div className="lg:col-span-7 text-left order-1 lg:order-2">
            <Badge variant="orange" className="mb-4">Canal Oficial</Badge>
            <h2 className="font-display text-3xl font-black tracking-tight text-black sm:text-5xl mb-6">
              {eventosContent.pastEvents.title}
            </h2>
            <div className="space-y-6 text-base sm:text-lg leading-relaxed text-slate-700 font-semibold mb-8">
              <p className="text-black font-extrabold whitespace-pre-line">{eventosContent.pastEvents.description}</p>
              <p className="text-sm border-2 border-black border-l-8 pl-6 text-black font-bold bg-luminus-lime/10 py-4 pr-4 rounded-[2rem] shadow-bold-sm mt-4 whitespace-pre-line">
                {eventosContent.pastEvents.highlight}
              </p>
            </div>
            <Button variant="pink" href={eventosContent.pastEvents.ctaLink} asExternal>
              {eventosContent.pastEvents.ctaText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </Section>

      {/* 6. Sección: Dos caminos para participar */}
      <Section id="dos-caminos" borderBottom bg="slate-50">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="lime" className="mb-4">¿Cómo sumarte?</Badge>
          <h2 className="font-display text-3xl font-black tracking-tight text-black sm:text-5xl">
            {eventosContent.twoWays.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {eventosContent.twoWays.items.map((item, idx) => (
            <div 
              key={idx} 
              className={`rounded-[2.5rem] border-2 border-black p-8 md:p-10 flex flex-col justify-between transition-all duration-150 hover:scale-[1.01] ${
                idx === 0 
                  ? "bg-luminus-orange/10 shadow-bold-orange" 
                  : "bg-luminus-lime/10 shadow-bold-lime"
              }`}
            >
              <div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black shadow-bold-sm mb-6 ${item.accentBgClass}`}>
                  {item.icon}
                </div>
                <h3 className="font-display text-2xl font-black text-black mb-4">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-slate-700 font-semibold mb-6">
                  {item.description}
                </p>
              </div>

              <div>
                <Button 
                  variant="primary" 
                  href={idx === 0 ? eventosContent.upcoming.ctaLink : eventosContent.pastEvents.ctaLink}
                  asExternal
                  className="w-full justify-center"
                >
                  {idx === 0 ? "Inscribirme en Luma" : "Explorar en YouTube"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 7. Sección: Por qué hacemos eventos */}
      <Section id="por-que-eventos" borderBottom bg="white">
        <SectionHeader
          badge={<Badge variant="pink">{eventosContent.whyWeDoEvents.badge}</Badge>}
          title={eventosContent.whyWeDoEvents.title}
          subtitle={eventosContent.whyWeDoEvents.subtitle}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventosContent.whyWeDoEvents.items.map((feat, idx) => (
            <Card
              key={idx}
              hoverEffect="lift-lg"
              className="group flex flex-col justify-between rounded-[2.5rem] border-2 border-black bg-white p-8 shadow-bold hover:shadow-bold-lg transition-all duration-150"
            >
              <div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black shadow-bold-sm mb-6 transition-transform duration-200 group-hover:scale-105 ${feat.accentBgClass}`}>
                  {feat.icon}
                </div>
                <h3 className="font-display text-lg font-black text-black mb-3">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* 8. Sección: Para quiénes son los eventos LUMINUS */}
      <Section id="para-quienes" borderBottom bg="slate-50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Left Column: Narrative paragraphs */}
          <div className="lg:col-span-7 text-left flex flex-col justify-center">
            <Badge variant="lime" className="mb-4">Comunidad LUMINUS</Badge>
            <h2 className="font-display text-3xl font-black tracking-tight text-black sm:text-5xl mb-6">
              {eventosContent.forWhom.title}
            </h2>
            <div className="space-y-6 text-base leading-relaxed text-slate-700 font-semibold">
              {eventosContent.forWhom.paragraphs.map((p, idx) => (
                <p key={idx} className={idx === 0 ? "text-black font-extrabold text-lg" : ""}>
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Right Column: Statement Card */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="rounded-[2.5rem] border-2 border-black bg-white p-8 shadow-bold-lg relative overflow-hidden h-full flex flex-col justify-center">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-luminus-blue/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-luminus-pink border-2 border-black text-black shadow-bold-sm mb-6">
                <Heart className="h-6 w-6 stroke-[2.5]" />
              </div>
              <h3 className="font-display text-2xl font-black text-black mb-4">
                {eventosContent.forWhom.sideCard.title}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700 font-bold whitespace-pre-line">
                {eventosContent.forWhom.sideCard.text}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 9. Sección final CTA con doble botón */}
      <Section id="comenzar-camino-eventos" bg="white" className="py-24 relative overflow-hidden">
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
                  {eventosContent.finalCta.icon}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-display text-3xl font-black text-black sm:text-5xl leading-tight mb-4">
                {eventosContent.finalCta.title}
              </h2>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-800 leading-relaxed mb-8 max-w-2xl font-bold whitespace-pre-line">
                {eventosContent.finalCta.subtitle}
              </p>

              {/* Dual neobrutalist buttons side-by-side */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Button 
                  variant="primary" 
                  href={eventosContent.finalCta.primaryCta.link}
                  asExternal
                  className="w-full sm:w-auto px-8 py-4 border-2 border-black text-base font-black shadow-bold"
                >
                  {eventosContent.finalCta.primaryCta.text}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="secondary" 
                  href={eventosContent.finalCta.secondaryCta.link}
                  asExternal
                  className="w-full sm:w-auto px-8 py-4 border-2 border-black bg-white text-black font-black shadow-bold-sm"
                >
                  {eventosContent.finalCta.secondaryCta.text}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
