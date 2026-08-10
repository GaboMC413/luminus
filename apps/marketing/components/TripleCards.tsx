import Image from "next/image";

export function TripleCards() {
  return (
    <section className="w-full pt-6 md:pt-8 pb-16 md:pb-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: Espacios */}
          <div className="bg-[#6D28D9] rounded-3xl overflow-hidden flex flex-col justify-between h-[500px]">
            {/* Top Relative Flexible Image Box */}
            <div className="relative flex-1 w-full min-h-[220px] overflow-hidden bg-[#d5c9e8]">
              <Image
                src="/Photos/Luminus app - explorar espacios.png"
                alt="LUMINUS Espacios"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>

            {/* Bottom Content */}
            <div className="p-8 flex flex-col gap-6 text-white justify-between shrink-0">
              <div className="flex flex-col gap-3">
                <h3 className="text-3xl lg:text-heading-3 font-normal tracking-tight text-white">
                  Espacios
                </h3>
                <p className="text-body-large text-purple-100 font-normal">
                  Encuentra consultorios, clínicas, centros, estudios y otros espacios de bienestar cerca de ti.
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
          <div className="bg-[#A8C800] rounded-3xl overflow-hidden flex flex-col justify-between h-[500px]">
            {/* Top Relative Flexible Image Box */}
            <div className="relative flex-1 w-full min-h-[220px] overflow-hidden bg-[#e7eec4]">
              <Image
                src="/Photos/Luminus app - explorar grupos.png"
                alt="LUMINUS Grupos"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>

            {/* Bottom Content (Text in White) */}
            <div className="p-8 flex flex-col gap-6 text-white justify-between shrink-0">
              <div className="flex flex-col gap-3">
                <h3 className="text-3xl lg:text-heading-3 font-normal tracking-tight text-white">
                  Grupos
                </h3>
                <p className="text-body-large text-white/90 font-normal">
                  Forma parte de grupos de conversación alrededor de temas, intereses y experiencias que te importan.
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
          <div className="bg-[#E855C8] rounded-3xl overflow-hidden flex flex-col justify-between h-[500px]">
            {/* Top Relative Flexible Image Box */}
            <div className="relative flex-1 w-full min-h-[220px] overflow-hidden bg-[#e9c9e2]">
              <Image
                src="/Photos/Luminus app - chat con especialista.png"
                alt="LUMINUS Faro AI"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>

            {/* Bottom Content */}
            <div className="p-8 flex flex-col gap-6 text-white justify-between shrink-0">
              <div className="flex flex-col gap-3">
                <h3 className="text-3xl lg:text-heading-3 font-normal tracking-tight text-white">
                  Faro AI
                </h3>
                <p className="text-body-large text-pink-100 font-normal">
                  Encuentra orientación personalizada para descubrir qué tipo de acompañamiento puede ser adecuado para ti.
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
      </div>
    </section>
  );
}
