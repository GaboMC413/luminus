import React from "react";
import { CheckCircle2, Shield } from "lucide-react";

export default function ExpertTrustSection() {
  const points = [
    "Visibilidad dentro de una red enfocada en bienestar.",
    "Conexión con personas interesadas en crecimiento personal y salud integral.",
    "Herramientas para compartir conocimiento, recursos y experiencias.",
    "Funciones exclusivas para profesionales del bienestar.",
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background glow decorative */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-8 md:p-12 shadow-premium hover:shadow-premium-hover transition-all duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left side: Heading & Paragraph */}
            <div className="md:col-span-6 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-luminus-blue/10 bg-luminus-blue-soft text-luminus-blue mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-luminus-text mb-4">
                Una red para construir vínculos con propósito
              </h2>
              <p className="text-sm leading-relaxed text-luminus-secondary">
                LUMINUS no busca reunir profesionales de forma masiva, sino crear una red cuidada donde las personas puedan encontrar acompañamiento significativo y los expertos puedan compartir su trabajo en un entorno alineado con su propósito.
              </p>
            </div>

            {/* Right side: Bullet checklist box */}
            <div className="md:col-span-6 rounded-2xl bg-white p-6 border border-slate-100 shadow-sm">
              <ul className="space-y-4">
                {points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-luminus-secondary font-medium">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600 mt-0.5" />
                    <span className="text-slate-700">{point}</span>
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
