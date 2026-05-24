import React from "react";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-luminus-bg to-white py-20 lg:py-32">
      {/* Decorative background glow */}
      <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[1000px] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] bg-radial from-blue-50/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left lg:pr-8">
            {/* Elegant Top Badge */}
            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-luminus-mint-soft px-3 py-1 text-xs font-semibold text-luminus-mint-text border border-teal-100/50 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Red de Bienestar Humano</span>
            </div>

            {/* Main Editorial Title */}
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-luminus-text sm:text-6xl lg:text-6xl leading-[1.1] mb-6">
              Descubre una nueva forma de <span className="bg-gradient-to-r from-luminus-blue to-teal-500 bg-clip-text text-transparent">conectar con tu bienestar</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl leading-relaxed text-luminus-secondary mb-8 max-w-2xl">
              LUMINUS es una plataforma para explorar personas, expertos, espacios, recursos y herramientas diseñadas para acompañarte en tu camino hacia una vida con más equilibrio, claridad y propósito.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
              <a
                href="https://app.luminuslatam.com/signup"
                className="inline-flex items-center justify-center rounded-2xl bg-luminus-blue px-6 py-4 text-base font-bold text-white shadow-accent hover:shadow-accent-hover hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200"
              >
                Crear mi cuenta
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="#funcionalidades"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-semibold text-luminus-text hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                Ver qué puedo hacer en LUMINUS
              </a>
            </div>

            {/* Microcopy */}
            <p className="text-xs text-slate-500">
              Comienza con <strong className="text-luminus-text font-semibold">3 meses de acceso sin costo</strong>. No se solicitarán datos de pago al registrarte.
            </p>
          </div>

          {/* Abstract Mockup / Composition */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[450px] aspect-square rounded-[2.5rem] bg-gradient-to-tr from-luminus-blue/5 via-teal-500/5 to-transparent p-4 md:p-6 border border-slate-100">
              {/* Decorative accent element behind the image */}
              <div className="absolute -inset-1 rounded-[2.7rem] bg-gradient-to-tr from-luminus-blue/10 to-teal-500/10 opacity-30 blur-lg -z-10" />
              
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-white shadow-premium border border-slate-100 flex items-center justify-center">
                <Image
                  src="/hero-illustration.png"
                  alt="LUMINUS Wellness & Connection Network"
                  width={500}
                  height={500}
                  className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
