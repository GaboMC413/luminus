import React from "react";
import Image from "next/image";
import { ArrowRight, Globe } from "lucide-react";

export default function AboutHeroSection() {
  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-32 border-b-2 border-black">
      {/* Background glow effects */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] bg-radial from-luminus-lime/5 via-luminus-pink/5 to-transparent" />
      <div className="absolute right-0 top-1/4 w-72 h-72 bg-luminus-orange/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left lg:pr-8">
            {/* Tagline */}
            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-luminus-lime border-2 border-black px-4 py-1.5 text-xs font-black text-black shadow-bold-sm mb-6">
              <Globe className="h-3.5 w-3.5" />
              <span>Nuestra Historia & Propósito</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl font-black tracking-tight text-black sm:text-6xl lg:text-7xl leading-[1.05] mb-6">
              Una red para vivir el bienestar de forma más{" "}
              <span className="bg-luminus-pink text-black px-3 py-1 border-2 border-black inline-block rounded-2xl transform -rotate-1 shadow-bold-sm mt-1 sm:mt-0">
                conectada y humana
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl leading-relaxed text-slate-900 font-black mb-4 max-w-2xl">
              LUMINUS nace para reunir personas, expertos, espacios y herramientas que ayuden a vivir con más equilibrio, claridad y propósito.
            </p>

            {/* Supporting Text */}
            <p className="text-base leading-relaxed text-slate-700 font-bold mb-8 max-w-2xl">
              Creemos que el bienestar no depende de una única solución, sino de una red de conexiones, acompañamiento, conocimiento y experiencias que puedan sostener el camino de cada persona.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
              <a
                href="https://app.luminuslatam.com/signup"
                className="inline-flex items-center justify-center rounded-full bg-black border-2 border-black px-8 py-4 text-base font-bold text-white shadow-bold hover:shadow-none hover:bg-luminus-orange hover:text-black hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150"
              >
                Crear mi cuenta
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="#porque-existe"
                className="inline-flex items-center justify-center rounded-full border-2 border-black bg-white px-8 py-4 text-base font-bold text-black shadow-bold hover:shadow-none hover:bg-luminus-lime hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150"
              >
                Conocer qué construimos
              </a>
            </div>

            {/* Microcopy */}
            <p className="text-xs text-slate-500 font-black pl-1">
              * LUMINUS está naciendo como una plataforma para conectar bienestar, comunidad y tecnología humana.
            </p>
          </div>

          {/* Living Network Illustration */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[450px] aspect-square rounded-[2.5rem] bg-white p-4 md:p-6 border-2 border-black shadow-bold-lg transition-transform duration-300 hover:-rotate-1">
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden border-2 border-black bg-white">
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
