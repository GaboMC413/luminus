import Image from "next/image";

export function EventsHero() {
  return (
    <section className="w-full bg-[#D255CE] text-white overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch min-h-[640px]">
        
        {/* Left 50% Column */}
        <div className="w-full lg:w-1/2 px-8 sm:px-12 lg:px-20 py-16 lg:py-24 flex flex-col justify-center gap-6 text-left bg-[#D255CE]">
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-normal tracking-tight text-white leading-[1.12] max-w-[620px]">
            Entrevistas y encuentros sobre bienestar
          </h1>
          <p className="text-xl lg:text-[24px] font-normal text-white/95 leading-8 max-w-[580px]">
            Conversaciones con especialistas, experiencias compartidas y distintas formas de acercarnos a temas que forman parte de nuestro bienestar.
          </p>
        </div>

        {/* Right 50% Column: Full Bleed Photo */}
        <div className="w-full lg:w-1/2 relative min-h-[360px] lg:min-h-[640px]">
          <Image
            src="/Photos/Grupo de personas conversando de pie.png"
            alt="Entrevistas y encuentros sobre bienestar LUMINUS"
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
