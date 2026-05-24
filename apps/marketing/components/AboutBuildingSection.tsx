import React from "react";
import { CheckCircle, Info, Sparkles } from "lucide-react";

export default function AboutBuildingSection() {
  const modules = [
    "Comunidad LUMINUS",
    "Expertos del bienestar",
    "Espacios LUMINUS",
    "Mapa LUMINUS",
    "Faro LUMINUS",
    "Cursos, recursos y experiencias",
  ];

  return (
    <section className="py-24 bg-white border-b border-slate-100 relative overflow-hidden">
      {/* Decorative backdrop glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-8 md:p-12 shadow-premium hover:shadow-premium-hover transition-all duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            
            {/* Left side: narrative */}
            <div className="md:col-span-7 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-luminus-blue mb-3 block">
                Nuestra Plataforma
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-luminus-text sm:text-4xl mb-4">
                Una plataforma para quienes buscan algo más que información
              </h2>
              <p className="text-sm leading-relaxed text-luminus-secondary mb-6">
                LUMINUS está naciendo como un espacio para conectar, descubrir y avanzar. Una plataforma donde las personas puedan encontrar comunidad, expertos, recursos, espacios y herramientas que acompañen su proceso de bienestar de forma más consciente y significativa.
              </p>
              
              {/* Disclaimer Note */}
              <div className="flex gap-2.5 items-start rounded-xl bg-amber-50/50 border border-amber-100 p-4 text-xs text-amber-700">
                <Info className="h-4.5 w-4.5 shrink-0 text-amber-600 mt-0.5" />
                <p className="leading-relaxed font-medium">
                  Algunas funcionalidades estarán disponibles próximamente. Esta página comunica nuestra visión y dirección de bienestar sin comprometer que todo está activo hoy.
                </p>
              </div>
            </div>

            {/* Right side: Modules Checklist */}
            <div className="md:col-span-5 rounded-2xl bg-white p-6 border border-slate-100 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-luminus-blue" />
                Módulos de la Red
              </p>
              <ul className="space-y-3.5">
                {modules.map((mod, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-luminus-secondary font-medium">
                    <CheckCircle className="h-5 w-5 shrink-0 text-teal-600 mt-0.5" />
                    <span className="text-slate-800">{mod}</span>
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
