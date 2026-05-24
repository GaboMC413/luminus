import React from "react";
import { Link2, ShieldCheck, HeartHandshake, Milestone, Cpu } from "lucide-react";

export default function AboutPrinciplesSection() {
  const row1Principles = [
    {
      title: "Conexión significativa",
      text: "Creamos espacios donde las personas puedan encontrarse desde intereses, búsquedas y experiencias reales.",
      icon: <Link2 className="h-5 w-5 text-white" />,
      iconBg: "bg-luminus-blue",
      shadowColor: "shadow-bold-blue",
    },
    {
      title: "Confianza",
      text: "Buscamos construir una red cuidada, clara y profesional, donde cada vínculo tenga valor real.",
      icon: <ShieldCheck className="h-5 w-5 text-black" />,
      iconBg: "bg-luminus-orange",
      shadowColor: "shadow-bold-orange",
    },
    {
      title: "Bienestar integral",
      text: "Entendemos el bienestar como una experiencia física, emocional, mental, social y espiritual.",
      icon: <HeartHandshake className="h-5 w-5 text-black" />,
      iconBg: "bg-luminus-lime",
      shadowColor: "shadow-bold-lime",
    },
  ];

  const row2Principles = [
    {
      title: "Claridad",
      text: "Organizamos personas, recursos y herramientas para que cada usuario pueda avanzar con más dirección.",
      icon: <Milestone className="h-5 w-5 text-black" />,
      iconBg: "bg-luminus-pink",
      shadowColor: "shadow-bold-pink",
    },
    {
      title: "Humanidad + tecnología",
      text: "Usamos tecnología para potenciar la conexión humana, no para reemplazarla.",
      icon: <Cpu className="h-5 w-5 text-white" />,
      iconBg: "bg-luminus-blue",
      shadowColor: "shadow-bold-blue",
    },
  ];

  return (
    <section className="py-24 bg-white border-b-2 border-black relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute right-0 bottom-0 w-80 h-80 bg-luminus-orange/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-luminus-lime border-2 border-black px-4 py-1.5 text-xs font-black text-black shadow-bold-sm mb-6">
            <span>Nuestra Filosofía</span>
          </div>
          <h2 className="font-display text-4xl font-black tracking-tight text-black sm:text-5xl mb-4">
            Principios que nos definen
          </h2>
          <p className="text-lg leading-relaxed text-slate-700 font-bold max-w-2xl mx-auto">
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
                className={`flex items-start gap-4 p-6 rounded-[2rem] border-2 border-black bg-white ${principle.shadowColor} hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 group`}
              >
                {/* Icon wrapper */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black shadow-bold-sm ${principle.iconBg}`}>
                  {principle.icon}
                </div>
                <div>
                  <h3 className="font-display text-lg font-black text-black mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-sm text-slate-700 font-semibold leading-relaxed">
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
                className={`flex items-start gap-4 p-6 rounded-[2rem] border-2 border-black bg-white ${principle.shadowColor} hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 group`}
              >
                {/* Icon wrapper */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black shadow-bold-sm ${principle.iconBg}`}>
                  {principle.icon}
                </div>
                <div>
                  <h3 className="font-display text-lg font-black text-black mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-sm text-slate-700 font-semibold leading-relaxed">
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
