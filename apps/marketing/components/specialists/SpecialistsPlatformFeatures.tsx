import Image from "next/image";

const PLATFORM_FEATURES = [
  {
    icon: "business_center",
    title: "Tener un perfil profesional",
    desc: "Presentar tu experiencia, formación, enfoque y servicios de forma clara.",
  },
  {
    icon: "calendar_check",
    title: "Ofrecer sesiones introductorias",
    desc: "Habilitar encuentros breves de 15 minutos para facilitar un primer contacto con nuevas personas.",
  },
  {
    icon: "chair",
    title: "Publicar tus espacios de atención",
    desc: "Mostrar tu consultorio, clínica o centro y facilitar que las personas puedan encontrarlo.",
  },
  {
    icon: "groups",
    title: "Crear grupos temáticos",
    desc: "Abrir espacios de intercambio sobre temas vinculados con tu especialidad.",
  },
  {
    icon: "books_movies_and_music",
    title: "Ofrecer cursos y capacitaciones",
    desc: "Publicar talleres, cursos y otras propuestas formativas dentro de la plataforma.",
  },
  {
    icon: "mic",
    title: "Participar en entrevistas",
    desc: "Compartir tu experiencia y conocimientos en entrevistas producidas por LUMINUS.",
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
              Todo lo que puedes hacer en LUMINUS
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

        </div>

      </div>
    </section>
  );
}
