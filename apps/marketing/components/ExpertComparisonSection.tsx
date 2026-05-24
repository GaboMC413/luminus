import React from "react";
import { Check, ChevronRight, Sparkles } from "lucide-react";

export default function ExpertComparisonSection() {
  const generalBullets = [
    "Exploran la comunidad.",
    "Conectan con otras personas.",
    "Descubren expertos, espacios y recursos.",
    "Acceden a herramientas para su proceso personal.",
  ];

  const expertBullets = [
    "Crean un perfil profesional.",
    "Presentan su enfoque y servicios.",
    "Comparten contenidos, cursos y recursos.",
    "Pueden ser descubiertos por personas interesadas.",
    "Acceden a funciones exclusivas para expertos.",
  ];

  return (
    <section className="py-24 bg-white border-y border-slate-100 relative overflow-hidden">
      {/* Decorative radial gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-gradient-to-r from-luminus-blue/5 to-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-luminus-text sm:text-5xl mb-4">
            Una experiencia pensada para profesionales
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-luminus-secondary max-w-2xl mx-auto">
            En LUMINUS, cualquier persona puede crear una cuenta para explorar la comunidad. Pero los expertos acceden a funciones específicas para construir presencia profesional, compartir conocimiento y conectar con personas interesadas en su área de especialidad.
          </p>
        </div>

        {/* Comparison Columns Grid */}
        <div className="mx-auto grid max-w-md grid-cols-1 gap-8 md:max-w-4xl md:grid-cols-2 md:gap-8 lg:gap-12 items-stretch">
          
          {/* Column 1: General Users */}
          <div className="flex flex-col justify-between rounded-3xl p-8 bg-slate-50/50 border border-slate-200">
            <div>
              <div className="mb-6">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 border border-slate-200">
                  Exploración
                </span>
                <h3 className="font-display text-2xl font-bold text-luminus-text mt-3">
                  Usuarios generales
                </h3>
              </div>
              <p className="text-sm text-luminus-secondary mb-6 leading-relaxed">
                Diseñado para personas interesadas en explorar la red, educarse y encontrar herramientas para sostener su bienestar.
              </p>
              <ul className="space-y-4">
                {generalBullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-luminus-secondary">
                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 2: LUMINUS Experts (Highlighted Premium style) */}
          <div className="relative flex flex-col justify-between rounded-3xl p-8 bg-white border border-luminus-blue/40 shadow-premium-hover scale-[1.01]">
            {/* Soft badge */}
            <div className="absolute -top-3.5 left-6 flex items-center gap-1.5 rounded-full bg-luminus-blue px-3 py-1 text-xs font-bold text-white shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Presencia Profesional</span>
            </div>

            <div>
              <div className="mb-6 mt-2">
                <span className="inline-flex items-center rounded-full bg-luminus-blue-soft px-3 py-1 text-xs font-semibold text-luminus-blue border border-blue-100">
                  Rol Experto
                </span>
                <h3 className="font-display text-2xl font-bold text-luminus-text mt-3">
                  Expertos LUMINUS
                </h3>
              </div>
              <p className="text-sm text-luminus-secondary mb-6 leading-relaxed">
                Diseñado para profesionales que buscan posicionar su práctica, compartir su conocimiento y conectar con consultantes afines.
              </p>
              <ul className="space-y-4">
                {expertBullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-luminus-secondary font-medium">
                    <Check className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                    <span className="text-slate-800">{bullet}</span>
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
