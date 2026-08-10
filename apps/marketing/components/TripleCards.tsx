export function TripleCards() {
  return (
    <section className="w-full py-6 md:py-10 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: Espacios */}
          <div className="bg-[#6D28D9] rounded-3xl overflow-hidden flex flex-col justify-between">
            {/* Top Pattern Header */}
            <div className="w-full h-56 md:h-64 bg-[#d5c9e8] relative flex items-center justify-center p-6">
              <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-[#6D28D9]">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="p-8 flex flex-col gap-6 text-white justify-between flex-1">
              <div className="flex flex-col gap-3">
                <h3 className="text-3xl lg:text-heading-3 font-normal tracking-tight">
                  Espacios
                </h3>
                <p className="text-body-large text-purple-100 font-normal">
                  Encuentra consultorios, clínicas, centros, estudios y otros espacios de bienestar cerca de ti.
                </p>
              </div>
              <div>
                <span className="inline-block px-4 py-1 bg-white text-slate-900 font-medium text-body-xs rounded-full uppercase tracking-wider">
                  PRÓXIMAMENTE
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Grupos */}
          <div className="bg-[#A8C800] rounded-3xl overflow-hidden flex flex-col justify-between">
            {/* Top Pattern Header */}
            <div className="w-full h-56 md:h-64 bg-[#e7eec4] relative flex items-center justify-center p-6">
              <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-[#7A8500]">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="p-8 flex flex-col gap-6 text-slate-950 justify-between flex-1">
              <div className="flex flex-col gap-3">
                <h3 className="text-3xl lg:text-heading-3 font-normal tracking-tight">
                  Grupos
                </h3>
                <p className="text-body-large text-slate-900 font-normal">
                  Forma parte de grupos de conversación alrededor de temas, intereses y experiencias que te importan.
                </p>
              </div>
              <div>
                <span className="inline-block px-4 py-1 bg-white text-slate-900 font-medium text-body-xs rounded-full uppercase tracking-wider">
                  PRÓXIMAMENTE
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Faro AI */}
          <div className="bg-[#E855C8] rounded-3xl overflow-hidden flex flex-col justify-between">
            {/* Top Pattern Header */}
            <div className="w-full h-56 md:h-64 bg-[#e9c9e2] relative flex items-center justify-center p-6">
              <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-[#E855C8]">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="p-8 flex flex-col gap-6 text-white justify-between flex-1">
              <div className="flex flex-col gap-3">
                <h3 className="text-3xl lg:text-heading-3 font-normal tracking-tight">
                  Faro AI
                </h3>
                <p className="text-body-large text-pink-100 font-normal">
                  Encuentra orientación personalizada para descubrir qué tipo de acompañamiento puede ser adecuado para ti.
                </p>
              </div>
              <div>
                <span className="inline-block px-4 py-1 bg-white text-slate-900 font-medium text-body-xs rounded-full uppercase tracking-wider">
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
