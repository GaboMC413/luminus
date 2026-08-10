"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";

const INTERVIEWS = [
  {
    id: "G7LahF0Mq9A",
    title: "Cuando la comida se vuelve bienestar",
    description:
      "En este encuentro en vivo con Anaí Costa —licenciada en nutrición y creadora de Nutriendo Hábitos— descubrirás cómo transformar tu relación con la comida desde un enfoque integral, lejos de las dietas restrictivas y más cerca de un estilo de vida sostenible y consciente.",
    thumbnail: "https://i.ytimg.com/vi/G7LahF0Mq9A/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=G7LahF0Mq9A",
  },
  {
    id: "l6xc6mspgxk",
    title: "Respiración, postura y movimiento consciente",
    description:
      "Laura Ravaioli es terapeuta corporal con más de 25 años de experiencia, creadora y especialista del Método REEM (Reeducación Estructural por la Economía del Movimiento), una innovadora técnica que ayuda a las personas a optimizar el rendimiento de su cuerpo con el menor esfuerzo posible.",
    thumbnail: "https://i.ytimg.com/vi/l6xc6mspgxk/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=l6xc6mspgxk",
  },
  {
    id: "s7S-ojIpoqU",
    title: "Cómo fomentar el amor propio",
    description:
      "En este encuentro con Carla Lorenzo —psicóloga, actriz y comunicadora uruguaya especializada en enfoque gestáltico— vas a explorar herramientas reales de autoconocimiento y autocuidado para construir una relación más sana y compasiva con vos mismo/a.",
    thumbnail: "https://i.ytimg.com/vi/s7S-ojIpoqU/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=s7S-ojIpoqU",
  },
  {
    id: "d7yR4NBydiY",
    title: "Sanar para Ser",
    description:
      "En esta charla en vivo, el Dr. Julio Tarabini, médico y terapeuta integrador, comparte una visión de la sanación como un camino profundo que atraviesa cuerpo, mente, emociones y espíritu. Una conversación íntima y transformadora sobre cómo aliviar el dolor, reconectar con nuestro equilibrio interior y vivir con mayor autenticidad.",
    thumbnail: "https://i.ytimg.com/vi/d7yR4NBydiY/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=d7yR4NBydiY",
  },
  {
    id: "Z77iwEAMakU",
    title: "Hábitos conscientes y dirección de vida",
    description:
      "Encuentro en vivo con especialistas sobre cómo construir rutinas sostenibles, tomar decisiones alineadas con tu bienestar y cultivar hábitos que potencien tu desarrollo integral.",
    thumbnail: "https://i.ytimg.com/vi/Z77iwEAMakU/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=Z77iwEAMakU",
  },
  {
    id: "fZW8QjPkpFg",
    title: "Bienestar integral y autoconocimiento",
    description:
      "Una conversación sobre las distintas dimensiones de la salud, cómo escuchar las señales de tu cuerpo y construir espacios de calma y equilibrio en tu vida cotidiana.",
    thumbnail: "https://i.ytimg.com/vi/fZW8QjPkpFg/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=fZW8QjPkpFg",
  },
];

export function InterviewsSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = carouselRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.85;
      const targetScroll =
        direction === "left"
          ? carouselRef.current.scrollLeft - scrollAmount
          : carouselRef.current.scrollLeft + scrollAmount;
      carouselRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="entrevistas" className="w-full py-16 px-4 md:px-10 bg-slate-100 flex justify-center items-center overflow-hidden">
      <div className="max-w-[1440px] w-full flex flex-col justify-end items-center gap-10">
        
        {/* Header */}
        <div className="w-full flex flex-col justify-start items-start gap-6 text-left">
          <h2 className="w-full text-3xl sm:text-4xl lg:text-heading-3 font-normal tracking-tight text-slate-900 leading-[48px]">
            Actividades para conectar con nuevas ideas
          </h2>
          <p className="w-full text-lg sm:text-xl lg:text-[24px] font-normal text-slate-800 leading-8">
            Entrevistas y encuentros con especialistas para descubrir nuevas perspectivas sobre bienestar.
          </p>
        </div>

        {/* Carousel & Controls */}
        <div className="w-full flex flex-col justify-start items-start gap-8">
          
          {/* Carousel Track with Equal Padding */}
          <div
            ref={carouselRef}
            className="w-[calc(100%+2rem)] md:w-[calc(100%+5rem)] -mx-4 md:-mx-10 px-4 md:px-10 flex items-start gap-6 sm:gap-8 overflow-x-auto scroll-smooth scrollbar-none py-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {INTERVIEWS.map((item) => (
              <div
                key={item.id}
                className="w-[300px] sm:w-[384px] h-[400px] p-4 bg-white rounded-2xl shrink-0 flex flex-col justify-between gap-4 border border-slate-200/80 snap-start group"
              >
                {/* 16:9 Cover Image */}
                <div className="w-full h-48 relative rounded-xl overflow-hidden bg-slate-200 shrink-0">
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover object-center"
                    sizes="384px"
                    unoptimized
                  />
                </div>

                {/* Content */}
                <div className="w-full flex-1 flex flex-col justify-start items-start gap-2">
                  <h3 className="w-full text-lg font-medium text-slate-900 leading-6 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="w-full text-xs font-normal text-slate-700 leading-5 line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Link (no underline, red hover effect on text and play icon) */}
                <div className="inline-flex justify-start items-center">
                  <a
                    href={item.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-normal text-slate-900 no-underline leading-5 group-hover:text-red-600 transition-colors"
                  >
                    <span>Ver en YouTube</span>
                    <div className="w-5 h-5 rounded-full border border-slate-900 group-hover:border-red-600 flex items-center justify-center shrink-0 transition-colors">
                      <svg className="w-2.5 h-2.5 ml-0.5 fill-slate-900 group-hover:fill-red-600 transition-colors" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="w-full inline-flex justify-between items-center pt-2">
            {/* Left Arrow */}
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-3 rounded-xl flex justify-center items-center transition-all ${
                canScrollLeft
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
                  : "bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed"
              }`}
              aria-label="Previous slide"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Center Button (no underline) */}
            <a
              href="https://www.youtube.com/@luminuslatam"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-2xl flex justify-center items-center text-slate-900 text-base font-medium no-underline leading-6 transition-colors shadow-sm"
            >
              Ver todas las entrevistas
            </a>

            {/* Right Arrow */}
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-3 rounded-xl flex justify-center items-center transition-all ${
                canScrollRight
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
                  : "bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed"
              }`}
              aria-label="Next slide"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
