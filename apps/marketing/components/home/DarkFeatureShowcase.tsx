import Image from "next/image";

export function DarkFeatureShowcase() {
  return (
    <section className="w-full bg-black text-white overflow-hidden flex justify-center items-center">
      <div className="w-full max-w-[1440px] flex flex-col lg:flex-row items-center justify-between min-h-[360px] lg:h-[380px]">

        {/* Left 50% Column */}
        <div className="w-full lg:w-1/2 px-8 sm:px-14 lg:px-20 py-14 sm:py-16 lg:py-0 flex items-center justify-start h-full">
          <p className="text-xl lg:text-heading-5 font-normal text-white max-w-xl">
            Conecta con personas, encuentra especialistas, participa de actividades y descubre nuevas formas de cuidar tu bienestar en Latinoamérica.
          </p>
        </div>

        {/* Right 50% Column - Full Edge-to-Edge Fill */}
        <div className="w-full lg:w-1/2 h-[340px] lg:h-full relative overflow-hidden">
          <Image
            src="/Photos/Luminus app - comunidad y especialistas.png"
            alt="LUMINUS App Showcase"
            fill
            className="object-cover object-center lg:object-left"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

      </div>
    </section>
  );
}
