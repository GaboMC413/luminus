import Image from "next/image";

export function EventsVoicesCallout() {
  return (
    <section className="w-full bg-[#0450FB] text-white overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch min-h-[640px]">
        
        {/* Left 50% Column: Full Bleed Photo */}
        <div className="w-full lg:w-1/2 relative min-h-[380px] lg:min-h-[640px]">
          <Image
            src="/Photos/Mujer en entrevista grabada.png"
            alt="Queremos conocer nuevas voces LUMINUS"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Right 50% Column: Cobalt Blue Content Block */}
        <div className="w-full lg:w-1/2 p-8 md:p-14 lg:p-16 flex flex-col justify-center items-start gap-6 bg-[#0450FB]">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-white leading-[48px]">
            Queremos conocer nuevas voces
          </h2>
          
          <p className="text-xl lg:text-2xl font-normal text-blue-100 leading-8">
            Buscamos especialistas con conocimientos o experiencias que puedan aportar algo valioso a la comunidad.
          </p>

          <div className="flex flex-col gap-4 text-base font-normal text-white/90 leading-relaxed">
            <p>
              Nos interesan miradas construidas desde la práctica, la investigación, la experiencia personal o recorridos capaces de abrir nuevas preguntas y acercar otras formas de entender el bienestar.
            </p>
            <p>
              Si tienes algo que te gustaría compartir, o conoces a alguien que debería formar parte de una próxima entrevista, puedes enviarnos tu propuesta.
            </p>
          </div>

          <div className="pt-2">
            <a
              href="mailto:hola@luminus.lat"
              className="inline-block py-3.5 px-8 text-base font-normal text-white bg-black hover:bg-slate-900 rounded-2xl text-center min-w-[220px] transition-colors"
            >
              Quiero participar
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
