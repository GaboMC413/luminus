"use client";

import Image from "next/image";

const INTERVIEWS = [
  {
    title: "Cuando la comida se vuelve bienestar",
    description:
      "En este encuentro en vivo con Anaí Costa —licenciada en nutrición y creadora de Nutriendo Hábitos— descubrirás cómo transformar tu relación con la comida desde un enfoque integral, lejos de las dietas restrictivas y más cerca de un estilo de vida sostenible y consciente.",
    image: "/Photos/Grupo de personas sonriendo.png",
    youtubeUrl: "https://www.youtube.com/@luminuslatam",
  },
  {
    title: "Respiración, postura y movimiento consciente",
    description:
      "Laura Ravaioli es terapeuta corporal con más de 25 años de experiencia, creadora y especialista del Método REEM (Reeducación Estructural por la Economía del Movimiento), una innovadora técnica que ayuda a optimizar el rendimiento del cuerpo con el menor esfuerzo posible.",
    image: "/Photos/Tres personas de pie sonriendo.png",
    youtubeUrl: "https://www.youtube.com/@luminuslatam",
  },
  {
    title: "Cómo fomentar el amor propio",
    description:
      "En este encuentro con Carla Lorenzo —psicóloga, actriz y comunicadora uruguaya especializada en enfoque gestáltico— vas a explorar herramientas reales de autoconocimiento y autocuidado para construir una relación más sana y compasiva con vos mismo/a.",
    image: "/Photos/Mujer sonriendo en videollamada.png",
    youtubeUrl: "https://www.youtube.com/@luminuslatam",
  },
  {
    title: "Sanar para Ser",
    description:
      "En esta charla en vivo, el Dr. Julio Tarabini, médico y terapeuta integrador, comparte una visión de la sanación como un camino profundo que atraviesa cuerpo, mente, emociones y espíritu. Una conversación íntima sobre cómo aliviar el dolor y vivir con mayor autenticidad.",
    image: "/Photos/Mujer mirando celular en sofá.png",
    youtubeUrl: "https://www.youtube.com/@luminuslatam",
  },
];

export function InterviewsSection() {
  return (
    <section id="entrevistas" className="w-full py-16 md:py-24 bg-slate-100">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex flex-col gap-12">
        
        {/* Header */}
        <div className="flex flex-col gap-4 text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-heading-3 font-normal tracking-tight text-slate-900">
            Actividades para conectar con nuevas ideas
          </h2>
          <p className="text-lg sm:text-heading-6 font-normal text-slate-700 max-w-[840px]">
            Entrevistas y encuentros con especialistas para descubrir nuevas perspectivas sobre bienestar.
          </p>
        </div>

        {/* Interviews Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INTERVIEWS.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-5 flex flex-col justify-between gap-5 border border-slate-200 h-[420px]"
            >
              <div className="flex flex-col gap-4">
                {/* Thumbnail */}
                <div className="w-full h-44 relative rounded-2xl overflow-hidden bg-slate-200 shrink-0">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-900">
                      <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-body-large font-normal text-slate-900 leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-body-xs font-normal text-slate-600 leading-relaxed line-clamp-4">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Link */}
              <a
                href={item.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-body-small font-normal text-slate-900 hover:text-red-600 transition-colors pt-2 border-t border-slate-100"
              >
                <span>Ver en YouTube</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-center pt-4">
          <a
            href="https://www.youtube.com/@luminuslatam"
            target="_blank"
            rel="noopener noreferrer"
            className="py-3.5 px-10 text-body-medium font-normal text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-2xl text-center min-w-[280px]"
          >
            Ver todas las entrevistas
          </a>
        </div>

      </div>
    </section>
  );
}
