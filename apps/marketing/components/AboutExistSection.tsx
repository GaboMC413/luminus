import React from "react";
import { AlertTriangle, ChevronRight, XCircle } from "lucide-react";

export default function AboutExistSection() {
  const problems = [
    "Información dispersa.",
    "Profesionales difíciles de descubrir.",
    "Experiencias aisladas.",
    "Falta de claridad para avanzar.",
  ];

  return (
    <section id="porque-existe" className="py-24 bg-white border-b border-slate-100 relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute right-10 top-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column: Narrative texts */}
          <div className="lg:col-span-7 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3 block">
              El Desafío Actual
            </span>
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-luminus-text sm:text-5xl mb-6">
              El bienestar hoy está demasiado fragmentado
            </h2>
            <div className="space-y-6 text-base sm:text-lg leading-relaxed text-luminus-secondary">
              <p>
                Muchas personas buscan sentirse mejor, vivir con más equilibrio o encontrar acompañamiento, pero suelen hacerlo de forma dispersa: contenidos aislados, profesionales difíciles de encontrar, experiencias desconectadas y poca claridad sobre por dónde empezar.
              </p>
              <p className="border-l-2 border-luminus-blue pl-6 italic text-luminus-text font-medium bg-slate-50/50 py-3 pr-4 rounded-r-2xl">
                LUMINUS surge para ordenar ese camino y acercar, en un mismo lugar, personas, expertos, espacios y herramientas que puedan ayudar a cada usuario a avanzar con más dirección.
              </p>
            </div>
          </div>

          {/* Right Column: Pain points visual card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-amber-100 bg-amber-50/20 p-8 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-150 text-amber-700 mb-6 border border-amber-200">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-6">
                Los 4 grandes vacíos en el camino
              </h3>
              <ul className="space-y-4">
                {problems.map((problem, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                    <XCircle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                    <span>{problem}</span>
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
