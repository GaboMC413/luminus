import Image from "next/image";

export function SpecialistsHighlight() {
  return (
    <section className="w-full bg-[#FF7700] text-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch min-h-[560px]">
        
        {/* Left Column: Text & CTA */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 lg:p-20 flex flex-col justify-center gap-6">
          <h2 className="text-3xl lg:text-heading-3 font-normal tracking-tight text-white">
            Descubre Especialistas
          </h2>
          <p className="text-xl lg:text-heading-6 font-normal text-amber-100">
            Cada Especialista cuenta con un perfil con su experiencia, formación, áreas de servicios y formas de atención.
          </p>
          <p className="text-body-large font-normal text-white/90">
            Una manera simple de conocer enfoques, trayectorias y propuestas profesionales en LATAM.
          </p>
          <div className="pt-2">
            <a
              href="https://app.luminus.lat/auth"
              className="inline-block py-3.5 px-8 text-body-medium font-normal text-white bg-black hover:bg-slate-800 rounded-2xl text-center min-w-[280px]"
            >
              Explorar especialistas
            </a>
          </div>
        </div>

        {/* Right Column: Clean App Preview */}
        <div className="w-full lg:w-1/2 bg-[#eed7c4] min-h-[360px] lg:min-h-[560px] relative flex items-center justify-center p-8 overflow-hidden">
          <div className="relative w-[260px] sm:w-[300px] h-[480px] sm:h-[540px] bg-slate-900 rounded-2xl overflow-hidden shrink-0">
            <Image
              src="/Home/Luminus app - perfil especialista y directorio.png"
              alt="Directorio de Especialistas LUMINUS"
              fill
              className="object-cover object-top"
              sizes="300px"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
