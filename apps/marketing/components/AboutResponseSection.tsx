import React from "react";
import { Users, UserCheck, Compass, MapPin, Sparkles } from "lucide-react";

export default function AboutResponseSection() {
  const row1Pillars = [
    {
      title: "Comunidad",
      description: "Un espacio para descubrir personas, explorar perfiles, encontrar intereses en común y conectar con quienes comparten búsquedas, experiencias y propósito.",
      icon: <Users className="h-6 w-6 text-luminus-blue" />,
      isComingSoon: false,
    },
    {
      title: "Expertos",
      description: "Una red de profesionales del bienestar donde las personas podrán conocer enfoques, servicios, recursos y formas de acompañamiento.",
      icon: <UserCheck className="h-6 w-6 text-slate-400" />,
      isComingSoon: true,
    },
    {
      title: "Espacios LUMINUS",
      description: "Lugares digitales para aprender, compartir contenidos, participar en conversaciones e involucrarse en experiencias exclusivas.",
      icon: <Compass className="h-6 w-6 text-slate-400" />,
      isComingSoon: true,
    },
  ];

  const row2Pillars = [
    {
      title: "Mapa LUMINUS",
      description: "Una forma de descubrir personas, clínicas, consultorios y profesionales de la red en distintas ciudades de LATAM.",
      icon: <MapPin className="h-6 w-6 text-slate-400" />,
      isComingSoon: true,
    },
    {
      title: "Faro LUMINUS",
      description: "Un asistente impulsado por IA creado para acompañar procesos, aportar claridad y ayudar a tomar mejores decisiones de bienestar.",
      icon: <Sparkles className="h-6 w-6 text-slate-400" />,
      isComingSoon: true,
    },
  ];

  return (
    <section className="py-24 bg-luminus-bg border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-luminus-blue mb-3 block">
            Nuestra Respuesta
          </span>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-luminus-text sm:text-5xl mb-4">
            Estamos construyendo una red de bienestar más humana y accesible
          </h2>
          <p className="text-lg leading-relaxed text-luminus-secondary max-w-2xl mx-auto">
            LUMINUS conecta comunidad, expertos, espacios, mapa y herramientas digitales para que cada persona pueda explorar su camino de bienestar con mayor claridad.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="space-y-8">
          {/* Row 1: 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {row1Pillars.map((pillar, idx) => (
              <div 
                key={idx}
                className="flex flex-col justify-between p-8 rounded-3xl border border-slate-200 bg-white hover:border-slate-350 hover:shadow-premium transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                      pillar.isComingSoon ? "bg-slate-50 border-slate-100" : "bg-luminus-blue-soft border-luminus-blue/10"
                    }`}>
                      {pillar.icon}
                    </div>
                    {pillar.isComingSoon && (
                      <span className="inline-flex items-center rounded-full bg-luminus-mint-soft px-2.5 py-0.5 text-xs font-semibold text-luminus-mint-text border border-teal-100">
                        Próximamente
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-luminus-secondary leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: 2 cards centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:max-w-[70%] lg:mx-auto">
            {row2Pillars.map((pillar, idx) => (
              <div 
                key={idx}
                className="flex flex-col justify-between p-8 rounded-3xl border border-slate-100 bg-white hover:border-slate-250 hover:shadow-premium transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                      pillar.isComingSoon ? "bg-slate-50 border-slate-100" : "bg-luminus-blue-soft border-luminus-blue/10"
                    }`}>
                      {pillar.icon}
                    </div>
                    {pillar.isComingSoon && (
                      <span className="inline-flex items-center rounded-full bg-luminus-mint-soft px-2.5 py-0.5 text-xs font-semibold text-luminus-mint-text border border-teal-100">
                        Próximamente
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-luminus-secondary leading-relaxed">
                    {pillar.description}
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
