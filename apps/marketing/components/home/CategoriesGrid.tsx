"use client";

import { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  {
    title: "Crecimiento Personal",
    color: "#F0A500",
    description: "Desarrollo consciente de capacidades, conocimientos y recursos personales orientados al autoconocimiento y la realización de objetivos.",
    icon: "/Icons/sunny_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Bienestar Emocional",
    color: "#E855C8",
    description: "Desarrollo de los recursos internos para reconocer, expresar y regular las emociones, afrontar desafíos y construir relaciones más sanas.",
    icon: "/Icons/mood_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Salud Integral",
    color: "#0450FB",
    description: "Área que aborda la salud reuniendo medicina, prevención, diagnóstico, tratamiento y otras disciplinas orientadas al cuidado del cuerpo.",
    icon: "/Icons/ecg_heart_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Movimiento Físico",
    color: "#E63946",
    description: "Actividades y prácticas corporales destinadas a desarrollar o mantener la movilidad, la fuerza, la resistencia y la condición física.",
    icon: "/Icons/exercise_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Nutrición",
    color: "#A8C800",
    description: "Área centrada en la alimentación, los hábitos alimentarios y su relación con la salud y el funcionamiento del organismo.",
    icon: "/Icons/nutrition_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Espiritualidad",
    color: "#6D28D9",
    description: "Área vinculada con la búsqueda de sentido, la conexión interior, la relación de una persona con aquello que considera trascendente.",
    icon: "/Icons/self_improvement_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Vínculos y Relaciones",
    color: "#FF7700",
    description: "Área relacionada con la forma en que las personas construyen, desarrollan y mantienen relaciones afectivas, familiares y sociales.",
    icon: "/Icons/join_inner_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  {
    title: "Terapias Complementarias",
    color: "#0FA87A",
    description: "Conjunto de prácticas y enfoques utilizados como complemento de otras formas de cuidado, desde perspectivas integrativas o tradicionales.",
    icon: "/Icons/spa_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
];

export function CategoriesGrid() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoRotateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (isPaused) {
      if (autoRotateTimerRef.current) {
        clearInterval(autoRotateTimerRef.current);
      }
      return;
    }

    autoRotateTimerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CATEGORIES.length);
    }, 3000);

    return () => {
      if (autoRotateTimerRef.current) {
        clearInterval(autoRotateTimerRef.current);
      }
    };
  }, [isPaused]);

  useEffect(() => {
    if (nodeRefs.current[activeIndex] && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = nodeRefs.current[activeIndex];
      if (element) {
        const containerWidth = container.clientWidth;
        const elementLeft = element.offsetLeft;
        const elementWidth = element.clientWidth;
        const scrollLeftTarget = elementLeft - containerWidth / 2 + elementWidth / 2;

        container.scrollTo({
          left: scrollLeftTarget,
          behavior: "smooth"
        });
      }
    }
  }, [activeIndex]);

  const activeCategory = CATEGORIES[activeIndex];

  return (
    <section
      className="relative w-full py-16 md:py-24 bg-white overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dynamic Background Gradient Mask */}
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-colors duration-1000 ease-in-out"
        style={{
          backgroundColor: activeCategory.color,
          opacity: 0.05,
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
        }}
      />

      <style>{`
        .wellness-wheel {
          --node-offset: 20px;
        }
        @media (min-width: 640px) {
          .wellness-wheel {
            --node-offset: 28px;
          }
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-10 flex flex-col gap-12 sm:gap-16">

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 max-w-[960px] mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-slate-900 leading-[48px]">
            Explora distintas áreas, enfoques y profesionales según lo que estés buscando en cada momento.
          </h2>
        </div>

        {/* Centered Details (Above timeline slider) */}
        <div className="w-full max-w-[800px] mx-auto min-h-[140px] flex flex-col items-center justify-center text-center px-4">
          <div
            key={activeIndex}
            className="flex flex-col gap-4 items-center animate-[fadeInUp_0.4s_ease-out_forwards]"
          >
            <h3
              style={{ color: activeCategory.color }}
              className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight"
            >
              {activeCategory.title}
            </h3>

            <p className="text-lg sm:text-xl font-normal text-slate-700 leading-relaxed max-w-[700px]">
              {activeCategory.description}
            </p>
          </div>
        </div>

        {/* Timeline Slider Track (At the bottom of the section) */}
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto scrollbar-none py-6 px-4 touch-pan-x"
        >
          <div className="wellness-wheel relative min-w-[760px] max-w-[960px] mx-auto h-20 flex items-center">

            {/* Active Sliding Segment (No background line) */}
            <div
              style={{
                left: `calc(var(--node-offset) + (100% - var(--node-offset) * 2) * ${activeIndex / 7})`,
                backgroundColor: activeCategory.color,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute top-1/2 h-[3.5px] w-10 sm:w-14 rounded-full z-10 transition-all duration-500 ease-in-out"
            />

            {/* Category Nodes (Smaller sizes) */}
            {CATEGORIES.map((cat, index) => {
              const isActive = index === activeIndex;
              const leftPosition = `calc(var(--node-offset) + (100% - var(--node-offset) * 2) * ${index / 7})`;

              return (
                <button
                  key={index}
                  ref={(el) => { nodeRefs.current[index] = el; }}
                  onClick={() => {
                    setActiveIndex(index);
                    setIsPaused(true);
                  }}
                  onMouseEnter={() => {
                    setActiveIndex(index);
                    setIsPaused(true);
                  }}
                  style={{
                    left: leftPosition,
                    transform: `translate(-50%, -50%) ${isActive ? 'scale(1.2)' : 'scale(1)'}`,
                    borderColor: cat.color,
                    backgroundColor: isActive ? cat.color : '#ffffff',
                  }}
                  className="absolute top-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-20 hover:scale-110 cursor-pointer"
                  aria-label={`Seleccionar área ${cat.title}`}
                >
                  <div
                    style={{
                      backgroundColor: isActive ? '#ffffff' : cat.color,
                      maskImage: `url('${cat.icon}')`,
                      WebkitMaskImage: `url('${cat.icon}')`,
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                    }}
                    className="w-4.5 h-4.5 sm:w-6 sm:h-6 transition-all duration-500"
                  />
                </button>
              );
            })}

          </div>
        </div>

      </div>
    </section>
  );
}
