import React from "react";
import { CheckCircle2, Shield } from "lucide-react";

export default function TrustSection() {
  const assurances = [
    "No se solicitan datos de pago al crear tu cuenta.",
    "Acceso sin costo durante los primeros 3 meses.",
    "Podrás elegir si continuar o no antes de que termine el período gratuito.",
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Decorative gradient background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-luminus-blue/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-[2.5rem] border-2 border-black bg-white p-8 md:p-12 shadow-bold hover:shadow-bold-lg transition-all duration-150">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left side: Heading & Paragraph */}
            <div className="md:col-span-6 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black bg-luminus-blue text-white shadow-bold-sm mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h2 className="font-display text-3xl font-black tracking-tight text-black mb-4">
                Empieza sin compromiso
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 font-semibold">
                Durante los primeros 3 meses podrás explorar LUMINUS sin costo. No se solicitará ningún pago al registrarte y te avisaremos antes de que finalice el período de acceso sin costo para que puedas decidir si deseas continuar.
              </p>
            </div>

            {/* Right side: Bullet checklist box */}
            <div className="md:col-span-6 rounded-2xl bg-luminus-lime/10 p-6 border-2 border-black shadow-bold-sm">
              <ul className="space-y-4">
                {assurances.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-black font-extrabold">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-black mt-0.5" />
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
