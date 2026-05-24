import React from "react";
import { Heart, ShieldCheck, Milestone } from "lucide-react";

export default function BenefitsSection() {
  const benefits = [
    {
      title: "Conexiones significativas",
      description: "Conoce personas con intereses, búsquedas y experiencias afines.",
      icon: <Heart className="h-6 w-6 text-rose-500" />,
      bgColor: "bg-rose-50 border-rose-100/50",
    },
    {
      title: "Acompañamiento confiable",
      description: "Descubre expertos, recursos y espacios pensados para guiarte mejor.",
      icon: <ShieldCheck className="h-6 w-6 text-luminus-blue" />,
      bgColor: "bg-luminus-blue-soft border-blue-100/50",
    },
    {
      title: "Bienestar con dirección",
      description: "Encuentra herramientas para ordenar tu proceso y avanzar con más equilibrio.",
      icon: <Milestone className="h-6 w-6 text-teal-600" />,
      bgColor: "bg-luminus-mint-soft border-teal-100/50",
    },
  ];

  return (
    <section className="py-24 bg-white border-y border-slate-100 relative overflow-hidden">
      {/* Soft decorative background elements */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-10 bottom-10 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-center">
          
          {/* Headline and Narrative Paragraph */}
          <div className="lg:col-span-5 text-left">
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-luminus-text sm:text-5xl mb-6">
              Una red para no transitar tu proceso en soledad
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-luminus-secondary">
              El bienestar no sucede de forma aislada. En LUMINUS puedes encontrar personas, contenidos, expertos y espacios que te ayuden a tomar mejores decisiones, descubrir nuevas perspectivas y sostener tu proceso personal con mayor claridad.
            </p>
          </div>

          {/* Core Benefit Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => (
              <div 
                key={idx}
                className="flex flex-col items-start p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-premium transition-all duration-300 group"
              >
                {/* Icon wrapper */}
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border mb-5 ${benefit.bgColor}`}>
                  {benefit.icon}
                </div>
                
                {/* Benefit Name */}
                <h3 className="font-display text-base font-bold text-luminus-text mb-2 group-hover:text-luminus-blue transition-colors duration-200">
                  {benefit.title}
                </h3>
                
                {/* Benefit Description */}
                <p className="text-xs sm:text-sm text-luminus-secondary leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
