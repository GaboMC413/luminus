import Image from "next/image";

export function SpecialistsHero() {
  return (
    <section className="w-full bg-luminus-cobalt text-white overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch min-h-[640px]">
        
        {/* Left 50% Column */}
        <div className="w-full lg:w-1/2 px-8 sm:px-12 lg:px-20 py-16 lg:py-24 flex flex-col justify-center gap-6 text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-heading-2 font-normal tracking-tight text-white leading-[1.12] max-w-[600px]">
            Desarrolla tu práctica dentro de LUMINUS
          </h1>
          <p className="text-xl lg:text-heading-6 font-normal text-white/90 leading-8 max-w-[580px]">
            Forma parte de la Red de Especialistas, presenta tu trabajo y conecta con personas interesadas en conocer tu enfoque.
          </p>
        </div>

        {/* Right 50% Column: Full Bleed Photo */}
        <div className="w-full lg:w-1/2 relative min-h-[360px] lg:min-h-[640px]">
          <Image
            src="/Photos/Grupo diverso de cinco personas sentadas.png"
            alt="Desarrolla tu práctica dentro de LUMINUS"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

      </div>
    </section>
  );
}
