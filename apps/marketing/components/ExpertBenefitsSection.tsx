import React from "react";
import { Users, Eye, Shield } from "lucide-react";

export default function ExpertBenefitsSection() {
  const benefits = [
    {
      title: "Más visibilidad para tu práctica",
      description: "Presenta tu enfoque, experiencia y servicios dentro de una red diseñada para que las personas puedan descubrir profesionales de confianza.",
      icon: <Eye className="h-6 w-6 text-black" />,
      cardBg: "bg-luminus-pink/15 hover:bg-luminus-pink/20",
      iconBg: "bg-luminus-pink",
      shadowColor: "shadow-bold-pink",
    },
    {
      title: "Conexión con una audiencia afín",
      description: "Llega a personas que ya están interesadas en bienestar y buscan acompañamiento, recursos y nuevas formas de avanzar en su proceso personal.",
      icon: <Users className="h-6 w-6 text-black" />,
      cardBg: "bg-luminus-orange/15 hover:bg-luminus-orange/20",
      iconBg: "bg-luminus-orange",
      shadowColor: "shadow-bold-orange",
    },
    {
      title: "Un entorno profesional y cuidado",
      description: "Forma parte de una plataforma que prioriza la confianza, la calidad de las conexiones y el valor real que los expertos pueden aportar.",
      icon: <Shield className="h-6 w-6 text-black" />,
      cardBg: "bg-luminus-lime/15 hover:bg-luminus-lime/20",
      iconBg: "bg-luminus-lime",
      shadowColor: "shadow-bold-lime",
    },
  ];

  return (
    <section className="py-24 bg-white border-b-2 border-black relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute right-0 bottom-0 w-80 h-80 bg-luminus-orange/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-luminus-pink/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="font-display text-4xl font-black tracking-tight text-black sm:text-5xl mb-4">
            Un espacio para profesionales que quieren ampliar su impacto
          </h2>
          <p className="text-lg leading-relaxed text-slate-700 font-bold">
            En LUMINUS, los expertos podrán construir presencia, compartir conocimiento y conectar con una comunidad interesada en bienestar, transformación personal y desarrollo consciente.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => (
            <div 
              key={idx}
              className={`flex flex-col items-start p-8 rounded-[2.5rem] border-2 border-black ${benefit.cardBg} ${benefit.shadowColor} hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 group`}
            >
              {/* Icon Container */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black shadow-bold-sm mb-6 ${benefit.iconBg}`}>
                {benefit.icon}
              </div>
              
              {/* Title */}
              <h3 className="font-display text-xl font-black text-black mb-3 group-hover:text-luminus-blue transition-colors duration-150">
                {benefit.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-slate-700 font-bold leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
