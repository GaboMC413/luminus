import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
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
  title: "Eventos y Actividades | LUMINUS Latam",
  description: "Talleres, charlas en vivo y experiencias diseñadas para acercar el bienestar integral a tu vida. Únete a nuestros encuentros y accede a la videoteca en YouTube.",
};

export default function EventosPage() {
  return (
    <>
      {/* 1. Hero Section */}
      <Hero {...eventosContent.hero} />

      {/* 2. Sección: Una forma más cercana de explorar el bienestar */}
      <Section id="explorar-bienestar" borderBottom bg="slate-50">
        <div className="absolute left-10 top-10 w-72 h-72 bg-[#F4F8B8]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Title & Badge */}
          <div className="lg:col-span-5 text-left flex flex-col items-start animate-fadeIn">
            <Badge variant="lime" className="mb-6">
              Nuestra Mirada
            </Badge>
            <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-tight">
              {eventosContent.narrative.title}
            </h2>
            <div className="h-1 w-20 bg-[#0450FB] rounded-full mt-6" />
          </div>

          {/* Right Column: Paragraphs */}
          <div className="lg:col-span-7 space-y-6 text-base sm:text-lg leading-relaxed text-slate-600 font-medium">
            {eventosContent.narrative.paragraphs.map((pText, idx) => (
              <p key={idx} className={idx === 0 ? "text-slate-800 font-semibold" : ""}>
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
          {eventosContent.whatWeDo.items.map((feat, idx) => {
            // Determine top accent border class
            let accentBorderClass = "border-t-4 border-slate-900";
            if (feat.accentBgClass.includes("blue")) accentBorderClass = "border-t-4 border-[#0450FB]";
            else if (feat.accentBgClass.includes("lime")) accentBorderClass = "border-t-4 border-[#D4E600]";
            else if (feat.accentBgClass.includes("orange")) accentBorderClass = "border-t-4 border-[#FF7700]";
            else if (feat.accentBgClass.includes("pink")) accentBorderClass = "border-t-4 border-[#FF80FC]";

            return (
              <Card
                key={idx}
                hoverEffect="lift-lg"
                className={`group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all duration-300 ${accentBorderClass}`}
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/80 text-slate-700 shadow-soft mb-6 transition-transform duration-300 group-hover:scale-105">
                    {feat.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mb-3">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* 3.5 Sección: Temáticas */}
      <Section id="tematicas" borderBottom bg="slate-50">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="pink">{eventosContent.topicsSection.badge}</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl mt-4 leading-tight">
              {eventosContent.topicsSection.title}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
              {eventosContent.topicsSection.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
            {eventosContent.topicsSection.topics.map((topic, idx) => (
              <div 
                key={idx}
                className="py-2 px-4 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-soft hover:bg-slate-50 hover:-translate-y-[1px] transition-all duration-200 cursor-default"
              >
                {topic}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 4. Sección: Próximos eventos (Con Simulación e Integración a Luma) */}
      <Section id="proximos-eventos" borderBottom bg="white">
        <div className="absolute right-10 top-1/4 w-80 h-80 bg-[#FFE0FC]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-stretch">
          {/* Left Column: Luma Redirect Explanation */}
          <div className="lg:col-span-6 flex flex-col justify-between text-left animate-fadeIn">
            <div>
              <Badge variant="pink" icon={<Calendar className="h-4 w-4" />} className="mb-6">
                {eventosContent.upcoming.badge}
              </Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6 leading-tight">
                {eventosContent.upcoming.title}
              </h2>
              <p className="text-lg leading-relaxed text-slate-800 font-semibold mb-6">
                {eventosContent.upcoming.description}
              </p>
              <p className="text-sm leading-relaxed text-slate-500 font-medium mb-8">
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
          <div className="lg:col-span-6 flex justify-center animate-fadeIn">
            <div className="w-full rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-soft relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-medium">
              {/* Colored ribbon top border */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-luminus-orange via-luminus-pink to-luminus-lime" />
              
              <div className="pt-4">
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE0C2] px-3.5 py-1 text-[11px] font-semibold text-[#B84A00] border border-[#FF7700]/20">
                    Aviso
                  </span>
                  <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 shadow-soft mb-6">
                  <Info className="h-6 w-6" />
                </div>

                <h3 className="font-display text-xl font-bold text-slate-900 mb-3">
                  {eventosContent.upcoming.emptyState.title}
                </h3>
                
                <p className="text-sm text-slate-700 leading-relaxed font-semibold mb-4">
                  {eventosContent.upcoming.emptyState.subtitle}
                </p>
                
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {eventosContent.upcoming.emptyState.text}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-100">
                <a
                  href={eventosContent.upcoming.emptyState.ctaLuma}
                  className="flex-1 text-center py-2.5 px-4 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-soft hover:bg-slate-50 hover:-translate-y-[1px] transition-all duration-200"
                >
                  {eventosContent.upcoming.emptyState.ctaLuma}
                </a>
                <a
                  href={eventosContent.upcoming.emptyState.ctaYoutube}
                  className="flex-1 text-center py-2.5 px-4 rounded-full border border-[#D4E600]/20 bg-[#F4F8B8] text-xs font-semibold text-[#7A8500] shadow-soft hover:bg-[#F4F8B8]/80 hover:-translate-y-[1px] transition-all duration-200"
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
          <div className="lg:col-span-5 flex justify-center order-2 lg:order-1 animate-fadeIn">
            <div className="card relative rounded-3xl border border-slate-200/80 bg-[#FFE0FC]/30 p-6 shadow-soft max-w-[400px] w-full transition-all duration-300 hover:shadow-medium hover:-translate-y-1">
              <div className="relative aspect-video rounded-xl border border-slate-100 overflow-hidden bg-slate-100 shadow-inner group mb-4">
                <Image
                  src="/luminus_photo_placeholder.png"
                  alt="Videoteca LUMINUS"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent z-10" />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="h-12 w-12 rounded-full bg-[#FF7700] text-white flex items-center justify-center shadow-medium hover:scale-105 transition-transform duration-200 cursor-pointer">
                    <span className="ml-1.5 triangle text-white fill-white w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Badge variant="lime" className="px-2 py-0.5 text-[10px]">YouTube</Badge>
                <span className="text-[10px] text-slate-400 font-semibold">120+ videos disponibles</span>
              </div>
              <h4 className="font-display font-bold text-slate-900 leading-tight mb-2">
                Conversaciones sobre salud, emociones y hábitos
              </h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Accede a nuestro canal para seguir aprendiendo a tu ritmo y revivir charlas de nuestros expertos.
              </p>
            </div>
          </div>

          {/* Right Column: Copy & Actions */}
          <div className="lg:col-span-7 text-left order-1 lg:order-2 animate-fadeIn">
            <Badge variant="orange" className="mb-4">Canal Oficial</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6 leading-tight">
              {eventosContent.pastEvents.title}
            </h2>
            <div className="space-y-6 text-base sm:text-lg leading-relaxed text-slate-600 font-medium mb-8">
              <p className="text-slate-800 font-semibold whitespace-pre-line">{eventosContent.pastEvents.description}</p>
              <div className="text-sm border border-slate-200 border-l-4 border-l-[#D4E600] pl-6 text-slate-700 font-medium bg-[#F4F8B8]/30 py-4 pr-4 rounded-3xl shadow-soft mt-4 whitespace-pre-line">
                {eventosContent.pastEvents.highlight}
              </div>
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
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {eventosContent.twoWays.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {eventosContent.twoWays.items.map((item, idx) => {
            let accentBorderClass = "border-t-4 border-[#FF7700]";
            if (idx === 1) accentBorderClass = "border-t-4 border-[#D4E600]";

            return (
              <div 
                key={idx} 
                className={`card rounded-3xl border border-slate-200/80 p-8 md:p-10 flex flex-col justify-between transition-all duration-300 hover:shadow-medium hover:-translate-y-1 ${
                  idx === 0 
                    ? "bg-[#FFE0C2]/30" 
                    : "bg-[#F4F8B8]/30"
                } ${accentBorderClass}`}
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-700 shadow-soft mb-6">
                    {item.icon}
                  </div>
                  <h3 className="font-display text-2xl font-bold text-slate-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-600 font-medium mb-6">
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
            );
          })}
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
          {eventosContent.whyWeDoEvents.items.map((feat, idx) => {
            let accentBorderClass = "border-t-4 border-slate-900";
            if (feat.accentBgClass.includes("blue")) accentBorderClass = "border-t-4 border-[#0450FB]";
            else if (feat.accentBgClass.includes("lime")) accentBorderClass = "border-t-4 border-[#D4E600]";
            else if (feat.accentBgClass.includes("orange")) accentBorderClass = "border-t-4 border-[#FF7700]";
            else if (feat.accentBgClass.includes("pink")) accentBorderClass = "border-t-4 border-[#FF80FC]";

            return (
              <Card
                key={idx}
                hoverEffect="lift-lg"
                className={`group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all duration-300 ${accentBorderClass}`}
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-slate-50/80 text-slate-700 shadow-soft mb-6 transition-transform duration-300 group-hover:scale-105">
                    {feat.icon}
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-3">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* 8. Sección: Para quiénes son los eventos LUMINUS */}
      <Section id="para-quienes" borderBottom bg="slate-50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Left Column: Narrative paragraphs */}
          <div className="lg:col-span-7 text-left flex flex-col justify-center animate-fadeIn">
            <Badge variant="lime" className="mb-4">Comunidad LUMINUS</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6 leading-tight">
              {eventosContent.forWhom.title}
            </h2>
            <div className="space-y-6 text-base leading-relaxed text-slate-600 font-medium">
              {eventosContent.forWhom.paragraphs.map((p, idx) => (
                <p key={idx} className={idx === 0 ? "text-slate-800 font-bold text-lg" : ""}>
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Right Column: Statement Card */}
          <div className="lg:col-span-5 flex items-center justify-center animate-fadeIn">
            <div className="card rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-soft relative overflow-hidden h-full flex flex-col justify-center transition-all duration-300 hover:shadow-medium">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#DCE6FF]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE0FC] border border-[#FF80FC]/10 text-[#B832B4] shadow-soft mb-6">
                <Heart className="h-6 w-6 stroke-[2px]" />
              </div>
              <h3 className="font-display text-2xl font-bold text-slate-900 mb-4">
                {eventosContent.forWhom.sideCard.title}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-500 font-medium whitespace-pre-line">
                {eventosContent.forWhom.sideCard.text}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 9. Sección final CTA con doble botón */}
      <Section id="comenzar-camino-eventos" bg="white" className="py-24 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-[#FFE0C2]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-5xl px-6">
          <div className="relative rounded-3xl border border-slate-200/80 p-8 md:p-16 text-center shadow-soft overflow-hidden highlight-module bg-gradient-to-tr from-[#FFE0C2]/30 to-[#FFE0FC]/10 animate-fadeIn">
            
            {/* Subtle connecting lines */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#DCE6FF]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#F4F8B8]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              {/* Sparkle icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-[#FF7700] shadow-soft mb-6">
                <span className="flex items-center justify-center [&>svg]:h-6 [&>svg]:w-6">
                  {eventosContent.finalCta.icon}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-5xl leading-tight mb-4">
                {eventosContent.finalCta.title}
              </h2>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl font-medium whitespace-pre-line">
                {eventosContent.finalCta.subtitle}
              </p>

              {/* Dual round buttons side-by-side */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Button 
                  variant="primary" 
                  href={eventosContent.finalCta.primaryCta.link}
                  asExternal
                  className="w-full sm:w-auto px-8 py-3.5 border border-black text-base font-semibold shadow-soft hover:shadow-medium hover:bg-neutral-900"
                >
                  {eventosContent.finalCta.primaryCta.text}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="secondary" 
                  href={eventosContent.finalCta.secondaryCta.link}
                  asExternal
                  className="w-full sm:w-auto px-8 py-3.5 border border-slate-200 bg-white text-slate-800 font-semibold shadow-soft hover:shadow-medium hover:bg-slate-50"
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
