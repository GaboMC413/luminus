import Image from "next/image";

export function TripleCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">

      {/* Card 1: Espacios */}
      <div className="bg-luminus-violet rounded-3xl overflow-hidden flex flex-col justify-between min-h-[460px] sm:min-h-[500px] lg:h-[500px]">
        {/* Top Image Box */}
        <div className="relative w-full h-[200px] sm:h-[220px] lg:h-auto lg:flex-1 overflow-hidden bg-luminus-violet-light shrink-0">
          <Image
            src="/Photos/Luminus app - explorar espacios.png"
            alt="LUMINUS Espacios"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority
          />
        </div>

        {/* Bottom Content */}
        <div className="p-6 sm:p-8 flex flex-col gap-5 sm:gap-6 text-white justify-between shrink-0 flex-1 lg:flex-initial">
          <div className="flex flex-col gap-2.5 sm:gap-3">
            <h3 className="text-3xl lg:text-heading-3 font-normal tracking-tight text-white">
              Espacios
            </h3>
            <p className="text-body-large text-white/90 font-normal">
              Encuentra consultorios, clínicas y otros espacios de bienestar cerca de ti.
            </p>
          </div>
          <div>
            <span className="inline-block px-4 py-1.5 bg-white text-slate-900 font-medium text-body-xs rounded-full uppercase tracking-wider">
              PRÓXIMAMENTE
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Grupos */}
      <div className="bg-luminus-chartreuse rounded-3xl overflow-hidden flex flex-col justify-between min-h-[460px] sm:min-h-[500px] lg:h-[500px]">
        {/* Top Image Box */}
        <div className="relative w-full h-[200px] sm:h-[220px] lg:h-auto lg:flex-1 overflow-hidden bg-luminus-chartreuse-light shrink-0">
          <Image
            src="/Photos/Luminus app - explorar grupos.png"
            alt="LUMINUS Grupos"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority
          />
        </div>

        {/* Bottom Content */}
        <div className="p-6 sm:p-8 flex flex-col gap-5 sm:gap-6 text-white justify-between shrink-0 flex-1 lg:flex-initial">
          <div className="flex flex-col gap-2.5 sm:gap-3">
            <h3 className="text-3xl lg:text-heading-3 font-normal tracking-tight text-white">
              Grupos
            </h3>
            <p className="text-body-large text-white/90 font-normal">
              Forma parte de conversaciones alrededor de temas que te interesan.
            </p>
          </div>
          <div>
            <span className="inline-block px-4 py-1.5 bg-white text-slate-900 font-medium text-body-xs rounded-full uppercase tracking-wider">
              PRÓXIMAMENTE
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Faro AI */}
      <div className="bg-luminus-magenta rounded-3xl overflow-hidden flex flex-col justify-between min-h-[460px] sm:min-h-[500px] lg:h-[500px]">
        {/* Top Image Box */}
        <div className="relative w-full h-[200px] sm:h-[220px] lg:h-auto lg:flex-1 overflow-hidden bg-luminus-magenta-light shrink-0">
          <Image
            src="/Photos/Luminus app - chat con especialista.png"
            alt="LUMINUS Faro AI"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority
          />
        </div>

        {/* Bottom Content */}
        <div className="p-6 sm:p-8 flex flex-col gap-5 sm:gap-6 text-white justify-between shrink-0 flex-1 lg:flex-initial">
          <div className="flex flex-col gap-2.5 sm:gap-3">
            <h3 className="text-3xl lg:text-heading-3 font-normal tracking-tight text-white">
              Faro AI
            </h3>
            <p className="text-body-large text-white/90 font-normal">
              Orientación personalizada para descubrir el acompañamiento adecuado.
            </p>
          </div>
          <div>
            <span className="inline-block px-4 py-1.5 bg-white text-slate-900 font-medium text-body-xs rounded-full uppercase tracking-wider">
              PRÓXIMAMENTE
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
