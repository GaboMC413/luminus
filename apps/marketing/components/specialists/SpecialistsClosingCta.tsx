import Image from "next/image";

export function SpecialistsClosingCta() {
  return (
    <section className="w-full bg-black text-white overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch min-h-[640px]">
        
        {/* Left 50% Column */}
        <div className="w-full lg:w-1/2 px-8 sm:px-12 lg:px-16 py-12 lg:py-20 flex flex-col justify-center gap-6 text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-white leading-[48px]">
            Forma parte de una nueva red profesional de bienestar
          </h2>
          <div className="flex flex-col gap-3 text-base sm:text-lg font-normal text-slate-300 leading-relaxed">
            <p>
              LUMINUS nace para acercar distintas formas de acompañar el bienestar y hacer que encontrarlas sea más simple, cercana y accesible.
            </p>
            <p>
              Queremos construir esa red junto a profesionales que aportan experiencia, conocimiento y nuevas perspectivas desde distintas disciplinas de toda Latinoamérica.
            </p>
            <p>
              Si quieres sumar tu práctica, conocer mejor la propuesta o conversar con nuestro equipo, estamos abiertos a escucharte.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <a
              href="https://app.luminus.lat/auth"
              className="inline-block py-3.5 px-8 text-base font-normal text-slate-950 bg-white hover:bg-slate-100 rounded-2xl text-center min-w-[240px] transition-colors"
            >
              Aplicar como especialista
            </a>
            <a
              href="mailto:hola@luminus.lat"
              className="text-base font-normal text-white hover:text-slate-300 underline leading-6 transition-colors"
            >
              Consultar sobre el programa
            </a>
          </div>
        </div>

        {/* Right 50% Column - Full Edge-to-Edge Image Fill */}
        <div className="w-full lg:w-1/2 min-h-[380px] lg:min-h-[640px] relative overflow-hidden h-full">

          <Image
            src="/Photos/Luminus app - perfiles de Camila y Martín.png"
            alt="Red Profesional LUMINUS"
            fill
            className="object-cover object-left-top"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

      </div>
    </section>
  );
}
