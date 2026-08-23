import Image from "next/image";

export function EventsClosingCta() {
  return (
    <section className="w-full bg-black text-white overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch min-h-[640px]">
        
        {/* Left 50% Column */}
        <div className="w-full lg:w-1/2 px-8 sm:px-12 lg:px-16 py-12 lg:py-20 flex flex-col justify-center items-start gap-6 text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-white leading-[48px]">
            Participa de lo que viene
          </h2>
          <p className="text-base sm:text-lg font-normal text-slate-300 leading-relaxed max-w-[560px]">
            Crea tu cuenta en LUMINUS para conocer próximas fechas, inscribirte y recibir nuevas convocatorias.
          </p>
          <div className="pt-2 w-full sm:w-auto">
            <a
              href="https://app.luminuslatam.com/auth/registrarse"
              className="flex sm:inline-flex items-center justify-center py-3.5 px-8 text-base font-normal text-slate-950 bg-white hover:bg-slate-100 rounded-2xl text-center w-full sm:w-auto sm:min-w-[240px] transition-colors"
            >
              Registrarme en LUMINUS
            </a>
          </div>
        </div>

        {/* Right 50% Column - Full Edge-to-Edge Fill */}
        <div className="w-full lg:w-1/2 min-h-[380px] lg:min-h-[640px] relative overflow-hidden h-full">
          <Image
            src="/Photos/Luminus app - entrevistas en vivo.png"
            alt="Participa de lo que viene LUMINUS"
            fill
            className="object-cover object-left-top"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

      </div>
    </section>
  );
}
