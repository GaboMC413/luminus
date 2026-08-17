import Image from "next/image";
import Link from "next/link";

export function EventsVoicesCallout() {
  return (
    <section className="w-full bg-[#0450FB] text-white overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch min-h-[640px]">
        
        {/* Left 50% Column: Full Bleed Photo */}
        <div className="w-full lg:w-1/2 relative min-h-[380px] lg:min-h-[640px]">
          <Image
            src="/Photos/Mujer en entrevista grabada.png"
            alt="Comparte tu experiencia en LUMINUS"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Right 50% Column: Cobalt Blue Content Block */}
        <div className="w-full lg:w-1/2 p-8 md:p-14 lg:p-16 flex flex-col justify-center items-start gap-6 bg-[#0450FB]">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-white leading-[48px]">
            Comparte tu experiencia en LUMINUS
          </h2>
          
          <p className="text-lg sm:text-xl font-normal text-blue-100 leading-relaxed">
            Si tienes conocimientos, experiencia profesional o una perspectiva que pueda aportar a la comunidad, puedes proponerte para una próxima entrevista o recomendarnos a alguien.
          </p>

          <div className="pt-2">
            <Link
              href="/contacto"
              className="inline-block py-3.5 px-8 text-base font-normal text-white bg-black hover:bg-slate-900 rounded-2xl text-center min-w-[220px] transition-colors"
            >
              Quiero participar
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
