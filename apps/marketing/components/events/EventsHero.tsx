import Image from "next/image";

export function EventsHero() {
  return (
    <section className="w-full bg-[#D255CE] text-white overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch min-h-[640px]">
        
        {/* Left 50% Column */}
        <div className="w-full lg:w-1/2 px-8 sm:px-12 lg:px-20 py-16 lg:py-24 flex flex-col justify-center gap-6 text-left bg-[#D255CE]">
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-normal tracking-tight text-white leading-[1.12] max-w-[620px]">
            Experiencias que merecen ser transmitidas
          </h1>
          <p className="text-xl lg:text-[24px] font-normal text-white/95 leading-8 max-w-[580px]">
            Descubre entrevistas y encuentros que reúnen distintas perspectivas para acercar nuevas formas de entender el bienestar, compartir experiencias y conectar con ideas abren nuevos caminos.
          </p>
        </div>

        {/* Right 50% Column: Full Bleed Photo */}
        <div className="w-full lg:w-1/2 relative min-h-[360px] lg:min-h-[640px]">
          <Image
            src="/Photos/Grupo de personas conversando de pie.png"
            alt="Experiencias y Encuentros LUMINUS"
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
