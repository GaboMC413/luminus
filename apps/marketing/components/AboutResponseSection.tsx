import React from "react";
import { Users, UserCheck, Compass, MapPin, Sparkles } from "lucide-react";

export default function AboutResponseSection() {
  const row1Pillars = [
    {
      title: "Comunidad",
      description: "Un espacio para descubrir personas, explorar perfiles, encontrar intereses en común y conectar con quienes comparten búsquedas, experiencias y propósito.",
      icon: <Users className="h-6 w-6 text-white" />,
      isComingSoon: false,
      iconBg: "bg-luminus-blue",
      shadowColor: "shadow-bold-blue",
    },
    {
      title: "Expertos",
      description: "Una red de profesionales del bienestar donde las personas podrán conocer enfoques, servicios, recursos y formas de acompañamiento profesional.",
      icon: <UserCheck className="h-6 w-6 text-black" />,
      isComingSoon: true,
      iconBg: "bg-luminus-orange",
      shadowColor: "shadow-bold-orange",
    },
    {
      title: "Espacios LUMINUS",
      description: "Lugares digitales para aprender, compartir contenidos de valor, participar en conversaciones e involucrarse en experiencias de grupo exclusivas.",
      icon: <Compass className="h-6 w-6 text-black" />,
      isComingSoon: true,
      iconBg: "bg-luminus-lime",
      shadowColor: "shadow-bold-lime",
    },
  ];

  const row2Pillars = [
    {
      title: "Mapa LUMINUS",
      description: "Una forma de descubrir personas, clínicas, consultorios y profesionales del bienestar de la red en distintas ciudades de LATAM.",
      icon: <MapPin className="h-6 w-6 text-black" />,
      isComingSoon: true,
      iconBg: "bg-luminus-pink",
      shadowColor: "shadow-bold-pink",
    },
    {
      title: "Faro LUMINUS",
      description: "Un asistente impulsado por IA creado para acompañar procesos diarios, aportar claridad y ayudarte a tomar mejores decisiones de bienestar.",
      icon: <Sparkles className="h-6 w-6 text-white" />,
      isComingSoon: true,
      iconBg: "bg-luminus-blue",
      shadowColor: "shadow-bold-blue",
    },
  ];

  return (
    <section className="py-24 bg-white border-b-2 border-black relative overflow-hidden">
      {/* Soft background accents */}
      <div className="absolute right-0 bottom-0 w-80 h-80 bg-luminus-lime/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-luminus-pink/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-luminus-pink border-2 border-black px-4 py-1.5 text-xs font-black text-black shadow-bold-sm mb-6">
            <span>Nuestra Respuesta</span>
          </div>
          <h2 className="font-display text-4xl font-black tracking-tight text-black sm:text-5xl mb-4">
            Estamos construyendo una red de bienestar más humana y accesible
          </h2>
          <p className="text-lg leading-relaxed text-slate-700 font-bold max-w-2xl mx-auto">
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
                className={`flex flex-col justify-between p-8 rounded-[2.5rem] border-2 border-black bg-white ${pillar.shadowColor} hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black shadow-bold-sm transition-transform duration-200 group-hover:scale-110 ${pillar.iconBg}`}>
                      {pillar.icon}
                    </div>
                    {pillar.isComingSoon && (
                      <span className="inline-flex items-center rounded-full bg-luminus-pink border-2 border-black px-2.5 py-0.5 text-xs font-black text-black shadow-bold-sm">
                        Próximamente
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-2xl font-black text-black mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-700 font-semibold leading-relaxed">
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
                className={`flex flex-col justify-between p-8 rounded-[2.5rem] border-2 border-black bg-white ${pillar.shadowColor} hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black shadow-bold-sm transition-transform duration-200 group-hover:scale-110 ${pillar.iconBg}`}>
                      {pillar.icon}
                    </div>
                    {pillar.isComingSoon && (
                      <span className="inline-flex items-center rounded-full bg-luminus-pink border-2 border-black px-2.5 py-0.5 text-xs font-black text-black shadow-bold-sm">
                        Próximamente
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-2xl font-black text-black mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-700 font-semibold leading-relaxed">
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
