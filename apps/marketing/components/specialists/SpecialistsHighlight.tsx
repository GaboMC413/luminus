import Image from "next/image";

export function SpecialistsHighlight() {
  return (
    <section className="w-full bg-[#FF7700] text-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch min-h-[560px]">

        {/* Left Column: Text & CTA */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 lg:p-20 flex flex-col justify-center gap-6">
          <h2 className="text-3xl lg:text-heading-3 font-normal tracking-tight text-white leading-tight">
            Conoce mejor a cada Especialista
          </h2>
          <p className="text-body-large font-normal text-white/90 leading-relaxed">
            En su perfil puedes conocer su experiencia, formación, áreas de trabajo y formas de atención. Una manera simple de entender su trayectoria y enfoque antes de decidir con quién contactar.
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

        {/* Right Column: Full Bleed Image Asset */}
        <div className="w-full lg:w-1/2 min-h-[360px] lg:min-h-[560px] relative overflow-hidden bg-[#eed7c4]">
          <Image
            src="/Photos/Luminus app - perfil especialista y directorio.png"
            alt="Directorio de Especialistas LUMINUS"
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
