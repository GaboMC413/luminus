import Image from "next/image";

const SPECIALIST_FEATURES = [
  {
    title: "Presenta tu perfil profesional",
    desc: "Haz visible tu experiencia, especialidad y enfoque de trabajo.",
  },
  {
    title: "Brinda sesiones introductorias",
    desc: "Habilita encuentros breves para un primer acercamiento.",
  },
  {
    title: "Suma tu espacio a la red",
    desc: "Publica tu consultorio, clínica o espacio de bienestar.",
  },
  {
    title: "Crea grupos temáticos",
    desc: "Genera espacios para compartir experiencias y recursos.",
  },
  {
    title: "Ofrece tus cursos",
    desc: "Acerca tus propuestas formativas a la comunidad.",
  },
  {
    title: "Participa en entrevistas",
    desc: "Comparte tu mirada profesional y amplía tu visibilidad.",
  },
];

export function ForSpecialistsSection() {
  return (
    <section id="especialistas-section" className="w-full bg-[#E855C8] text-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch min-h-[640px]">
        
        {/* Left Column: Image */}
        <div className="w-full lg:w-1/2 min-h-[360px] lg:min-h-[640px] relative bg-pink-900">
          <Image
            src="/Home/Grupo diverso de cinco personas sentadas.png"
            alt="Grupo de especialistas LUMINUS"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        {/* Right Column: Features & CTA */}
        <div className="w-full lg:w-1/2 p-8 md:p-14 lg:p-16 flex flex-col justify-center gap-8">
          
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Para especialistas
            </h2>
            <p className="text-xl md:text-2xl font-normal text-pink-100">
              Muestra tu propuesta profesional dentro de la red.
            </p>
          </div>

          {/* 6 Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {SPECIALIST_FEATURES.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-base font-bold text-white leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs md:text-sm text-pink-100 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-4">
            <a
              href="https://app.luminus.lat/auth"
              className="inline-block py-3.5 px-8 text-base font-semibold text-white bg-black hover:bg-slate-800 rounded-2xl shadow-md transition-all text-center min-w-[280px]"
            >
              Sumarme como Especialista
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
