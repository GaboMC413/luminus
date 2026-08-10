import Image from "next/image";

export function ContactHero() {
  return (
    <section className="w-full bg-black text-white overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch min-h-[640px]">

        {/* Left 50% Column */}
        <div className="w-full lg:w-1/2 px-8 sm:px-12 lg:px-20 py-16 lg:py-24 flex flex-col justify-center gap-6 text-left bg-black">
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-normal tracking-tight text-white leading-[1.12] max-w-[560px]">
            Hablemos
          </h1>
          <p className="text-xl lg:text-[22px] font-normal text-slate-300 leading-8 max-w-[520px]">
            Si tienes alguna pregunta, propuesta o simplemente quieres conocer más sobre LUMINUS, escríbenos. Estaremos encantados de escucharte.
          </p>
          <div className="flex flex-col gap-2 text-sm text-slate-400 pt-2">
            <span>✉️ <a href="mailto:hola@luminus.lat" className="text-white hover:underline transition-colors">hola@luminus.lat</a></span>
          </div>
        </div>

        {/* Right 50% Column: Full Bleed Photo */}
        <div className="w-full lg:w-1/2 relative min-h-[360px] lg:min-h-[640px]">
          <Image
            src="/Photos/Mujer sonriendo en videollamada.png"
            alt="Contacta a LUMINUS"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

      </div>
    </section>
  );
}
