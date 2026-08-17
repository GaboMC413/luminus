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
    <section className="w-full bg-[#E855C8] text-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch min-h-[640px]">
        
        {/* Left Column: Full-Bleed Image */}
        <div className="w-full lg:w-1/2 min-h-[360px] lg:min-h-[640px] relative bg-pink-900">
          <Image
            src="/Photos/Tres personas de pie sonriendo.png"
            alt="Herramientas para desarrollar tu práctica LUMINUS"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Right Column: Title & 6 Features Grid */}
        <div className="w-full lg:w-1/2 p-8 md:p-14 lg:p-16 flex flex-col justify-center gap-8">
          
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-white leading-[48px]">
              Herramientas para desarrollar tu práctica
            </h2>
          </div>

          {/* 6 Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-2">
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

        </div>

      </div>
    </section>
  );
}
