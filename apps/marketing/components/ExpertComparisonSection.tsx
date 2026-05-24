import React from "react";
import { Check, ChevronRight, Sparkles } from "lucide-react";

export default function ExpertComparisonSection() {
  const generalBullets = [
    "Exploran la comunidad y participan.",
    "Conectan con otras personas afines.",
    "Descubren expertos, espacios y recursos.",
    "Acceden a herramientas para su proceso personal.",
  ];

  const expertBullets = [
    "Crean un perfil profesional certificado.",
    "Presentan su enfoque, trayectoria y servicios.",
    "Comparten contenidos, cursos y recursos prácticos.",
    "Pueden ser descubiertos por personas interesadas.",
    "Acceden a funciones y analíticas exclusivas para expertos.",
  ];

  return (
    <section className="py-24 bg-white border-b-2 border-black relative overflow-hidden">
      {/* Decorative radial gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-radial from-luminus-orange/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="font-display text-4xl font-black tracking-tight text-black sm:text-5xl mb-4">
            Una experiencia pensada para profesionales
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-slate-700 font-bold max-w-2xl mx-auto">
            En LUMINUS, cualquier persona puede crear una cuenta para explorar la comunidad. Pero los expertos acceden a funciones específicas para construir presencia profesional, compartir conocimiento y conectar con personas interesadas en su área de especialidad.
          </p>
        </div>

        {/* Comparison Columns Grid */}
        <div className="mx-auto grid max-w-md grid-cols-1 gap-12 md:max-w-4xl md:grid-cols-2 md:gap-8 lg:gap-12 items-stretch">
          
          {/* Column 1: General Users */}
          <div className="flex flex-col justify-between rounded-[2.5rem] p-8 md:p-10 bg-white border-2 border-black shadow-bold hover:shadow-bold-lg transition-all duration-150">
            <div>
              <div className="mb-6 flex flex-col items-start">
                <span className="inline-flex items-center rounded-full bg-luminus-lime border-2 border-black px-3 py-1 text-xs font-black text-black shadow-bold-sm mb-4">
                  Exploración
                </span>
                <h3 className="font-display text-2xl font-black text-black">
                  Usuarios generales
                </h3>
              </div>
              <p className="text-sm text-slate-700 font-semibold mb-6 leading-relaxed">
                Diseñado para personas interesadas en explorar la red, educarse y encontrar herramientas para sostener su bienestar personal.
              </p>
              <ul className="space-y-4">
                {generalBullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 font-semibold">
                    <ChevronRight className="h-5 w-5 shrink-0 text-black stroke-[3px] mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 2: LUMINUS Experts (Highlighted Premium style) */}
          <div className="relative flex flex-col justify-between rounded-[2.5rem] p-8 md:p-10 bg-luminus-pink/10 border-2 border-black shadow-bold-lg hover:-translate-y-1 transition-all duration-150">
            {/* Solid accent badge */}
            <div className="absolute -top-4 left-6 flex items-center gap-1.5 rounded-full bg-black border-2 border-black px-4 py-1.5 text-xs font-black text-white shadow-bold-sm">
              <Sparkles className="h-3.5 w-3.5 text-luminus-orange" />
              <span>Presencia Profesional</span>
            </div>

            <div>
              <div className="mb-6 mt-2 flex flex-col items-start">
                <span className="inline-flex items-center rounded-full bg-luminus-orange border-2 border-black px-3 py-1 text-xs font-black text-black shadow-bold-sm mb-4">
                  Rol Experto
                </span>
                <h3 className="font-display text-2xl font-black text-black">
                  Expertos LUMINUS
                </h3>
              </div>
              <p className="text-sm text-slate-700 font-black mb-6 leading-relaxed">
                Diseñado para profesionales que buscan posicionar su práctica, compartir su conocimiento y conectar con consultantes afines.
              </p>
              <ul className="space-y-4">
                {expertBullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-900 font-bold">
                    <Check className="h-5 w-5 shrink-0 text-black stroke-[3px] mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
