const CATEGORIES = [
  {
    title: "Crecimiento Personal",
    color: "#F0A500",
    description: "Herramientas y acompañamiento para desarrollar tu potencial y encontrar propósito.",
    icon: "sunny",
  },
  {
    title: "Bienestar Emocional",
    color: "#E855C8",
    description: "Espacios y profesionales para comprender tus emociones, cuidar tu salud mental y sentirte mejor.",
    icon: "mood",
  },
  {
    title: "Salud Integral",
    color: "#0450FB",
    description: "Enfoques orientados al cuidado de tu salud desde una mirada amplia e integral.",
    icon: "stethoscope",
  },
  {
    title: "Movimiento Físico",
    color: "#E63946",
    description: "Prácticas y acompañamiento para mantenerte activo, fortalecer tu cuerpo y mejorar tu bienestar físico.",
    icon: "exercise",
  },
  {
    title: "Nutrición",
    color: "#A8C800",
    description: "Orientación para construir una relación más saludable y consciente con la alimentación.",
    icon: "nutrition",
  },
  {
    title: "Espiritualidad",
    color: "#6D28D9",
    description: "Prácticas para cultivar la presencia, la conexión interior y el equilibrio personal.",
    icon: "self_improvement",
  },
  {
    title: "Vínculos y relaciones",
    color: "#FF7700",
    description: "Acompañamiento para construir relaciones más saludables de pareja, familia y otros vínculos.",
    icon: "person_celebrate",
  },
  {
    title: "Terapias Alternativas",
    color: "#0FA87A",
    description: "Disciplinas y prácticas que amplían las formas de cuidar tu bienestar y conectar cuerpo y mente.",
    icon: "spa",
  },
];

export function CategoriesGrid() {
  return (
    <section className="w-full py-16 md:py-24 bg-slate-100">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex flex-col gap-12">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            El bienestar puede tomar muchas formas.
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-700 max-w-[800px] leading-relaxed">
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
                <span
                  style={{ color: cat.color }}
                  className="material-symbols-rounded text-4xl select-none"
                >
                  {cat.icon}
                </span>
                <h3
                  style={{ color: cat.color }}
                  className="text-xl font-bold leading-tight"
                >
                  {cat.title}
                </h3>
              </div>
              <p className="text-sm md:text-base text-slate-700 leading-relaxed font-normal">
                {cat.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
