import Image from "next/image";

const SPECIALIST_PILLARS = [
  {
    title: "Haz visible tu trabajo",
    desc: "Presenta tu experiencia, formación, especialidades y servicios en un perfil profesional completo.",
  },
  {
    title: "Conecta con nuevas personas",
    desc: "Recibe consultas y solicitudes de sesiones introductorias, sin intermediarios ni comisiones sobre tus servicios.",
  },
  {
    title: "Amplía tu presencia",
    desc: "Publica tus espacios y cursos, crea grupos y participa en entrevistas y otras iniciativas de la comunidad.",
  },
];

export function ForSpecialistsSection() {
  return (
    <section id="especialistas-section" className="w-full bg-[#E855C8] text-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch min-h-[640px]">
        
        {/* Left Column: Image */}
        <div className="w-full lg:w-1/2 min-h-[360px] lg:min-h-[640px] relative bg-pink-900">
          <Image
            src="/Photos/Grupo diverso de cinco personas sentadas.png"
            alt="Grupo de especialistas LUMINUS"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        {/* Right Column: Features & CTA */}
        <div className="w-full lg:w-1/2 p-8 md:p-14 lg:p-16 flex flex-col justify-center gap-8">
          
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl lg:text-heading-3 font-normal tracking-tight text-white leading-tight">
              Forma parte de LUMINUS como Especialista
            </h2>
          </div>

          {/* 3 Pillars List with Material Symbol Icon */}
          <div className="flex flex-col gap-6 pt-2">
            {SPECIALIST_PILLARS.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <span 
                  className="material-symbols-outlined text-white select-none shrink-0 mt-0.5"
                  style={{ 
                    fontSize: "24px", 
                    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" 
                  }}
                >
                  heart_smile
                </span>
                <div className="flex flex-col gap-1">
                  <h4 className="text-lg font-bold text-white leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-body-medium font-normal text-pink-100 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-4">
            <a
              href="https://luminuslatam.com/especialistas"
              className="flex sm:inline-flex items-center justify-center w-full sm:w-auto py-3.5 px-8 text-body-medium font-normal text-white bg-black hover:bg-slate-800 rounded-2xl text-center sm:min-w-[280px] transition-colors"
            >
              Conocer cómo formar parte
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
