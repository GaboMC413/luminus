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
              alt="Distintas perspectivas para comprender mejor LUMINUS"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Right 50% Column: Chartreuse #A8C800 Background */}
          <div className="w-full lg:w-1/2 bg-[#A8C800] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-center items-start gap-6">
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-white leading-[48px]">
              Conversaciones que vale la pena abrir
            </h2>

            <p className="text-lg sm:text-xl font-normal leading-relaxed text-white/95">
              Hay conocimientos y experiencias que pueden ayudarnos a comprender mejor lo que vivimos, pero que no siempre encuentran un lugar para ser compartidos.
            </p>
            <p className="text-lg sm:text-xl font-normal leading-relaxed text-white/95">
              En LUMINUS creamos entrevistas y encuentros para acercarlos, ponerlos en conversación y generar nuevas formas de pensar, aprender y relacionarnos con nuestro bienestar.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
