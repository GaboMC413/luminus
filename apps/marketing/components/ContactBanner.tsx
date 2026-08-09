import Image from "next/image";

export function ContactBanner() {
  return (
    <section id="contacto" className="w-full bg-black text-white py-16 md:py-24 overflow-hidden relative border-t border-black">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* Left Column: Text & CTA */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Conectarnos con nuevas formas de bienestar
          </h2>
          <div className="flex flex-col gap-4 text-base md:text-lg text-slate-300 leading-relaxed font-normal">
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
              className="inline-block py-3.5 px-8 text-base font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded-2xl shadow-md transition-all text-center min-w-[260px]"
            >
              Contactar a LUMINUS
            </a>
          </div>
        </div>

        {/* Right Column: Mobile App Preview Mockup */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative min-h-[300px] md:min-h-[420px]">
          <div className="relative w-[220px] sm:w-[260px] h-[440px] sm:h-[500px] bg-slate-900 rounded-[36px] border-4 border-slate-800 shadow-2xl overflow-hidden transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <Image
              src="/Home/Luminus app - buscar especialistas y comunidad.png"
              alt="LUMINUS App Contact Preview"
              fill
              className="object-cover object-top"
              sizes="280px"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
