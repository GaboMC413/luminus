import Image from "next/image";

export function DarkFeatureShowcase() {
  return (
    <section className="w-full bg-black text-white overflow-hidden flex justify-center items-center">
      <div className="w-full max-w-[1440px] flex flex-col lg:flex-row items-center justify-between min-h-[320px]">
        
        {/* Left Text Container */}
        <div className="w-full lg:w-1/2 px-8 sm:px-14 lg:px-20 py-10 lg:py-0 flex items-center justify-center">
          <p className="text-2xl sm:text-3xl font-normal leading-relaxed lg:leading-[40px] text-white">
            Un lugar para descubrir nuevas herramientas, encontrar profesionales, compartir intereses y acceder a experiencias que acompañen tu bienestar en diferentes momentos de tu vida.
          </p>
        </div>

        {/* Right Direct Image Asset */}
        <div className="w-full lg:w-1/2 h-[320px] relative overflow-hidden flex justify-center items-center">
          <div className="relative w-full h-full max-w-[680px]">
            <Image
              src="/Home/Luminus app - comunidad y especialistas.png"
              alt="LUMINUS App Showcase"
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 680px"
              priority
            />
          </div>
        </div>

      </div>
    </section>
  );
}
