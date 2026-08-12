import Image from "next/image";

export function ContactBanner() {
  return (
    <section id="contacto" className="w-full bg-black text-white overflow-hidden relative">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch min-h-[560px]">

        {/* Left 50% Column: Text & CTA */}
        <div className="w-full lg:w-1/2 px-6 md:px-10 lg:px-12 py-16 md:py-20 flex flex-col justify-center gap-6">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-white leading-[48px]">
            Conectarnos con nuevas formas de bienestar
          </h2>
          <div className="flex flex-col gap-4 text-base sm:text-lg font-normal text-slate-300 leading-relaxed">
            <p>
              Nacimos con la idea de acercar personas, especialistas, experiencias y herramientas que puedan ayudarnos a vivir con más bienestar.
            </p>
            <p>
              Sabemos el valor de la orientación, de ver desde una nueva perspectiva, de descubrir algo que todavía no conocemos. Por eso construimos una red abierta a distintas formas de bienestar, donde la tecnología ayuda a hacer esas conexiones más simples y accesibles.
            </p>
            <p>
              Queremos mantener esa cercanía con quienes forman parte, si quieres conocernos, compartir tu experiencia o escribirnos, estaremos encantados de escucharte.
            </p>
          </div>
          <div className="pt-2">
            <a
              href="mailto:hola@luminus.lat"
              className="inline-block py-3.5 px-8 text-base font-normal text-slate-950 bg-white hover:bg-slate-100 rounded-2xl text-center min-w-[240px] transition-colors"
            >
              Contactar a LUMINUS
            </a>
          </div>
        </div>

        {/* Right 50% Column: Full-Bleed Edge-to-Edge Image */}
        <div className="w-full lg:w-1/2 relative min-h-[380px] lg:min-h-[560px] self-end">
          <Image
            src="/Photos/Luminus app - buscar especialistas y comunidad.png"
            alt="LUMINUS App Overview"
            fill
            className="object-cover object-bottom-right"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

      </div>
    </section>
  );
}

