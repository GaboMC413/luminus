import Image from "next/image";

export function DarkFeatureShowcase() {
  return (
    <section className="w-full bg-black text-white py-16 md:py-20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* Left Column: Vision Statement */}
        <div className="w-full lg:w-1/2 flex items-center">
          <p className="text-xl sm:text-2xl md:text-3xl font-normal leading-relaxed text-white max-w-xl">
            Un lugar para descubrir nuevas herramientas, encontrar profesionales, compartir intereses y acceder a experiencias que acompañen tu bienestar en diferentes momentos de tu vida.
          </p>
        </div>

        {/* Right Column: Clean App Screens */}
        <div className="w-full lg:w-1/2 flex items-center justify-center gap-6">
          <div className="relative w-[180px] sm:w-[220px] h-[340px] sm:h-[400px] rounded-2xl overflow-hidden bg-slate-900 shrink-0">
            <Image
              src="/Home/Luminus app - comunidad y especialistas.png"
              alt="LUMINUS Comunidad App"
              fill
              className="object-cover object-top"
              sizes="220px"
            />
          </div>
          <div className="relative w-[180px] sm:w-[220px] h-[340px] sm:h-[400px] rounded-2xl overflow-hidden bg-slate-900 shrink-0">
            <Image
              src="/Home/Luminus app - chat con especialista.png"
              alt="LUMINUS Chat App"
              fill
              className="object-cover object-top"
              sizes="220px"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
