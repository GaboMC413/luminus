const CATEGORIES = [
  {
    title: "Crecimiento Personal",
    color: "#F0A500",
    description: "Herramientas y acompañamiento para desarrollar tu potencial y encontrar propósito.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Bienestar Emocional",
    color: "#E855C8",
    description: "Espacios y profesionales para comprender tus emociones, cuidar tu salud mental y sentirte mejor.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.684a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: "Salud Integral",
    color: "#0450FB",
    description: "Enfoques orientados al cuidado de tu salud desde una mirada amplia e integral.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Movimiento Físico",
    color: "#E63946",
    description: "Prácticas y acompañamiento para mantenerte activo, fortalecer tu cuerpo y mejorar tu bienestar físico.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: "Nutrición",
    color: "#A8C800",
    description: "Orientación para construir una relación más saludable y consciente con la alimentación.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V14M9 21h6" />
      </svg>
    ),
  },
  {
    title: "Espiritualidad",
    color: "#6D28D9",
    description: "Prácticas para cultivar la presencia, la conexión interior y el equilibrio personal.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: "Vínculos y relaciones",
    color: "#FF7700",
    description: "Acompañamiento para construir relaciones más saludables de pareja, familia y otros vínculos.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: "Terapias Alternativas",
    color: "#0FA87A",
    description: "Disciplinas y prácticas que amplían las formas de cuidar tu bienestar y conectar cuerpo y mente.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
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
                <div style={{ color: cat.color }} className="w-10 h-10 shrink-0">
                  {cat.icon}
                </div>
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
