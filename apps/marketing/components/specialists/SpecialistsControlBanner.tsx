import Image from "next/image";

export function SpecialistsControlBanner() {
  return (
    <section className="w-full py-16 md:py-24 bg-slate-50">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10">
        <div className="flex flex-col lg:flex-row items-stretch gap-6 min-h-[640px] lg:h-[640px]">

          
          {/* Left Photo (25% Width) */}
          <div className="w-full lg:w-1/4 h-[300px] lg:h-full relative rounded-3xl overflow-hidden shrink-0 bg-slate-200">
            <Image
              src="/Photos/Mujer escribiendo frente a laptop.png"
              alt="Mujer escribiendo frente a laptop"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 25vw"
            />
          </div>

          {/* Center Cobalt Blue Card (50% Width #0450FB) */}
          <div className="w-full lg:w-2/4 bg-[#0450FB] text-white rounded-3xl p-8 md:p-12 lg:p-14 flex flex-col justify-center gap-6">
            <h2 className="text-3xl lg:text-[40px] font-normal tracking-tight text-white leading-[48px]">
              Tú mantienes el control sobre tu actividad profesional.
            </h2>
            <p className="text-xl lg:text-2xl font-normal text-blue-100 leading-8">
              Defines tus servicios, metodología, precios, condiciones y la forma en que decides trabajar con cada persona.
            </p>
            <p className="text-base font-normal text-white/90 leading-6">
              LUMINUS funciona como un espacio de visibilidad, descubrimiento y conexión. Los servicios o acuerdos profesionales que continúen después de un primer contacto se establecen directamente entre las partes.
            </p>
            <div className="pt-2">
              <a
                href="#faq"
                className="inline-block py-3.5 px-8 text-base font-normal text-white bg-black hover:bg-slate-800 rounded-2xl text-center min-w-[260px] transition-colors"
              >
                Ver Condiciones para Especialistas
              </a>
            </div>
          </div>

          {/* Right Photo (25% Width) */}
          <div className="w-full lg:w-1/4 h-[300px] lg:h-full relative rounded-3xl overflow-hidden shrink-0 bg-slate-200">
            <Image
              src="/Photos/Mujer en sesión de terapia.png"
              alt="Mujer en sesión de terapia"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 25vw"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
