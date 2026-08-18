import Image from "next/image";

export function SpecialistsOverviewCard() {
  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10">

        <div className="w-full flex flex-col lg:flex-row min-h-[640px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">

          {/* Left 50% Column: Warm Sand Background with Full-Bleed Mockup */}
          <div className="w-full lg:w-1/2 relative bg-luminus-tangerine-light min-h-[380px] lg:min-h-[640px] overflow-hidden">
            <Image
              src="/Photos/Luminus app - directorio y perfil especialista.png"
              alt="Directorio y Perfil Especialista LUMINUS"
              fill
              className="object-cover object-center lg:object-left-bottom"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Right 50% Column: Primary Tangerine Content Block */}
          <div className="w-full lg:w-1/2 bg-luminus-tangerine text-white p-8 md:p-14 lg:p-16 flex flex-col justify-center items-start gap-8">
            <h2 className="text-3xl sm:text-4xl lg:text-heading-4 font-normal tracking-tight text-white">
              Ser Especialista LUMINUS
            </h2>

            <div className="flex flex-col gap-4 text-white/95">
              <p className="text-xl lg:text-2xl font-normal leading-8">
                Presenta tu formación y experiencia dentro de una red que reúne profesionales de distintas disciplinas. Participa además en iniciativas que permiten acercar tu práctica a la comunidad.
              </p>
            </div>

            <div className="pt-2">
              <a
                href="https://app.luminuslatam.com/auth/registrarse"
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
