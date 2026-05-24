import React from "react";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-32">
      {/* Playful background glows */}
      <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[1000px] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] bg-radial from-luminus-pink/10 via-luminus-lime/10 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left lg:pr-8">
            {/* Playful Top Badge */}
            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-luminus-lime border-2 border-black px-3.5 py-1 text-xs font-black text-black shadow-bold-sm mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Red de Bienestar Humano</span>
            </div>

            {/* Main Title */}
            <h1 className="font-display text-4xl font-black tracking-tight text-black sm:text-6xl lg:text-6xl leading-[1.05] mb-6">
              Descubre una nueva forma de <span className="bg-gradient-to-r from-luminus-blue via-luminus-orange to-luminus-pink bg-clip-text text-transparent">conectar con tu bienestar</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl leading-relaxed text-black font-bold mb-8 max-w-2xl">
              LUMINUS es una plataforma para explorar personas, expertos, espacios, recursos y herramientas diseñadas para acompañarte en tu camino hacia una vida con más equilibrio, claridad y propósito.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-5">
              <a
                href="https://app.luminuslatam.com/signup"
                className="inline-flex items-center justify-center rounded-full bg-black border-2 border-black px-8 py-4 text-base font-bold text-white shadow-bold hover:shadow-none hover:bg-luminus-orange hover:text-black hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150"
              >
                Crear mi cuenta
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="#para-expertos"
                className="inline-flex items-center justify-center rounded-full bg-white border-2 border-black px-8 py-4 text-base font-bold text-black shadow-bold-sm hover:shadow-none hover:bg-luminus-lime hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150"
              >
                Ver qué puedo hacer en LUMINUS
              </a>
            </div>

            {/* Microcopy */}
            <p className="text-xs text-slate-500 font-semibold pl-1">
              Comienza con <span className="text-black font-bold decoration-luminus-orange decoration-2 underline">3 meses de acceso sin costo</span>. No se solicitarán datos de pago.
            </p>
          </div>

          {/* Hero Illustration */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px] aspect-square rounded-[2.5rem] p-3 border-2 border-black bg-white shadow-bold-pink">
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-white border-2 border-black flex items-center justify-center">
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
