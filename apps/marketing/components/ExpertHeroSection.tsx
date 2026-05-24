import React from "react";
import Image from "next/image";
import { ArrowRight, Briefcase } from "lucide-react";

export default function ExpertHeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-luminus-bg to-white py-20 lg:py-32 border-b border-slate-100">
      {/* Subtle decorative background glow */}
      <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[1000px] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] bg-radial from-blue-50/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left lg:pr-8">
            {/* Elegant Institutional Tag */}
            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-luminus-blue-soft px-3 py-1 text-xs font-semibold text-luminus-blue border border-blue-100/50 mb-6">
              <Briefcase className="h-3.5 w-3.5" />
              <span>Red Profesional de Bienestar</span>
            </div>

            {/* Editorial Title */}
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-luminus-text sm:text-6xl lg:text-6xl leading-[1.1] mb-6">
              Lleva tu conocimiento a una <span className="bg-gradient-to-r from-luminus-blue to-emerald-600 bg-clip-text text-transparent">red creada para el bienestar</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl leading-relaxed text-luminus-secondary mb-8 max-w-2xl">
              LUMINUS conecta a profesionales, expertos y facilitadores con personas que buscan acompañamiento, recursos y experiencias para avanzar hacia una vida con más equilibrio, claridad y propósito.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
              <a
                href="https://app.luminuslatam.com/signup"
                className="inline-flex items-center justify-center rounded-2xl bg-luminus-blue px-6 py-4 text-base font-bold text-white shadow-accent hover:shadow-accent-hover hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200"
              >
                Registrarme como primer paso
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="#funciones-expertos"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-semibold text-luminus-text hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                Conocer funciones para expertos
              </a>
            </div>

            {/* Microcopy */}
            <p className="text-xs text-slate-500 leading-relaxed">
              El primer paso para ser Experto LUMINUS es crear tu cuenta dentro de la plataforma.
            </p>
          </div>

          {/* Composition Illustration */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[450px] aspect-square rounded-[2.5rem] bg-gradient-to-tr from-luminus-blue/5 via-emerald-500/5 to-transparent p-4 md:p-6 border border-slate-100">
              <div className="absolute -inset-1 rounded-[2.7rem] bg-gradient-to-tr from-luminus-blue/5 to-emerald-500/5 blur-lg -z-10 opacity-40" />
              
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-white shadow-premium border border-slate-100 flex items-center justify-center">
                <Image
                  src="/experts-illustration.png"
                  alt="LUMINUS Professional & Experts Wellness Network"
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
