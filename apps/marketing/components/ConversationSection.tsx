import Image from "next/image";

export function ConversationSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-slate-50">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10">
        <div className="flex flex-col lg:flex-row items-stretch gap-6 h-auto lg:h-[560px]">
          
          {/* Left Photo */}
          <div className="w-full lg:w-1/4 h-[300px] lg:h-full relative rounded-3xl overflow-hidden shrink-0 bg-slate-200">
            <Image
              src="/Home/Mujer sonriendo en videollamada.png"
              alt="Mujer sonriendo en videollamada"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 25vw"
            />
          </div>

          {/* Center Blue Card */}
          <div className="w-full lg:w-2/4 bg-[#0450FB] text-white rounded-3xl p-8 md:p-12 lg:p-14 flex flex-col justify-center gap-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Comienza con una conversación
            </h2>
            <p className="text-xl md:text-2xl font-normal leading-relaxed text-blue-100">
              Solicita sesiones introductorias con Especialistas que te interesen y conoce sus enfoques a través de una conversación.
            </p>
            <p className="text-base md:text-lg leading-relaxed text-white/90">
              Un espacio breve para contar qué estás buscando, resolver dudas y comenzar a conocerse.
            </p>
            <div className="pt-2">
              <a
                href="https://app.luminus.lat/auth"
                className="inline-block py-3.5 px-8 text-base font-semibold text-white bg-black hover:bg-slate-800 rounded-2xl text-center min-w-[260px]"
              >
                Solicitar una sesión
              </a>
            </div>
          </div>

          {/* Right Photo */}
          <div className="w-full lg:w-1/4 h-[300px] lg:h-full relative rounded-3xl overflow-hidden shrink-0 bg-slate-200">
            <Image
              src="/Home/Mujer mirando celular en sofá.png"
              alt="Mujer mirando celular en sofá"
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
