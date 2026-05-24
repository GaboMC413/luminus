import React from "react";
import { AlertTriangle, XCircle } from "lucide-react";

export default function AboutExistSection() {
  const problems = [
    "Información dispersa y poco confiable.",
    "Profesionales difíciles de descubrir y validar.",
    "Experiencias aisladas y sin continuidad.",
    "Falta de claridad para avanzar en el día a día.",
  ];

  return (
    <section id="porque-existe" className="py-24 bg-white border-b-2 border-black relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute right-10 top-10 w-72 h-72 bg-luminus-orange/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column: Narrative texts */}
          <div className="lg:col-span-7 text-left flex flex-col items-start">
            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-luminus-orange border-2 border-black px-4 py-1.5 text-xs font-black text-black shadow-bold-sm mb-6">
              <span>El Desafío Actual</span>
            </div>

            <h2 className="font-display text-4xl font-black tracking-tight text-black sm:text-5xl mb-6">
              El bienestar hoy está demasiado fragmentado
            </h2>
            <div className="space-y-6 text-base sm:text-lg leading-relaxed text-slate-700 font-semibold">
              <p>
                Muchas personas buscan sentirse mejor, vivir con más equilibrio o encontrar acompañamiento, pero suelen hacerlo de forma dispersa: contenidos aislados, profesionales difíciles de encontrar, experiencias desconectadas y poca claridad sobre por dónde empezar.
              </p>
              <div className="border-2 border-black border-l-8 pl-6 text-black font-bold bg-luminus-lime/15 py-4 pr-4 rounded-[2rem] shadow-bold-sm mt-4">
                LUMINUS surge para ordenar ese camino y acercar, en un mismo lugar, personas, expertos, espacios y herramientas que puedan ayudar a cada usuario a avanzar con más dirección.
              </div>
            </div>
          </div>

          {/* Right Column: Pain points visual card */}
          <div className="lg:col-span-5">
            <div className="rounded-[2.5rem] border-2 border-black bg-luminus-orange/10 p-8 shadow-bold-lg transition-all duration-150">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-luminus-orange border-2 border-black text-black shadow-bold-sm mb-6">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-black text-black mb-6">
                Los 4 grandes vacíos en el camino
              </h3>
              <ul className="space-y-4">
                {problems.map((problem, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-800 font-bold">
                    <XCircle className="h-5 w-5 shrink-0 text-black stroke-[3px] mt-0.5" />
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
