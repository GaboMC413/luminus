import React from "react";
import { ArrowRight } from "lucide-react";

export default function ExpertStepsSection() {
  const steps = [
    {
      num: "01",
      title: "Crea tu cuenta",
      description: "Regístrate en LUMINUS como primer paso para ingresar a la red.",
      bg: "bg-blue-50/50 text-luminus-blue border-blue-100",
    },
    {
      num: "02",
      title: "Completa tu perfil",
      description: "Presenta tu experiencia, especialidad, enfoque y áreas de acompañamiento.",
      bg: "bg-teal-50/50 text-teal-600 border-teal-100",
    },
    {
      num: "03",
      title: "Activa tu presencia",
      description: "Accede a las funciones para expertos y comienza a compartir tu trabajo con la comunidad.",
      bg: "bg-indigo-50/50 text-indigo-600 border-indigo-100",
    },
  ];

  return (
    <section className="py-24 bg-luminus-bg border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-20">
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-luminus-text sm:text-5xl mb-4">
            El primer paso es registrarte
          </h2>
          <p className="text-lg leading-relaxed text-luminus-secondary max-w-2xl mx-auto">
            Para formar parte como Experto LUMINUS, primero debes crear tu cuenta en la plataforma. Luego podrás avanzar con la configuración de tu perfil y acceder a las funciones disponibles para profesionales.
          </p>
        </div>

        {/* Steps Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className="relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-8 hover:shadow-premium transition-all duration-300 group"
            >
              {/* Number indicator */}
              <div className="flex items-baseline justify-between mb-8">
                <span className="font-display text-5xl font-black tracking-tight text-slate-100 group-hover:text-luminus-blue/10 transition-colors duration-300">
                  {step.num}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${step.bg}`}>
                  Paso {idx + 1}
                </span>
              </div>

              <div>
                {/* Title */}
                <h3 className="font-display text-xl font-bold text-luminus-text mb-3">
                  {step.title}
                </h3>
                {/* Description */}
                <p className="text-sm text-luminus-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center justify-center">
          <a
            href="https://app.luminuslatam.com/signup"
            className="inline-flex items-center justify-center rounded-2xl bg-luminus-blue px-8 py-4 text-base font-bold text-white shadow-accent hover:shadow-accent-hover hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200"
          >
            Registrarme como primer paso
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>

      </div>
    </section>
  );
}
