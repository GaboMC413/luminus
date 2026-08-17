"use client";

import { useRef, useState, useEffect } from "react";

const DISCIPLINES = [
  {
    title: "Crecimiento Personal",
    color: "#F0A500",
    description: "Coaching, mentoría, liderazgo, orientación y otros procesos de desarrollo personal y profesional.",
    icon: "/Icons/sunny_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Bienestar Emocional",
    color: "#E855C8",
    description: "Psicología, psicoterapia y enfoques orientados a comprender, expresar y gestionar las emociones.",
    icon: "/Icons/mood_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Salud Integral",
    color: "#0450FB",
    description: "Medicina, fisioterapia y otras disciplinas vinculadas a la prevención, el cuidado y la salud integral.",
    icon: "/Icons/ecg_heart_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Movimiento Físico",
    color: "#E63946",
    description: "Entrenamiento, movilidad y prácticas corporales orientadas a desarrollar y cuidar el cuerpo.",
    icon: "/Icons/exercise_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Nutrición",
    color: "#A8C800",
    description: "Nutrición y acompañamiento profesional relacionado con la alimentación y los hábitos.",
    icon: "/Icons/nutrition_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Espiritualidad",
    color: "#6D28D9",
    description: "Meditación, mindfulness y prácticas orientadas al autoconocimiento, la conciencia y el desarrollo interior.",
    icon: "/Icons/self_improvement_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Vínculos y relaciones",
    color: "#FF7700",
    description: "Acompañamiento individual, de pareja o familiar en temas relacionados con los vínculos y las relaciones.",
    icon: "/Icons/join_inner_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Terapias Alternativas",
    color: "#0FA87A",
    description: "Prácticas complementarias que incorporan diferentes enfoques para acompañar el bienestar.",
    icon: "/Icons/spa_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
];

export function SpecialistsDisciplines() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const spacerW = spacerRef.current?.offsetWidth ?? 0;
      setCanScrollLeft(scrollLeft > spacerW + 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
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
      const firstCard = carouselRef.current.querySelector<HTMLElement>("[data-card]");
      const cardWidth = firstCard?.clientWidth ?? 240;
      const gap = 20;
      const scrollAmount = cardWidth + gap;
      const targetScroll =
        direction === "left"
          ? carouselRef.current.scrollLeft - scrollAmount
          : carouselRef.current.scrollLeft + scrollAmount;
      carouselRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full py-16 md:py-24 bg-white border-b border-slate-200 flex flex-col gap-10">
      
      {/* Section Header */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-10">
        <div className="flex flex-col items-center text-center gap-4 max-w-[960px] mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-slate-900 leading-[48px]">
            Distintas disciplinas para acompañar el bienestar
          </h2>
          <p className="text-xl sm:text-2xl font-normal text-slate-700 leading-8">
            La Red de Especialistas reúne profesionales de diferentes áreas, con enfoques y recorridos que abordan el bienestar desde perspectivas complementarias.
          </p>
        </div>
      </div>

      {/* Card Carousel with Vertical Cards w-[240px] */}
      <div className="w-full flex flex-col gap-6">
        <div
          ref={carouselRef}
          className="flex items-stretch gap-5 overflow-x-auto scroll-smooth py-2 snap-x snap-mandatory"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingRight: "max(1rem, calc((100vw - 1440px) / 2 + 2.5rem))",
            scrollPaddingLeft: "max(1rem, calc((100vw - 1440px) / 2 + 2.5rem))",
          }}
        >
          {/* Leading spacer */}
          <div
            ref={spacerRef}
            aria-hidden
            className="shrink-0"
            style={{ width: "max(1rem, calc((100vw - 1440px) / 2 + 2.5rem))" }}
          />

          {DISCIPLINES.map((item, idx) => (
            <div
              key={idx}
              data-card
              className="w-[240px] bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all p-6 flex flex-col justify-start items-start gap-3 shrink-0 snap-start shadow-xs hover:shadow-sm"
            >
              {/* Icon Top */}
              <div
                style={{
                  backgroundColor: item.color,
                  maskImage: `url('${item.icon}')`,
                  WebkitMaskImage: `url('${item.icon}')`,
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                }}
                className="w-7 h-7 shrink-0"
              />

              {/* Title */}
              <h3 style={{ color: item.color }} className="text-lg font-bold leading-snug">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-base font-normal text-slate-700 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Carousel Arrows Navigation */}
        <div
          className="flex justify-between items-center max-w-[1440px] w-full mx-auto"
          style={{
            paddingLeft: "max(1rem, calc((100vw - 1440px) / 2 + 2.5rem))",
            paddingRight: "max(1rem, calc((100vw - 1440px) / 2 + 2.5rem))",
          }}
        >
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-3 rounded-xl flex justify-center items-center transition-all ${
              canScrollLeft
                ? "bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                : "bg-slate-200 text-slate-400 opacity-40 cursor-not-allowed pointer-events-none"
            }`}
            aria-label="Anterior disciplina"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-3 rounded-xl flex justify-center items-center transition-all ${
              canScrollRight
                ? "bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                : "bg-slate-200 text-slate-400 opacity-40 cursor-not-allowed pointer-events-none"
            }`}
            aria-label="Siguiente disciplina"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

    </section>
  );
}
