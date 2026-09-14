import Image from "next/image";

export function SpecialistsOverviewCard() {
  return (
    <section className="w-full pt-16 md:pt-24 pb-8 md:pb-12 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10">

        <div className="w-full flex flex-col lg:flex-row min-h-[640px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">

          {/* Left 50% Column: Warm Sand Background with Full-Bleed Mockup */}
          <div className="w-full lg:w-1/2 relative bg-luminus-tangerine-light min-h-[380px] lg:min-h-[640px] overflow-hidden">
            <Image
              src="/Photos/Luminus app - directorio y perfil especialista.png"
              alt="Directorio y Perfil Especialista LUMINUS"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Right 50% Column: Primary Tangerine Content Block */}
          <div className="w-full lg:w-1/2 bg-luminus-tangerine text-white p-8 md:p-12 lg:p-14 flex flex-col justify-center items-start gap-6">
            <h2 className="text-3xl sm:text-4xl lg:text-heading-4 font-normal tracking-tight text-white leading-tight">
              Ser parte de la red suma valor a tu propuesta profesional
            </h2>

            <p className="text-lg font-normal text-white leading-snug">
              Sumarte a LUMINUS te permite mostrar tu trabajo dentro de una plataforma dedicada al bienestar, sin perder tu identidad ni la independencia con la que llevas adelante tu práctica.
            </p>

            <p className="text-lg font-normal text-white leading-snug">
              Estar en la red hace que más personas puedan encontrarte, conocer tu enfoque y entender mejor lo que ofreces. Eso se traduce en más visibilidad, nuevas consultas y más oportunidades para hacer crecer tu actividad profesional.
            </p>

            <div className="pt-2 w-full sm:w-auto">
              <a
                href="https://app.luminuslatam.com/especialistas/onboarding"
                className="flex sm:inline-flex items-center justify-center px-8 py-3.5 bg-black hover:bg-slate-900 text-white text-base font-normal rounded-2xl text-center w-full sm:w-auto sm:min-w-[240px] transition-colors"
              >
                Aplicar como Especialista
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
