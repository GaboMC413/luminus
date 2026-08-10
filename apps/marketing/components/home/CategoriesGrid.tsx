const CATEGORIES = [
  {
    title: "Crecimiento Personal",
    color: "#F0A500",
    description: "Herramientas y acompañamiento para desarrollar tu potencial y encontrar propósito.",
    icon: "/Icons/sunny_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Bienestar Emocional",
    color: "#E855C8",
    description: "Espacios y profesionales para comprender tus emociones, cuidar tu salud mental y sentirte mejor.",
    icon: "/Icons/mood_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Salud Integral",
    color: "#0450FB",
    description: "Enfoques orientados al cuidado de tu salud desde una mirada amplia e integral.",
    icon: "/Icons/ecg_heart_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Movimiento Físico",
    color: "#E63946",
    description: "Prácticas y acompañamiento para mantenerte activo, fortalecer tu cuerpo y mejorar tu bienestar físico.",
    icon: "/Icons/exercise_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Nutrición",
    color: "#A8C800",
    description: "Orientación para construir una relación más saludable y consciente con la alimentación.",
    icon: "/Icons/nutrition_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Espiritualidad",
    color: "#6D28D9",
    description: "Prácticas para cultivar la presencia, la conexión interior y el equilibrio personal.",
    icon: "/Icons/self_improvement_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Vínculos y relaciones",
    color: "#FF7700",
    description: "Acompañamiento para construir relaciones más saludables de pareja, familia y otros vínculos.",
    icon: "/Icons/join_inner_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Terapias Alternativas",
    color: "#0FA87A",
    description: "Disciplinas y prácticas que amplían las formas de cuidar tu bienestar y conectar cuerpo y mente.",
    icon: "/Icons/spa_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
];

export function CategoriesGrid() {
  return (
    <section className="w-full py-16 md:py-24 bg-slate-100">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex flex-col gap-12">

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-slate-900 leading-[48px]">
            El bienestar puede tomar muchas formas.
          </h2>
          <p className="text-lg sm:text-xl lg:text-[24px] font-normal text-slate-800 leading-8 max-w-[800px]">
            Reunimos distintas áreas, enfoques y profesionales para que puedas explorar lo que tiene sentido para ti.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-3xl flex flex-col gap-4 border border-slate-200/80 h-[260px] justify-between"
            >
              <div className="flex flex-col gap-3">
                <div
                  style={{
                    backgroundColor: cat.color,
                    maskImage: `url('${cat.icon}')`,
                    WebkitMaskImage: `url('${cat.icon}')`,
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                  }}
                  className="w-8 h-8 shrink-0"
                />
                <h3
                  style={{ color: cat.color }}
                  className="text-xl lg:text-heading-6 font-bold leading-tight"
                >
                  {cat.title}
                </h3>
              </div>
              <p className="text-body-medium font-normal text-slate-700">
                {cat.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
