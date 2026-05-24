import React from "react";
import { Link2, ShieldCheck, HeartHandshake, Milestone, Cpu } from "lucide-react";

export default function AboutPrinciplesSection() {
  const row1Principles = [
    {
      title: "Conexión significativa",
      text: "Creamos espacios donde las personas puedan encontrarse desde intereses, búsquedas y experiencias reales.",
      icon: <Link2 className="h-5 w-5 text-luminus-blue" />,
      bg: "bg-luminus-blue-soft border-blue-100",
    },
    {
      title: "Confianza",
      text: "Buscamos construir una red cuidada, clara y profesional, donde cada vínculo tenga valor.",
      icon: <ShieldCheck className="h-5 w-5 text-teal-600" />,
      bg: "bg-luminus-mint-soft border-teal-150",
    },
    {
      title: "Bienestar integral",
      text: "Entendemos el bienestar como una experiencia física, emocional, mental, social y espiritual.",
      icon: <HeartHandshake className="h-5 w-5 text-rose-500" />,
      bg: "bg-rose-50 border-rose-100",
    },
  ];

  const row2Principles = [
    {
      title: "Claridad",
      text: "Organizamos personas, recursos y herramientas para que cada usuario pueda avanzar con más dirección.",
      icon: <Milestone className="h-5 w-5 text-amber-600" />,
      bg: "bg-amber-50 border-amber-100",
    },
    {
      title: "Humanidad + tecnología",
      text: "Usamos tecnología para potenciar la conexión humana, no para reemplazarla.",
      icon: <Cpu className="h-5 w-5 text-violet-600" />,
      bg: "bg-violet-50 border-violet-100",
    },
  ];

  return (
    <section className="py-24 bg-luminus-bg border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">
            Nuestra Filosofía
          </span>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-luminus-text sm:text-5xl mb-4">
            Principios que nos definen
          </h2>
          <p className="text-lg leading-relaxed text-luminus-secondary max-w-2xl mx-auto">
            LUMINUS se construye sobre una forma de entender el bienestar: más conectada, integral, clara y humana.
          </p>
        </div>

        {/* Principles Grids */}
        <div className="space-y-8">
          {/* Row 1: 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {row1Principles.map((principle, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-4 p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-premium transition-all duration-300 group"
              >
                {/* Icon wrapper */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${principle.bg}`}>
                  {principle.icon}
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-luminus-secondary leading-relaxed">
                    {principle.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: 2 cards centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:max-w-[70%] lg:mx-auto">
            {row2Principles.map((principle, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-4 p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-premium transition-all duration-300 group"
              >
                {/* Icon wrapper */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${principle.bg}`}>
                  {principle.icon}
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-luminus-secondary leading-relaxed">
                    {principle.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
