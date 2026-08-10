import Image from "next/image";

export function DarkFeatureShowcase() {
  return (
    <section className="w-full bg-black text-white overflow-hidden flex justify-center items-center">
      <div className="w-full max-w-[1440px] flex flex-col lg:flex-row items-center justify-between min-h-[320px]">
        
        {/* Left 50% Column */}
        <div className="w-full lg:w-1/2 px-8 sm:px-14 lg:px-20 py-12 lg:py-0 flex items-center justify-start">
          <p className="text-xl sm:text-heading-6 lg:text-heading-5 font-normal text-white max-w-xl">
            Un lugar para descubrir nuevas herramientas, encontrar profesionales, compartir intereses y acceder a experiencias que acompañen tu bienestar en diferentes momentos de tu vida.
          </p>
        </div>

        {/* Right 50% Column - Full Edge-to-Edge Fill */}
        <div className="w-full lg:w-1/2 h-[320px] relative overflow-hidden">
          <Image
            src="/Photos/Luminus app - comunidad y especialistas.png"
            alt="LUMINUS App Showcase"
            fill
            className="object-cover object-left"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

      </div>
    </section>
  );
}
