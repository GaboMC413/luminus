import React from "react";
import { Compass, Users, ShieldAlert, Sparkles, Eye, Shield } from "lucide-react";

export default function ExpertBenefitsSection() {
  const benefits = [
    {
      title: "Más visibilidad para tu práctica",
      description: "Presenta tu enfoque, experiencia y servicios dentro de una red diseñada para que las personas puedan descubrir profesionales de confianza.",
      icon: <Eye className="h-6 w-6 text-luminus-blue" />,
      bgColor: "bg-luminus-blue-soft border-blue-100/50",
    },
    {
      title: "Conexión con una audiencia afín",
      description: "Llega a personas que ya están interesadas en bienestar y buscan acompañamiento, recursos y nuevas formas de avanzar en su proceso personal.",
      icon: <Users className="h-6 w-6 text-teal-600" />,
      bgColor: "bg-luminus-mint-soft border-teal-100/50",
    },
    {
      title: "Un entorno profesional y cuidado",
      description: "Forma parte de una plataforma que prioriza la confianza, la calidad de las conexiones y el valor real que los expertos pueden aportar.",
      icon: <Shield className="h-6 w-6 text-indigo-600" />,
      bgColor: "bg-indigo-50 border-indigo-100/50",
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute right-0 bottom-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-luminus-text sm:text-5xl mb-4">
            Un espacio para profesionales que quieren ampliar su impacto
          </h2>
          <p className="text-lg leading-relaxed text-luminus-secondary">
            En LUMINUS, los expertos podrán construir presencia, compartir conocimiento y conectar con una comunidad interesada en bienestar, transformación personal y desarrollo consciente.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => (
            <div 
              key={idx}
              className="flex flex-col items-start p-8 rounded-3xl border border-slate-100 bg-slate-50/40 hover:bg-white hover:shadow-premium transition-all duration-300 group"
            >
              {/* Icon */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border mb-6 ${benefit.bgColor}`}>
                {benefit.icon}
              </div>
              
              {/* Title */}
              <h3 className="font-display text-lg font-bold text-luminus-text mb-3 group-hover:text-luminus-blue transition-colors duration-200">
                {benefit.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-luminus-secondary leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
