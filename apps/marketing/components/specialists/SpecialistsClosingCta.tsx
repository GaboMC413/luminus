import Image from "next/image";
import Link from "next/link";

export function SpecialistsClosingCta() {
  return (
    <section className="w-full bg-black text-white overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch min-h-[640px]">
        
        {/* Left 50% Column */}
        <div className="w-full lg:w-1/2 p-8 md:p-14 lg:p-16 flex flex-col justify-center gap-6 text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-heading-3 font-normal tracking-tight text-white">
            Forma parte de una red profesional de bienestar
          </h2>
          <div className="flex flex-col gap-3 text-body-large font-normal text-slate-300 leading-relaxed">
            <p>
              LUMINUS reúne profesionales de distintas áreas y enfoques para ampliar las formas de acompañar el bienestar en Latinoamérica. Si quieres integrar la Red, puedes comenzar tu aplicación o conversar con nuestro equipo.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <a
              href="https://app.luminuslatam.com/auth/registrarse"
              className="flex sm:inline-flex items-center justify-center py-3.5 px-8 text-base font-normal text-slate-950 bg-white hover:bg-slate-100 rounded-2xl text-center w-full sm:w-auto sm:min-w-[240px] transition-colors"
            >
              Aplicar como especialista
            </a>
            <Link
              href="/contacto"
              className="text-base font-normal text-white hover:text-slate-300 underline leading-6 transition-colors"
            >
              Consultar sobre la Red
            </Link>
          </div>
        </div>

        {/* Right 50% Column - Full Edge-to-Edge Image Fill */}
        <div className="w-full lg:w-1/2 min-h-[380px] lg:min-h-[640px] relative overflow-hidden h-full">
          <Image
            src="/Photos/Luminus app - perfiles de Camila y Martín.png"
            alt="Forma parte de una red profesional de bienestar LUMINUS"
            fill
            className="object-cover object-left-top"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

      </div>
    </section>
  );
}
