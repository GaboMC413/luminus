import Image from "next/image";

export function DarkFeatureShowcase() {
  return (
    <section className="w-full bg-black text-white py-16 md:py-24 overflow-hidden relative border-y border-black">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* Left Column: Vision Statement */}
        <div className="w-full lg:w-1/2 flex items-center">
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] font-normal leading-relaxed text-slate-100 max-w-[620px]">
            Un lugar para descubrir nuevas herramientas, encontrar profesionales, compartir intereses y acceder a experiencias que acompañen tu bienestar en diferentes momentos de tu vida.
          </p>
        </div>

        {/* Right Column: Phone Mockups Container */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative min-h-[320px] md:min-h-[420px]">
          <div className="relative w-full max-w-[500px] flex items-center justify-center">
            
            {/* Phone 1 (Tilted Left) */}
            <div className="relative w-[190px] sm:w-[230px] h-[360px] sm:h-[420px] bg-slate-900 rounded-[32px] border-4 border-slate-800 shadow-2xl overflow-hidden transform -rotate-12 -translate-x-6 sm:-translate-x-10 hover:rotate-0 transition-transform duration-500 z-10 shrink-0">
              <Image
                src="/Home/Luminus app - comunidad y especialistas.png"
                alt="LUMINUS Comunidad App"
                fill
                className="object-cover object-top"
                sizes="240px"
              />
            </div>

            {/* Phone 2 (Tilted Right) */}
            <div className="relative w-[190px] sm:w-[230px] h-[360px] sm:h-[420px] bg-slate-900 rounded-[32px] border-4 border-slate-800 shadow-2xl overflow-hidden transform rotate-12 translate-x-6 sm:translate-x-10 hover:rotate-0 transition-transform duration-500 z-20 shrink-0">
              <Image
                src="/Home/Luminus app - chat con especialista.png"
                alt="LUMINUS Chat App"
                fill
                className="object-cover object-top"
                sizes="240px"
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
