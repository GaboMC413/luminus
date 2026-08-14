import Image from "next/image";
import { TripleCards } from "./TripleCards";

export function FeatureCards() {
  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex flex-col gap-12 md:gap-16">

        {/* Card 1: Comunidad */}
        <div id="comunidad" className="w-full bg-[#FF7700] rounded-3xl overflow-hidden flex flex-col lg:flex-row items-stretch">
          {/* Image */}
          <div className="w-full lg:w-1/2 min-h-[320px] lg:min-h-[500px] relative bg-amber-100">
            <Image
              src="/Photos/Grupo de personas sonriendo.png"
              alt="Comunidad LUMINUS"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Text Content */}
          <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-14 flex flex-col justify-center gap-6 text-white">
            <h2 className="text-3xl lg:text-heading-3 font-normal tracking-tight leading-tight">
              Conecta con personas en toda Latinoamérica
            </h2>
            <p className="text-body-large font-normal text-white/90 leading-relaxed">
              Una comunidad donde conocer personas con intereses similares para compartir experienciasy descubrir nuevas formas de entender la vida.
            </p>
            <div className="pt-2">
              <a
                href="https://app.luminus.lat/auth"
                className="inline-block py-3.5 px-8 text-body-medium font-normal text-white bg-black hover:bg-slate-800 rounded-2xl text-center min-w-[260px]"
              >
                Descubre la comunidad
              </a>
            </div>
          </div>
        </div>

        {/* Card 2: Especialistas */}
        <div id="especialistas" className="w-full bg-[#0450FB] rounded-3xl overflow-hidden flex flex-col-reverse lg:flex-row items-stretch">
          {/* Text Content */}
          <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-14 flex flex-col justify-center gap-6 text-white">
            <h2 className="text-3xl lg:text-heading-3 font-normal tracking-tight leading-tight">
              Explora una red de Especialistas calificados.
            </h2>
            <p className="text-body-large font-normal text-white/90 leading-relaxed">
              Descubre profesionales de distintas áreas del bienestar, conoce cómo trabajan y conecta con quienes mejor se adapten a lo que necesitas.
            </p>
            <div className="pt-2">
              <a
                href="https://app.luminus.lat/auth"
                className="inline-block py-3.5 px-8 text-body-medium font-normal text-white bg-black hover:bg-slate-800 rounded-2xl text-center min-w-[260px]"
              >
                Encuentra especialistas
              </a>
            </div>
          </div>

          {/* Image */}
          <div className="w-full lg:w-1/2 min-h-[320px] lg:min-h-[500px] relative bg-blue-900">
            <Image
              src="/Photos/Tres personas de pie sonriendo.png"
              alt="Especialistas LUMINUS"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Card 3 Row: TripleCards */}
        <TripleCards />

      </div>
    </section>
  );
}
