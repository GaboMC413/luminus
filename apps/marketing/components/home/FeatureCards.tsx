import Image from "next/image";
import { TripleCards } from "./TripleCards";

export function FeatureCards() {
  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex flex-col gap-12 md:gap-16">

        {/* Card 1: Comunidad */}
        <div id="comunidad" className="w-full bg-luminus-tangerine rounded-3xl overflow-hidden flex flex-col lg:flex-row items-stretch">
          {/* Image */}
          <div className="w-full lg:w-1/2 min-h-[320px] lg:min-h-[500px] relative bg-luminus-tangerine-light">
            <Image
              src="/Photos/Grupo de personas sonriendo.png"
              alt="Comunidad LUMINUS"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Text Content */}
          <div className="w-full lg:w-1/2 p-8 md:p-14 lg:p-16 flex flex-col justify-center gap-6 text-white">
            <h2 className="text-3xl sm:text-4xl lg:text-heading-3 font-normal tracking-tight text-white">
              Conecta con personas en toda Latinoamérica
            </h2>
            <p className="text-body-large font-normal text-white/90 leading-relaxed">
              Una comunidad donde conocer personas con intereses similares para compartir experiencias y descubrir nuevas formas de entender la vida.
            </p>
            <div className="pt-2">
              <a
                href="https://app.luminuslatam.com/auth/registrarse"
                className="flex sm:inline-flex items-center justify-center w-full sm:w-auto py-3.5 px-8 text-body-medium font-normal text-white bg-black hover:bg-slate-800 rounded-2xl text-center sm:min-w-[260px] transition-colors"
              >
                Descubre la comunidad
              </a>
            </div>
          </div>
        </div>

        {/* Card 2: Especialistas */}
        <div id="especialistas" className="w-full bg-luminus-cobalt rounded-3xl overflow-hidden flex flex-col-reverse lg:flex-row items-stretch">
          {/* Text Content */}
          <div className="w-full lg:w-1/2 p-8 md:p-14 lg:p-16 flex flex-col justify-center gap-6 text-white">
            <h2 className="text-3xl sm:text-4xl lg:text-heading-3 font-normal tracking-tight text-white">
              Explora una red de Especialistas calificados.
            </h2>
            <p className="text-body-large font-normal text-white/90 leading-relaxed">
              Descubre profesionales de distintas áreas del bienestar, conoce cómo trabajan y conecta con quienes mejor se adapten a lo que necesitas.
            </p>
            <div className="pt-2">
              <a
                href="https://app.luminuslatam.com/auth/registrarse"
                className="flex sm:inline-flex items-center justify-center w-full sm:w-auto py-3.5 px-8 text-body-medium font-normal text-white bg-black hover:bg-slate-800 rounded-2xl text-center sm:min-w-[260px] transition-colors"
              >
                Encuentra especialistas
              </a>
            </div>
          </div>

          {/* Image */}
          <div className="w-full lg:w-1/2 min-h-[320px] lg:min-h-[500px] relative bg-luminus-cobalt">
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
