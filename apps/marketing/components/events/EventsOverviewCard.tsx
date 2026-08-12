import Image from "next/image";

export function EventsOverviewCard() {
  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10">
        
        <div className="w-full flex flex-col lg:flex-row min-h-[640px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
          
          {/* Left 50% Column: Full Bleed Photo */}
          <div className="w-full lg:w-1/2 relative min-h-[380px] lg:min-h-[640px] overflow-hidden">
            <Image
              src="/Photos/Especialista facilitando sesión grupal.png"
              alt="Encuentros y Bienestar LUMINUS"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Right 50% Column: Chartreuse #A8C800 Background */}
          <div className="w-full lg:w-1/2 bg-[#A8C800] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-center items-start gap-6">
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-white leading-[48px]">
              El bienestar no se construye desde una única mirada
            </h2>
            
            <div className="flex flex-col gap-4 text-white/95">
              <p className="text-base sm:text-lg font-normal leading-relaxed">
                Hay conocimientos que pueden abrir nuevos caminos. En lo que aprendemos de especialistas, en las experiencias de otras personas, en las preguntas que todavía no tienen una respuesta simple y en las conversaciones que nos permiten descubrir algo que antes no habíamos considerado.
              </p>
              <p className="text-base sm:text-lg font-normal text-white/90 leading-relaxed">
                LUMINUS crea estos espacios para hacer circular ese conocimiento, acercar distintas perspectivas y generar conversaciones que puedan continuar más allá de una pantalla.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
