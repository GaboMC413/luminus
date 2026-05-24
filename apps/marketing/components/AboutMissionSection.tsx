import React from "react";
import { Compass, Eye, Heart } from "lucide-react";

export default function AboutMissionSection() {
  const guides = [
    {
      title: "Nuestra misión",
      text: "Hacer que el bienestar sea más accesible, conectado y significativo, creando una red donde las personas puedan encontrar acompañamiento, conocimiento y vínculos que las ayuden a avanzar con más claridad.",
      icon: <Compass className="h-6 w-6 text-black" />,
      cardBg: "bg-luminus-pink/15 hover:bg-luminus-pink/20",
      iconBg: "bg-luminus-pink",
      shadowColor: "shadow-bold-pink",
    },
    {
      title: "Nuestra visión",
      text: "Construir la red de bienestar más humana y relevante de LATAM, integrando personas, expertos, espacios y tecnología para acompañar procesos reales de transformación personal.",
      icon: <Eye className="h-6 w-6 text-black" />,
      cardBg: "bg-luminus-orange/15 hover:bg-luminus-orange/20",
      iconBg: "bg-luminus-orange",
      shadowColor: "shadow-bold-orange",
    },
    {
      title: "Nuestro propósito",
      text: "Ayudar a que más personas puedan encontrar claridad, conexión y acompañamiento en su camino hacia una vida con más equilibrio y sentido.",
      icon: <Heart className="h-6 w-6 text-black" />,
      cardBg: "bg-luminus-lime/15 hover:bg-luminus-lime/20",
      iconBg: "bg-luminus-lime",
      shadowColor: "shadow-bold-lime",
    },
  ];

  return (
    <section className="py-24 bg-white border-b-2 border-black relative overflow-hidden">
      {/* Decorative ambient blur */}
      <div className="absolute left-0 bottom-0 w-64 h-64 bg-luminus-lime/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-luminus-lime border-2 border-black px-4 py-1.5 text-xs font-black text-black shadow-bold-sm mb-6">
            <span>Nuestros Pilares Guía</span>
          </div>
          <h2 className="font-display text-4xl font-black tracking-tight text-black sm:text-5xl">
            Lo que guía a LUMINUS
          </h2>
        </div>

        {/* Guides cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {guides.map((guide, idx) => (
            <div 
              key={idx}
              className={`flex flex-col items-start p-8 rounded-[2.5rem] border-2 border-black ${guide.cardBg} ${guide.shadowColor} hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 group`}
            >
              {/* Icon Container */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black shadow-bold-sm mb-6 ${guide.iconBg}`}>
                {guide.icon}
              </div>
              
              {/* Title */}
              <h3 className="font-display text-2xl font-black text-black mb-3">
                {guide.title}
              </h3>
              
              {/* Text Description */}
              <p className="text-sm leading-relaxed text-slate-700 font-semibold">
                {guide.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
