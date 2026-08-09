import Image from "next/image";

export function TripleCards() {
  return (
    <section className="w-full py-6 md:py-10 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: Espacios */}
          <div className="bg-[#6D28D9] rounded-3xl overflow-hidden flex flex-col justify-between shadow-md hover:shadow-xl transition-shadow group">
            {/* Top Illustration / App Box */}
            <div className="w-full h-56 md:h-64 bg-[#d5c9e8] relative overflow-hidden flex items-center justify-center p-4">
              <div className="relative w-[180px] h-[260px] bg-slate-900 rounded-[24px] border-4 border-slate-800 shadow-xl overflow-hidden transform translate-y-6 group-hover:translate-y-4 transition-transform duration-500">
                <Image
                  src="/Home/Luminus app - explorar espacios.png"
                  alt="Espacios LUMINUS App"
                  fill
                  className="object-cover object-top"
                  sizes="200px"
                />
              </div>
            </div>

            {/* Bottom Content Box */}
            <div className="p-8 flex flex-col gap-6 text-white justify-between flex-1">
              <div className="flex flex-col gap-3">
                <h3 className="text-3xl font-bold tracking-tight">
                  Espacios
                </h3>
                <p className="text-base md:text-lg text-purple-100 leading-relaxed">
                  Encuentra consultorios, clínicas, centros, estudios y otros espacios de bienestar cerca de ti.
                </p>
              </div>
              <div>
                <span className="inline-block px-4 py-1.5 bg-white text-slate-900 font-semibold text-xs rounded-full uppercase tracking-wider shadow-sm">
                  PRÓXIMAMENTE
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Grupos */}
          <div className="bg-[#A8C800] rounded-3xl overflow-hidden flex flex-col justify-between shadow-md hover:shadow-xl transition-shadow group">
            {/* Top Illustration / App Box */}
            <div className="w-full h-56 md:h-64 bg-[#e7eec4] relative overflow-hidden flex items-center justify-center p-4">
              <div className="relative w-[180px] h-[260px] bg-slate-900 rounded-[24px] border-4 border-slate-800 shadow-xl overflow-hidden transform translate-y-6 group-hover:translate-y-4 transition-transform duration-500">
                <Image
                  src="/Home/Luminus app - explorar grupos.png"
                  alt="Grupos LUMINUS App"
                  fill
                  className="object-cover object-top"
                  sizes="200px"
                />
              </div>
            </div>

            {/* Bottom Content Box */}
            <div className="p-8 flex flex-col gap-6 text-slate-950 justify-between flex-1">
              <div className="flex flex-col gap-3">
                <h3 className="text-3xl font-bold tracking-tight">
                  Grupos
                </h3>
                <p className="text-base md:text-lg text-slate-900 leading-relaxed font-normal">
                  Forma parte de grupos de conversación alrededor de temas, intereses y experiencias que te importan.
                </p>
              </div>
              <div>
                <span className="inline-block px-4 py-1.5 bg-white text-slate-900 font-semibold text-xs rounded-full uppercase tracking-wider shadow-sm">
                  PRÓXIMAMENTE
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Faro AI */}
          <div className="bg-[#E855C8] rounded-3xl overflow-hidden flex flex-col justify-between shadow-md hover:shadow-xl transition-shadow group">
            {/* Top Illustration Box */}
            <div className="w-full h-56 md:h-64 bg-[#e9c9e2] relative overflow-hidden flex items-center justify-center p-6">
              <div className="w-32 h-32 rounded-full bg-[#E855C8]/20 blur-xl absolute" />
              <div className="relative z-10 text-center flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-2xl bg-white/90 shadow-lg flex items-center justify-center text-[#E855C8]">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom Content Box */}
            <div className="p-8 flex flex-col gap-6 text-white justify-between flex-1">
              <div className="flex flex-col gap-3">
                <h3 className="text-3xl font-bold tracking-tight">
                  Faro AI
                </h3>
                <p className="text-base md:text-lg text-pink-100 leading-relaxed">
                  Encuentra orientación personalizada para descubrir qué tipo de acompañamiento puede ser adecuado para ti.
                </p>
              </div>
              <div>
                <span className="inline-block px-4 py-1.5 bg-white text-slate-900 font-semibold text-xs rounded-full uppercase tracking-wider shadow-sm">
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
