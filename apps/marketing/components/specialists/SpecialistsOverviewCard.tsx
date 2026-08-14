import Image from "next/image";

export function SpecialistsOverviewCard() {
  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10">
        
        <div className="w-full flex flex-col lg:flex-row min-h-[640px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
          
          {/* Left 50% Column: Warm Sand Background (#eed7c4) with Full-Bleed Mockup */}
          <div className="w-full lg:w-1/2 relative bg-[#eed7c4] min-h-[380px] lg:min-h-[640px] overflow-hidden">



            <Image
              src="/Photos/Luminus app - directorio y perfil especialista.png"
              alt="Directorio y Perfil Especialista LUMINUS"
              fill
              className="object-cover object-left-bottom"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Right 50% Column: Primary Tangerine #FF7700 Content Block */}
          <div className="w-full lg:w-1/2 bg-[#FF7700] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-center items-start gap-8">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-white leading-[50px]">
              Ser Especialista LUMINUS
            </h2>
            
            <div className="flex flex-col gap-4 text-white/95">
              <p className="text-xl lg:text-2xl font-normal leading-8">
                Forma parte de una red profesional creada para reunir distintas disciplinas del bienestar en un mismo espacio.
              </p>
              <p className="text-base font-normal text-white/90 leading-6 pt-2">
                LUMINUS te permite construir una presencia profesional más completa, acercar tu trabajo a nuevas personas y participar activamente de una comunidad que comparte intereses, experiencias y conocimiento.
              </p>
            </div>

            <div className="pt-2">
              <a
                href="https://app.luminuslatam.com/auth/registrarse"
                className="inline-block px-8 py-3.5 bg-black hover:bg-slate-900 text-white text-base font-normal rounded-2xl text-center min-w-[240px] transition-colors"
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
