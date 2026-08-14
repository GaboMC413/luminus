const DISCIPLINES_COL_1 = [
  {
    title: "Crecimiento Personal",
    color: "#F0A500",
    description: "Coaching, mentoría, orientación y procesos de desarrollo personal y profesional.",
    icon: "/Icons/sunny_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Bienestar Emocional",
    color: "#E855C8",
    description: "Psicología, psicoterapia y acompañamiento para el bienestar y la salud emocional.",
    icon: "/Icons/mood_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Salud Integral",
    color: "#0450FB",
    description: "Medicina, fisioterapia y otras disciplinas orientadas al cuidado integral de la salud.",
    icon: "/Icons/ecg_heart_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Movimiento Físico",
    color: "#E63946",
    description: "Entrenamiento, movilidad y prácticas corporales orientadas al bienestar físico.",
    icon: "/Icons/exercise_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
];

const DISCIPLINES_COL_2 = [
  {
    title: "Nutrición",
    color: "#A8C800",
    description: "Nutrición, alimentación y acompañamiento para construir hábitos saludables.",
    icon: "/Icons/nutrition_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Espiritualidad",
    color: "#6D28D9",
    description: "Meditación, mindfulness y prácticas orientadas al autoconocimiento.",
    icon: "/Icons/self_improvement_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Vínculos y relaciones",
    color: "#FF7700",
    description: "Acompañamiento de pareja, familiar y vincular para fortalecer relaciones.",
    icon: "/Icons/join_inner_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Terapias Alternativas",
    color: "#0FA87A",
    description: "Prácticas y terapias complementarias orientadas al bienestar y cuidado personal.",
    icon: "/Icons/spa_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
];

export function SpecialistsDisciplines() {
  return (
    <section className="w-full py-16 md:py-24 bg-gray-100">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-16">

        {/* Left Column: Title, Subtitle, CTA & Disclaimer */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center items-start gap-6 text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-black leading-[48px]">
            Una red para distintas formas de acompañar el bienestar
          </h2>
          <p className="text-xl lg:text-2xl font-normal text-black leading-8">
            Reunimos a profesionales de diferentes disciplinas, enfoques y trayectorias.
          </p>
          <div className="pt-2">
            <a
              href="https://app.luminuslatam.com/auth/registrarse"
              className="inline-block px-8 py-3.5 bg-black hover:bg-slate-800 text-white text-base font-normal rounded-2xl text-center min-w-[240px] transition-colors"
            >
              Aplicar como Especialista
            </a>
          </div>
          <p className="text-sm font-normal text-black leading-5 pt-2">
            Cada perfil se evalúa de forma individual antes de incorporarse a la Red de Especialistas. Revisamos la formación, la experiencia y la propuesta profesional para construir una comunidad diversa, confiable y alineada con el propósito de LUMINUS.
          </p>
        </div>

        {/* Right Column: 8 Disciplines Grid (2 Clean Columns without card boxes) */}
        <div className="w-full lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 gap-10 items-start">

          {/* Column 1 */}
          <div className="flex flex-col gap-8">
            {DISCIPLINES_COL_1.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      backgroundColor: item.color,
                      maskImage: `url('${item.icon}')`,
                      WebkitMaskImage: `url('${item.icon}')`,
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                    }}
                    className="w-6 h-6 shrink-0"
                  />
                  <h3 style={{ color: item.color }} className="text-lg font-bold leading-6">
                    {item.title}
                  </h3>
                </div>
                <p className="text-base font-normal text-black leading-6">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-8">
            {DISCIPLINES_COL_2.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      backgroundColor: item.color,
                      maskImage: `url('${item.icon}')`,
                      WebkitMaskImage: `url('${item.icon}')`,
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                    }}
                    className="w-6 h-6 shrink-0"
                  />
                  <h3 style={{ color: item.color }} className="text-lg font-bold leading-6">
                    {item.title}
                  </h3>
                </div>
                <p className="text-base font-normal text-black leading-6">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
