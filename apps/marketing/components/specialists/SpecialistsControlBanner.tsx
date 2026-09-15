import Image from "next/image";
import Link from "next/link";

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

          {/* Center Cobalt Blue Card (50% Width) */}
          <div className="w-full lg:w-2/4 bg-luminus-cobalt text-white rounded-3xl p-8 md:p-12 lg:p-14 flex flex-col justify-center items-center text-center gap-6">
            <h2 className="text-3xl sm:text-4xl lg:text-heading-3 font-normal tracking-tight text-white text-center">
              Trabajas con la misma libertad de siempre
            </h2>
            <div className="flex flex-col gap-4 text-center max-w-[580px]">
              <p className="text-base sm:text-lg font-normal text-blue-100 leading-relaxed">
                Te facilitamos el contacto con nuevas personas, pero tú mantienes el control de tu actividad. Defines tus servicios, horarios, precios y cómo continuar cada vínculo profesional.
              </p>
              <p className="text-base sm:text-lg font-normal text-blue-100 leading-relaxed">
                No intervenimos en tu forma de trabajar, en los acuerdos que establezcas ni en la relación con cada persona.{" "}
                <strong className="font-semibold">
                  Tampoco cobramos comisiones por las consultas o servicios que surjan a través de la plataforma.
                </strong>
              </p>
            </div>
            <div className="pt-2 w-full flex justify-center">
              <Link
                href="/legal/condiciones-especialistas"
                className="flex sm:inline-flex items-center justify-center py-3.5 px-8 text-base font-normal text-white bg-black hover:bg-slate-800 rounded-2xl text-center w-full sm:w-auto sm:min-w-[260px] transition-colors"
              >
                Ver condiciones para especialistas
              </Link>
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
