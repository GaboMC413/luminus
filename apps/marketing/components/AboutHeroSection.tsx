import React from "react";
import Image from "next/image";
import { ArrowRight, Globe } from "lucide-react";

export default function AboutHeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-luminus-bg to-white py-20 lg:py-32 border-b border-slate-100">
      {/* Background glow effects */}
      <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[1000px] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] bg-radial from-teal-50/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left lg:pr-8">
            {/* Tagline */}
            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-luminus-mint-soft px-3 py-1 text-xs font-semibold text-luminus-mint-text border border-teal-100/50 mb-6">
              <Globe className="h-3.5 w-3.5" />
              <span>Nuestra Historia & Propósito</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-luminus-text sm:text-6xl lg:text-6xl leading-[1.1] mb-6">
              Una red para vivir el bienestar de forma más <span className="bg-gradient-to-r from-luminus-blue to-teal-500 bg-clip-text text-transparent">conectada, consciente y humana</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg leading-relaxed text-luminus-text font-medium mb-4 max-w-2xl">
              LUMINUS nace para reunir personas, expertos, espacios y herramientas que ayuden a vivir con más equilibrio, claridad y propósito.
            </p>

            {/* Supporting Text */}
            <p className="text-base leading-relaxed text-luminus-secondary mb-8 max-w-2xl">
              Creemos que el bienestar no depende de una única solución, sino de una red de conexiones, acompañamiento, conocimiento y experiencias que puedan sostener el camino de cada persona.
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
                href="#porque-existe"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-semibold text-luminus-text hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                Conocer qué estamos construyendo
              </a>
            </div>

            {/* Microcopy */}
            <p className="text-xs text-slate-500">
              LUMINUS está naciendo como una plataforma para conectar bienestar, comunidad y tecnología humana.
            </p>
          </div>

          {/* Living Network Illustration */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[450px] aspect-square rounded-[2.5rem] bg-gradient-to-tr from-luminus-blue/5 via-teal-500/5 to-transparent p-4 md:p-6 border border-slate-100">
              <div className="absolute -inset-1 rounded-[2.7rem] bg-gradient-to-tr from-luminus-blue/5 to-teal-500/5 blur-lg -z-10 opacity-30" />
              
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-white shadow-premium border border-slate-100 flex items-center justify-center">
                <Image
                  src="/hero-illustration.png"
                  alt="LUMINUS Living Network of Wellness"
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
