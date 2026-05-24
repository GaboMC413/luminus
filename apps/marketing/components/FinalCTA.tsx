import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-luminus-bg/40 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-luminus-blue/5 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-5xl px-6">
        <div className="relative rounded-[2.5rem] bg-gradient-to-tr from-slate-900 to-slate-950 p-8 md:p-16 text-center shadow-2xl overflow-hidden border border-slate-800">
          
          {/* Subtle starry / network connection backdrop lines in the CTA */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-luminus-blue/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            {/* Sparkle icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-luminus-blue border border-white/15 mb-6 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-blue-400" />
            </div>

            {/* Title */}
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight mb-4">
              Empieza a construir tu camino dentro de LUMINUS
            </h2>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl">
              Crea tu cuenta, explora la red y descubre nuevas formas de conectar con tu bienestar.
            </p>

            {/* Button */}
            <a
              href="https://app.luminuslatam.com/signup"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-base font-bold text-slate-900 shadow-xl hover:bg-slate-50 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Crear mi cuenta
              <ArrowRight className="ml-2 h-5 w-5 text-slate-900" />
            </a>

            {/* Microcopy */}
            <p className="text-xs text-slate-400 mt-5">
              3 meses de acceso sin costo. Sin pago inicial.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
