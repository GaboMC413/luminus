import React from "react";
import { CheckCircle2, Shield } from "lucide-react";

export default function ExpertTrustSection() {
  const points = [
    "Visibilidad dentro de una red enfocada en bienestar.",
    "Conexión con personas interesadas en crecimiento personal.",
    "Herramientas para compartir conocimiento y recursos.",
    "Funciones exclusivas para profesionales del bienestar.",
  ];

  return (
    <section className="py-20 bg-white border-b-2 border-black relative overflow-hidden">
      {/* Background glow decorative */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-luminus-lime/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-[2.5rem] border-2 border-black bg-white p-8 md:p-12 shadow-bold-lg">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left side: Heading & Paragraph */}
            <div className="md:col-span-6 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black bg-luminus-lime text-black shadow-bold-sm mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h2 className="font-display text-3xl font-black text-black mb-4">
                Una red para construir vínculos con propósito
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 font-semibold">
                LUMINUS no busca reunir profesionales de forma masiva, sino crear una red cuidada donde las personas puedan encontrar acompañamiento significativo y los expertos puedan compartir su trabajo en un entorno alineado con su propósito.
              </p>
            </div>
 
            {/* Right side: Bullet checklist box */}
            <div className="md:col-span-6 rounded-[2rem] bg-luminus-pink/15 p-6 border-2 border-black shadow-bold-sm">
              <ul className="space-y-4">
                {points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-900 font-bold">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-black stroke-[2.5px] mt-0.5" />
                    <span>{point}</span>
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
