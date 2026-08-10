import Image from "next/image";

const PLATFORM_FEATURES = [
  {
    title: "Crear tu perfil profesional",
    desc: "Un perfil completo contando de tu formación, experiencia, especialidad y enfoque de trabajo.",
  },
  {
    title: "Ofrecer sesiones introductorias",
    desc: "Sesiones de 15 minutos para que nuevas personas puedan conocer tu forma de trabajar antes de avanzar contigo.",
  },
  {
    title: "Sumar tu espacio a la red",
    desc: "El espacio dónde desarrollas tu práctica para que las personas te descubran en el mapa y conozcan tus servicios.",
  },
  {
    title: "Crear grupos temáticos",
    desc: "Genera comunidad alrededor de temas que trabajas y manten un vínculo más continuo con personas afines.",
  },
  {
    title: "Compartir tus cursos",
    desc: "Darle visibilidad tus propuestas que complementan tu práctica y acercarlas a personas interesadas.",
  },
  {
    title: "Participar en entrevistas",
    desc: "Amplia tu presencia internacional, fortalece tu posicionamiento profesional y llegar a nuevas audiencias.",
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
            alt="Presencia Profesional LUMINUS"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Right Column: Title & 6 Features in 2-Column Grid */}
        <div className="w-full lg:w-1/2 p-8 md:p-14 lg:p-16 flex flex-col justify-center gap-8">
          
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-white leading-[48px]">
              Una plataforma para desarrollar tu presencia profesional
            </h2>
          </div>

          {/* 6 Features Grid (2 columns) matching ForSpecialistsSection layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {PLATFORM_FEATURES.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
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
