import Image from "next/image";

const PLATFORM_FEATURES = [
  {
    icon: "business_center",
    title: "Presenta tu perfil profesional",
    desc: "Haz visible tu experiencia, especialidad y enfoque de trabajo.",
  },
  {
    icon: "calendar_check",
    title: "Agenda sesiones introductorias",
    desc: "Coordina encuentros breves para un primer acercamiento.",
  },
  {
    icon: "groups",
    title: "Crea grupos temáticos",
    desc: "Abre espacios para compartir experiencias y recursos.",
  },
  {
    icon: "chair",
    title: "Suma tu espacio a la red",
    desc: "Publica tu consultorio, clínica o espacio de bienestar.",
  },
  {
    icon: "books_movies_and_music",
    title: "Ofrece cursos y capacitaciones",
    desc: "Acerca tus propuestas formativas a la comunidad.",
  },
  {
    icon: "mic",
    title: "Participa en entrevistas",
    desc: "Comparte tu mirada profesional y amplía tu visibilidad.",
  },
];

export function SpecialistsPlatformFeatures() {
  return (
    <section className="w-full bg-luminus-magenta text-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch min-h-[640px]">

        {/* Left Column: Image (40% width to give 2-col grid more space) */}
        <div className="w-full lg:w-[40%] xl:w-[38%] min-h-[360px] lg:min-h-[640px] relative bg-luminus-magenta-light">
          <Image
            src="/Photos/Tres personas de pie sonriendo.png"
            alt="Herramientas para desarrollar tu práctica LUMINUS"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 40vw"
            priority
          />
        </div>

        {/* Right Column: Title & 6 Features Grid (60% width) */}
        <div className="w-full lg:w-[60%] xl:w-[62%] p-8 md:p-12 lg:p-14 xl:p-16 flex flex-col justify-center gap-8">

          <div className="flex flex-col gap-3">
            <h2 className="text-3xl sm:text-4xl lg:text-heading-3 font-normal tracking-tight text-white">
              Herramientas para desarrollar tu práctica
            </h2>
          </div>

          {/* 6 Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 xl:gap-x-12 gap-y-7 pt-2">
            {PLATFORM_FEATURES.map((item, index) => (
              <div key={index} className="flex items-start gap-3.5">
                <span
                  className="material-symbols-rounded text-white text-[24px] shrink-0 mt-0.5 select-none"
                  style={{
                    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  {item.icon}
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm font-normal text-pink-100 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Black CTA Button */}
          <div className="pt-2 w-full sm:w-auto">
            <a
              href="https://app.luminuslatam.com/auth/registrarse/especialista"
              className="flex sm:inline-flex items-center justify-center px-8 py-3.5 bg-black hover:bg-slate-900 text-white text-base font-normal rounded-2xl text-center w-full sm:w-auto sm:min-w-[240px] transition-colors shadow-none cursor-pointer"
            >
              Registrarme como Especialista
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
