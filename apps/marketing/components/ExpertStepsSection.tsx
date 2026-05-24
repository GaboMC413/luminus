import React from "react";
import { ArrowRight } from "lucide-react";

export default function ExpertStepsSection() {
  const steps = [
    {
      num: "01",
      title: "Crea tu cuenta",
      description: "Regístrate en LUMINUS como primer paso para ingresar a la red.",
      numColor: "text-luminus-blue",
      badgeBg: "bg-luminus-blue text-white",
      shadowColor: "shadow-bold-blue",
    },
    {
      num: "02",
      title: "Completa tu perfil",
      description: "Presenta tu experiencia, especialidad, enfoque y áreas de acompañamiento.",
      numColor: "text-luminus-orange",
      badgeBg: "bg-luminus-orange text-black",
      shadowColor: "shadow-bold-orange",
    },
    {
      num: "03",
      title: "Activa tu presencia",
      description: "Accede a las funciones para expertos y comienza a compartir tu trabajo con la comunidad.",
      numColor: "text-luminus-lime",
      badgeBg: "bg-luminus-lime text-black",
      shadowColor: "shadow-bold-lime",
    },
  ];

  return (
    <section className="py-24 bg-white border-b-2 border-black relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute left-0 bottom-0 w-80 h-80 bg-luminus-pink/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-20">
          <h2 className="font-display text-4xl font-black tracking-tight text-black sm:text-5xl mb-4">
            El primer paso es registrarte
          </h2>
          <p className="text-lg leading-relaxed text-slate-700 font-bold max-w-2xl mx-auto">
            Para formar parte como Experto LUMINUS, primero debes crear tu cuenta en la plataforma. Luego podrás avanzar con la configuración de tu perfil y acceder a las funciones disponibles para profesionales.
          </p>
        </div>

        {/* Steps Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className={`relative flex flex-col justify-between rounded-[2.5rem] border-2 border-black bg-white p-8 ${step.shadowColor} hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 group`}
            >
              {/* Number indicator */}
              <div className="flex items-baseline justify-between mb-8">
                <span className={`font-display text-6xl font-black tracking-tight ${step.numColor} transition-transform duration-200 group-hover:scale-110`}>
                  {step.num}
                </span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black border-2 border-black shadow-bold-sm ${step.badgeBg}`}>
                  Paso {idx + 1}
                </span>
              </div>

              <div>
                {/* Title */}
                <h3 className="font-display text-2xl font-black text-black mb-3">
                  {step.title}
                </h3>
                {/* Description */}
                <p className="text-sm text-slate-700 font-semibold leading-relaxed">
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
            className="inline-flex items-center justify-center rounded-full bg-black border-2 border-black px-10 py-4 text-base font-bold text-white shadow-bold hover:shadow-none hover:bg-luminus-orange hover:text-black hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150"
          >
            Registrarme como primer paso
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>

      </div>
    </section>
  );
}
