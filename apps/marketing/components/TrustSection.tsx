import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export default function TrustSection() {
  const assurances = [
    "No se solicitan datos de pago al crear tu cuenta.",
    "Acceso sin costo durante los primeros 3 meses.",
    "Podrás elegir si continuar o no antes de que termine el período gratuito.",
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Decorative gradient background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-3xl border border-slate-150 bg-gradient-to-br from-white to-slate-50/50 p-8 md:p-12 shadow-premium hover:shadow-premium-hover transition-all duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left side: Heading & Paragraph */}
            <div className="md:col-span-6 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-luminus-blue/10 bg-luminus-blue-soft text-luminus-blue mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-luminus-text mb-4">
                Empieza sin compromiso
              </h2>
              <p className="text-sm leading-relaxed text-luminus-secondary">
                Durante los primeros 3 meses podrás explorar LUMINUS sin costo. No se solicitará ningún pago al registrarte y te avisaremos antes de que finalice el período de acceso sin costo para que puedas decidir si deseas continuar.
              </p>
            </div>

            {/* Right side: Bullet checklist box */}
            <div className="md:col-span-6 rounded-2xl bg-white p-6 border border-slate-100 shadow-sm">
              <ul className="space-y-4">
                {assurances.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-luminus-secondary">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
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
