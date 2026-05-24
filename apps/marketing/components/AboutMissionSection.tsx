import React from "react";
import { Landmark, Compass, Eye, Heart } from "lucide-react";

export default function AboutMissionSection() {
  const guides = [
    {
      title: "Nuestra misión",
      text: "Hacer que el bienestar sea más accesible, conectado y significativo, creando una red donde las personas puedan encontrar acompañamiento, conocimiento y vínculos que las ayuden a avanzar con más claridad.",
      icon: <Compass className="h-6 w-6 text-luminus-blue" />,
      bgIcon: "bg-luminus-blue-soft border-blue-100",
    },
    {
      title: "Nuestra visión",
      text: "Construir la red de bienestar más humana y relevante de LATAM, integrando personas, expertos, espacios y tecnología para acompañar procesos reales de transformación personal.",
      icon: <Eye className="h-6 w-6 text-teal-600" />,
      bgIcon: "bg-luminus-mint-soft border-teal-150",
    },
    {
      title: "Nuestro propósito",
      text: "Ayudar a que más personas puedan encontrar claridad, conexión y acompañamiento en su camino hacia una vida con más equilibrio y sentido.",
      icon: <Heart className="h-6 w-6 text-rose-500" />,
      bgIcon: "bg-rose-50 border-rose-100",
    },
  ];

  return (
    <section className="py-24 bg-white border-b border-slate-100 relative overflow-hidden">
      {/* Decorative ambient blur */}
      <div className="absolute left-0 bottom-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">
            Nuestros Pilares Guía
          </span>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-luminus-text sm:text-5xl">
            Lo que guía a LUMINUS
          </h2>
        </div>

        {/* Guides cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {guides.map((guide, idx) => (
            <div 
              key={idx}
              className="flex flex-col items-start p-8 rounded-3xl border border-slate-150 bg-slate-50/30 hover:bg-white hover:shadow-premium transition-all duration-300 group"
            >
              {/* Icon */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border mb-6 ${guide.bgIcon}`}>
                {guide.icon}
              </div>
              
              {/* Title */}
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3 group-hover:text-luminus-blue transition-colors duration-200">
                {guide.title}
              </h3>
              
              {/* Text Description */}
              <p className="text-sm leading-relaxed text-luminus-secondary">
                {guide.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
