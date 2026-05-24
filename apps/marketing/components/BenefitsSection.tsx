import React from "react";
import { Heart, ShieldCheck, Milestone } from "lucide-react";

export default function BenefitsSection() {
  const benefits = [
    {
      title: "Conexiones significativas",
      description: "Conoce personas con intereses, búsquedas y experiencias afines.",
      icon: <Heart className="h-6 w-6 text-black" />,
      cardClass: "bg-luminus-pink/10 border-2 border-black shadow-bold-pink hover:shadow-bold transition-all duration-150",
      iconBg: "bg-luminus-pink border-2 border-black",
    },
    {
      title: "Acompañamiento confiable",
      description: "Descubre expertos, recursos y espacios pensados para guiarte mejor.",
      icon: <ShieldCheck className="h-6 w-6 text-white" />,
      cardClass: "bg-luminus-orange/10 border-2 border-black shadow-bold-orange hover:shadow-bold transition-all duration-150",
      iconBg: "bg-luminus-orange border-2 border-black",
    },
    {
      title: "Bienestar con dirección",
      description: "Encuentra herramientas para ordenar tu proceso y avanzar con más equilibrio.",
      icon: <Milestone className="h-6 w-6 text-white" />,
      cardClass: "bg-luminus-blue/5 border-2 border-black shadow-bold-blue hover:shadow-bold transition-all duration-150",
      iconBg: "bg-luminus-blue border-2 border-black",
    },
  ];

  return (
    <section id="sobre-nosotros" className="py-24 bg-white border-b-2 border-black relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-luminus-pink/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-10 bottom-10 w-48 h-48 bg-luminus-lime/5 rounded-full blur-2xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-center">
          
          {/* Headline */}
          <div className="lg:col-span-5 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-luminus-orange mb-3 block">
              Valor Emocional
            </span>
            <h2 className="font-display text-4xl font-black tracking-tight text-black sm:text-5xl mb-6">
              Una red para no transitar tu proceso en soledad
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-slate-700 font-bold">
              El bienestar no sucede de forma aislada. En LUMINUS puedes encontrar personas, contenidos, expertos y espacios que te ayuden a tomar mejores decisiones, descubrir nuevas perspectivas y sostener tu proceso personal con mayor claridad.
            </p>
          </div>

          {/* Core Benefit Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <div 
                key={idx}
                className={`flex flex-col items-start p-6 rounded-[2rem] hover:-translate-x-0.5 hover:-translate-y-0.5 ${benefit.cardClass}`}
              >
                {/* Icon wrapper */}
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-bold-sm mb-5 ${benefit.iconBg}`}>
                  {benefit.icon}
                </div>
                
                {/* Benefit Name */}
                <h3 className="font-display text-base font-black text-black mb-2">
                  {benefit.title}
                </h3>
                
                {/* Benefit Description */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
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
