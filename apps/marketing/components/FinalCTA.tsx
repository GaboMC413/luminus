import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FinalCTA() {
  return (
    <section id="contacto" className="py-24 bg-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-luminus-pink/5 via-luminus-orange/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-5xl px-6">
        <div className="relative rounded-[2.5rem] border-2 border-black bg-luminus-pink/15 p-8 md:p-16 text-center shadow-bold-lg overflow-hidden">
          
          {/* Subtle connecting lines */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-luminus-blue/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-luminus-lime/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            {/* Sparkle icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-luminus-pink border-2 border-black shadow-bold-sm mb-6">
              <Sparkles className="h-6 w-6" />
            </div>

            {/* Title */}
            <h2 className="font-display text-3xl font-black text-black sm:text-5xl leading-tight mb-4">
              Empieza a construir tu camino dentro de LUMINUS
            </h2>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-800 leading-relaxed mb-8 max-w-2xl font-bold">
              Crea tu cuenta, explora la red y descubre nuevas formas de conectar con tu bienestar.
            </p>

            {/* Button */}
            <a
              href="https://app.luminuslatam.com/signup"
              className="inline-flex items-center justify-center rounded-full bg-black border-2 border-black px-8 py-4 text-base font-bold text-white shadow-bold hover:shadow-none hover:bg-luminus-orange hover:text-black hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150"
            >
              Crear mi cuenta
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>

            {/* Microcopy */}
            <p className="text-xs text-slate-500 font-bold mt-5">
              3 meses de acceso sin costo. Sin pago inicial.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
