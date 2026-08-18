import Image from "next/image";
import Link from "next/link";

export function ContactBanner() {
  return (
    <section id="contacto" className="w-full bg-black text-white overflow-hidden relative">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch min-h-[620px]">

        {/* Left 50% Column: Text & CTA */}
        <div className="w-full lg:w-1/2 p-8 md:p-14 lg:p-16 flex flex-col justify-center gap-6">
          <h2 className="text-3xl sm:text-4xl lg:text-heading-3 font-normal tracking-tight text-white">
            Hacer el bienestar más cercano
          </h2>
          <div className="flex flex-col gap-4 text-body-large font-normal text-slate-300 leading-relaxed">
            <p>
              Nacimos con el propósito de hacer el bienestar más cercano, simple y accesible. Creamos una red abierta para descubrir profesionales, herramientas y nuevas perspectivas que te ayuden a vivir mejor. Si quieres conocernos, compartir tu propuesta o hacernos alguna pregunta, escríbenos.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/contacto"
              className="flex sm:inline-flex items-center justify-center w-full sm:w-auto py-3.5 px-8 text-base font-normal text-slate-950 bg-white hover:bg-slate-100 rounded-2xl text-center sm:min-w-[240px] transition-colors"
            >
              Contactar a LUMINUS
            </Link>
          </div>
        </div>

        {/* Right 50% Column: Full-Bleed Edge-to-Edge Image */}
        <div className="w-full lg:w-1/2 relative min-h-[380px] lg:min-h-[560px] self-end">
          <Image
            src="/Photos/Luminus app - buscar especialistas y comunidad.png"
            alt="LUMINUS App Overview"
            fill
            className="object-cover object-center lg:object-bottom-right"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

      </div>
    </section>
  );
}
