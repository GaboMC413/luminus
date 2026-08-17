import Image from "next/image";

export function EventsFormatsGrid() {
  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex flex-col gap-12">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4 mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-slate-900 leading-[48px]">
            Estaremos sumando otros formatos para intercambiar y encontrarnos.
          </h2>
        </div>

        {/* 3 Formats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full items-stretch">

          {/* Card 1: Especialistas en Streaming */}
          <div className="bg-[#6D28D9] rounded-3xl overflow-hidden flex flex-col">
            <div className="relative w-full h-[300px] shrink-0 overflow-hidden">
              <Image
                src="/Photos/Pareja de hosts en estudio de podcast.png"
                alt="Especialistas en Streaming"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>
            <div className="p-8 flex flex-col justify-between gap-4 text-white flex-1">
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl lg:text-3xl font-normal tracking-tight text-white">
                  Especialistas en Streaming
                </h3>
                <p className="text-base font-normal text-purple-100 leading-relaxed">
                  Charlas en vivo con especialistas y participación de la comunidad.
                </p>
              </div>
              <div>
                <span className="inline-block px-4 py-1.5 bg-white text-slate-900 font-medium text-xs rounded-full uppercase tracking-wider">
                  PRÓXIMAMENTE
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Conversatorios Virtuales */}
          <div className="bg-[#A8C800] rounded-3xl overflow-hidden flex flex-col">
            <div className="relative w-full h-[300px] shrink-0 overflow-hidden">
              <Image
                src="/Photos/Videollamada grupal.png"
                alt="Conversatorios Virtuales"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>
            <div className="p-8 flex flex-col justify-between gap-4 text-white flex-1">
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl lg:text-3xl font-normal tracking-tight text-white">
                  Conversatorios Virtuales
                </h3>
                <p className="text-base font-normal text-white/95 leading-relaxed">
                  Encuentros en grupos reducidos para profundizar en temas e intereses compartidos.
                </p>
              </div>
              <div>
                <span className="inline-block px-4 py-1.5 bg-white text-slate-900 font-medium text-xs rounded-full uppercase tracking-wider">
                  PRÓXIMAMENTE
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Experiencias Locales */}
          <div className="bg-[#E855C8] rounded-3xl overflow-hidden flex flex-col">
            <div className="relative w-full h-[300px] shrink-0 overflow-hidden">
              <Image
                src="/Photos/Grupo conversando en terraza.png"
                alt="Experiencias Locales"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>
            <div className="p-8 flex flex-col justify-between gap-4 text-white flex-1">
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl lg:text-3xl font-normal tracking-tight text-white">
                  Experiencias Locales
                </h3>
                <p className="text-base font-normal text-pink-100 leading-relaxed">
                  Actividades presenciales para participar y conectar desde distintas ciudades.
                </p>
              </div>
              <div>
                <span className="inline-block px-4 py-1.5 bg-white text-slate-900 font-medium text-xs rounded-full uppercase tracking-wider">
                  PRÓXIMAMENTE
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
