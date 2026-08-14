const PROCESS_STEPS = [
  {
    num: 1,
    title: "Crea tu cuenta",
    desc: "Regístrate en LUMINUS o inicia sesión si ya tienes una cuenta.",
  },
  {
    num: 2,
    title: "Aplica al programa",
    desc: "Completa tu perfil y elige si quieres dar sesiones o mostrar tus espacios.",
  },
  {
    num: 3,
    title: "Revisamos tu perfil",
    desc: "Nuestro equipo revisará tu perfil antes de incorporarlo a la Red de Especialistas.",
  },
  {
    num: 4,
    title: "Ingresa a la Red",
    desc: "Si tu aplicación es aprobada, tu perfil quedará activo como Especialista LUMINUS.",
  },
];

export function SpecialistsProcessSteps() {
  return (
    <section
      className="w-full py-16 md:py-24 flex justify-center items-center"
      style={{
        background:
          "linear-gradient(0deg, rgba(255,255,255,0.75) 0%, #ffffff 100%), linear-gradient(90deg, #FF7700 0%, #E855C8 33%, #0450FB 66%, #A8C800 100%)",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex flex-col items-center text-center gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center gap-4 max-w-[960px]">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-slate-900 leading-[48px]">
            Integra la Red de Especialistas
          </h2>
          <p className="text-lg sm:text-xl lg:text-[24px] font-normal text-slate-800 leading-8">
            Crea tu cuenta y aplica para formar parte de LUMINUS como especialista.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {PROCESS_STEPS.map((step) => (
            <div
              key={step.num}
              className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4 min-h-[280px] justify-start"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 text-lg font-bold">
                {step.num}
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <h3 className="text-xl font-normal text-slate-900 leading-7">
                  {step.title}
                </h3>
                <p className="text-base font-normal text-slate-600 leading-6">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA & Disclaimer */}
        <div className="flex flex-col items-center gap-6 max-w-[800px] pt-4">
          <a
            href="https://app.luminuslatam.com/auth/registrarse"
            className="px-8 py-3.5 bg-black hover:bg-slate-800 text-white text-base font-normal rounded-2xl min-w-[280px] transition-colors"
          >
            Comenzar mi aplicación
          </a>
          <p className="text-sm font-normal text-slate-600 leading-relaxed">
            Para aplicar como Especialista necesitas tener una cuenta activa en LUMINUS. Cada perfil se evalúa de forma individual antes de incorporarse a la Red de Especialistas. Revisamos la formación, la experiencia y la propuesta profesional para construir una comunidad diversa, confiable y alineada con el propósito de LUMINUS.
          </p>
        </div>

      </div>
    </section>
  );
}
