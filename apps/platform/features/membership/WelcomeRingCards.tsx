"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  MessageCircle,
  HeartHandshake,
  CalendarHeart,
  HouseHeart,
  TvMinimalPlay,
} from "lucide-react";

interface WelcomeCardItem {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: typeof MessageCircle;
  image: string;
}

const CARDS: WelcomeCardItem[] = [
  {
    id: "comunidad",
    title: "Conecta con Personas",
    description: "Comparte con personas con tus mismos intereses.",
    color: "#FF7700", // Luminus Tangerine Orange
    icon: MessageCircle,
    image: "/Photos/Grupo conversando en terraza.png",
  },
  {
    id: "especialistas",
    title: "Conoce Especialistas",
    description: "Profesionales de distintas áreas para guiarte.",
    color: "#0450FB", // Luminus Cobalt Blue
    icon: HeartHandshake,
    image: "/Photos/Tres personas de pie sonriendo.png",
  },
  {
    id: "experiencias",
    title: "Descubre Experiencias",
    description: "Participa de actividades, encuentros y talleres.",
    color: "#E855C8", // Luminus Magenta
    icon: CalendarHeart,
    image: "/Photos/Grupo de personas conversando de pie.png",
  },
  {
    id: "espacios",
    title: "Encuentra Espacios",
    description: "Lugares de bienestar cercanos pensados para ti.",
    color: "#A8C800", // Luminus Chartreuse Green Lemon
    icon: HouseHeart,
    image: "/Photos/espacio.png",
  },
  {
    id: "contenidos",
    title: "Accede a Contenidos",
    description: "Entrevistas y podcast con especialistas de bienestar.",
    color: "#6D28D9", // Luminus Violet
    icon: TvMinimalPlay,
    image: "/Photos/Pareja de hosts en estudio de podcast.png",
  },
];

export function WelcomeRingCards() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Responsive desktop detection for wider 3D card separation
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-rotate every 4 seconds unless paused by user interaction
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CARDS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 35) {
      // Swipe left -> Next
      setActiveIndex((prev) => (prev + 1) % CARDS.length);
    } else if (diff < -35) {
      // Swipe right -> Prev
      setActiveIndex((prev) => (prev - 1 + CARDS.length) % CARDS.length);
    }

    touchStartX.current = null;
    setTimeout(() => setIsPaused(false), 2500);
  };

  // Wider separation on desktop for luxurious 3D gallery look
  const shift1 = isDesktop ? 108 : 64;
  const shift2 = isDesktop ? 195 : 110;
  const rotate1 = isDesktop ? 6 : 5;
  const rotate2 = isDesktop ? 12 : 10;

  return (
    <div
      className="w-full max-w-xl mx-auto flex flex-col items-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D Circular Ring Stage */}
      <div className="relative w-full max-w-[340px] sm:max-w-[620px] h-[370px] sm:h-[390px] flex items-center justify-center perspective-[1000px] overflow-visible">
        {CARDS.map((card, index) => {
          const diff = (index - activeIndex + CARDS.length) % CARDS.length;

          // 5-Card 3D circular ring transform calculation
          let transformStyle = "";
          let zIndex = 10;
          let isCenter = false;
          let veilOpacity = "opacity-0";

          if (diff === 0) {
            // Active Center Card
            isCenter = true;
            zIndex = 30;
            veilOpacity = "opacity-0";
            transformStyle = "translate3d(0, 0, 0) scale(1) rotate(0deg)";
          } else if (diff === 1) {
            // Next Card (Right)
            zIndex = 20;
            veilOpacity = "opacity-30";
            transformStyle = `translate3d(${shift1}px, 6px, -30px) scale(0.88) rotate(${rotate1}deg)`;
          } else if (diff === CARDS.length - 1) {
            // Previous Card (Left)
            zIndex = 20;
            veilOpacity = "opacity-30";
            transformStyle = `translate3d(-${shift1}px, 6px, -30px) scale(0.88) rotate(-${rotate1}deg)`;
          } else if (diff === 2) {
            // Far Right Card
            zIndex = 10;
            veilOpacity = "opacity-60";
            transformStyle = `translate3d(${shift2}px, 14px, -60px) scale(0.76) rotate(${rotate2}deg)`;
          } else {
            // Far Left Card (diff === 3)
            zIndex = 10;
            veilOpacity = "opacity-60";
            transformStyle = `translate3d(-${shift2}px, 14px, -60px) scale(0.76) rotate(-${rotate2}deg)`;
          }

          const IconComponent = card.icon;

          return (
            <div
              key={card.id}
              onClick={() => {
                if (!isCenter) setActiveIndex(index);
              }}
              style={{
                transform: transformStyle,
                zIndex,
                backgroundColor: card.color,
                transition: "all 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
              className={`absolute top-1 w-[210px] sm:w-[228px] h-[355px] sm:h-[375px] rounded-3xl overflow-hidden flex flex-col shadow-[0_18px_38px_-8px_rgba(0,0,0,0.22)] cursor-pointer will-change-transform ${
                isCenter ? "cursor-default" : "hover:opacity-95"
              }`}
            >
              {/* Subtle White Veil for Depth without Transparency Bleed */}
              <div
                className={`absolute inset-0 rounded-3xl bg-white transition-opacity duration-500 pointer-events-none z-20 ${veilOpacity}`}
                aria-hidden="true"
              />

              {/* 1:1 Square Photo Section */}
              <div className="relative w-full aspect-square bg-slate-100 overflow-hidden shrink-0">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover object-center"
                  sizes="240px"
                  priority={diff === 0 || diff === 1 || diff === CARDS.length - 1}
                />
              </div>

              {/* Bottom Solid Plain Color Section */}
              <div
                style={{ backgroundColor: card.color }}
                className="flex-1 px-4 py-4 sm:px-4.5 sm:py-4.5 flex flex-col items-center justify-center text-center gap-1.5 text-white"
              >
                {/* Centered Free-Standing Icon on Top */}
                <IconComponent
                  strokeWidth={2}
                  className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-white shrink-0 mb-0.5"
                />

                {/* Centered Title */}
                <h3 className="text-[15px] sm:text-[16px] font-bold font-jakarta text-white tracking-tight leading-snug m-0">
                  {card.title}
                </h3>

                {/* Centered Description */}
                <p className="text-[11.5px] sm:text-[12px] text-white/95 leading-relaxed font-sans m-0 max-w-[190px]">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dot Indicators */}
      <div className="flex items-center gap-2 mt-6 sm:mt-7">
        {CARDS.map((card, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Ver ${card.title}`}
              style={{
                backgroundColor: isActive ? card.color : undefined,
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer border-none p-0 ${
                isActive ? "w-6 shadow-sm" : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
