"use client";

import { useState, useEffect, useRef } from "react";
import { EventCard, EventItem } from "./EventCard";

interface RecordingsGridProps {
  events: EventItem[];
  title?: string;
  subtitle?: string;
}

interface CategoryMeta {
  color: string;
  icon: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  "Todas las grabaciones": {
    color: "#0f172a",
    icon: "/Icons/all_inclusive_24dp.svg",
  },
  "Crecimiento Personal": {
    color: "#F0A500",
    icon: "/Icons/sunny_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  "Bienestar Emocional": {
    color: "#E855C8",
    icon: "/Icons/mood_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  "Salud Integral": {
    color: "#0450FB",
    icon: "/Icons/ecg_heart_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  "Movimiento Físico": {
    color: "#E63946",
    icon: "/Icons/exercise_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  "Nutrición": {
    color: "#A8C800",
    icon: "/Icons/nutrition_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  "Espiritualidad": {
    color: "#6D28D9",
    icon: "/Icons/self_improvement_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  "Vínculos y Relaciones": {
    color: "#FF7700",
    icon: "/Icons/join_inner_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
  "Terapias Complementarias": {
    color: "#0FA87A",
    icon: "/Icons/spa_24dp_000000_FILL1_wght400_GRAD0_opsz24.svg",
  },
};

function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export function RecordingsGrid({ events, title, subtitle }: RecordingsGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(48);
  const firstCategoryKey = Object.keys(CATEGORY_META)[0];
  const [activeCategory, setActiveCategory] = useState(firstCategoryKey);

  const filterScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (filterScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = filterScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = filterScrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, []);

  const scrollContainer = (direction: "left" | "right") => {
    if (filterScrollRef.current) {
      const scrollAmount = 280;
      const targetScroll =
        direction === "left"
          ? filterScrollRef.current.scrollLeft - scrollAmount
          : filterScrollRef.current.scrollLeft + scrollAmount;
      filterScrollRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 12 : 48);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset to page 1 on category change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const isAllCategory = activeCategory === firstCategoryKey || activeCategory === "Todos" || activeCategory === "Todas las grabaciones";

  const filtered = isAllCategory
    ? events
    : events.filter((e) => {
        const itemCat = e.category === "Actividad Física" ? "Movimiento Físico" : e.category;
        return itemCat === activeCategory;
      });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(start, start + itemsPerPage);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (events.length === 0) {
    return (
      <section className="w-full pt-8 md:pt-12 pb-8 md:pb-16 bg-white flex-1">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-10 text-center text-slate-500">
          No hay grabaciones disponibles por el momento.
        </div>
      </section>
    );
  }

  return (
    <section className="w-full pt-8 md:pt-12 pb-8 md:pb-16 bg-white flex-1 flex flex-col">

      {/* Header */}
      {(title || subtitle) && (
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 mb-6 md:mb-8 w-full">
          <div className="w-full flex flex-col justify-start items-start gap-3 md:gap-4 text-left">
            {title && (
              <h1 className="w-full text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-slate-900 leading-[40px] md:leading-[48px]">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="w-full text-lg sm:text-xl lg:text-[24px] font-normal text-slate-800 leading-7 md:leading-8">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Category Filter Navigation — Meetup style (No bottom line, smaller labels, scroll arrows) */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-10 mb-8 relative">

        {/* Left Arrow Button with Fade Gradient */}
        {canScrollLeft && (
          <div className="absolute left-4 md:left-10 top-0 bottom-0 z-20 flex items-center pr-6 bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none">
            <button
              onClick={() => scrollContainer("left")}
              className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 pointer-events-auto cursor-pointer"
              aria-label="Ver categorías anteriores"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Right Arrow Button with Fade Gradient */}
        {canScrollRight && (
          <div className="absolute right-4 md:right-10 top-0 bottom-0 z-20 flex items-center pl-6 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none">
            <button
              onClick={() => scrollContainer("right")}
              className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 pointer-events-auto cursor-pointer"
              aria-label="Ver más categorías"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Scrollable Container */}
        <div
          ref={filterScrollRef}
          className="w-full flex flex-nowrap overflow-x-auto gap-6 sm:gap-8 justify-start pb-2 touch-pan-x scroll-smooth select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {Object.keys(CATEGORY_META).map((catName) => {
            const isSelected = activeCategory === catName;
            const meta = CATEGORY_META[catName];
            return (
              <button
                key={catName}
                onClick={() => setActiveCategory(catName)}
                className="flex flex-col items-center gap-1.5 pb-2 px-1 shrink-0 group transition-all relative cursor-pointer"
              >
                {/* Icon Container */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                  style={{
                    backgroundColor: isSelected ? `${meta.color}15` : "#f1f5f9",
                  }}
                >
                  <div
                    className="w-5 h-5 transition-colors duration-200"
                    style={{
                      backgroundColor: isSelected ? meta.color : "#64748b",
                      maskImage: `url('${meta.icon}')`,
                      WebkitMaskImage: `url('${meta.icon}')`,
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                    }}
                  />
                </div>

                {/* Category Title — Smaller text label */}
                <span
                  className={`text-[11px] sm:text-xs whitespace-nowrap transition-colors ${isSelected
                    ? "font-semibold text-slate-900"
                    : "font-normal text-slate-600 group-hover:text-slate-900"
                    }`}
                >
                  {catName}
                </span>

                {/* Active Indicator Line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: isSelected ? meta.color : "transparent",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 max-w-[1440px] mx-auto px-4 md:px-10 w-full">
        {paginated.length > 0 ? (
          paginated.map((item, index) => (
            <EventCard key={item.id || item.youtube_id || index} item={item} />
          ))
        ) : (
          <div className="col-span-4 py-12 text-center text-slate-500">
            No hay grabaciones en esta categoría.
          </div>
        )}
      </div>

      {/* Pagination — Numeric Buttons */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12 w-full">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`w-10 h-10 rounded-xl flex justify-center items-center transition-all ${
              currentPage > 1
                ? "bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                : "bg-slate-100 text-slate-300 cursor-not-allowed pointer-events-none"
            }`}
            aria-label="Página anterior"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {getPageNumbers(currentPage, totalPages).map((p, idx) => {
            if (typeof p === "string") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 font-medium select-none">
                  ...
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
                }`}
              >
                {p}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`w-10 h-10 rounded-xl flex justify-center items-center transition-all ${
              currentPage < totalPages
                ? "bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                : "bg-slate-100 text-slate-300 cursor-not-allowed pointer-events-none"
            }`}
            aria-label="Página siguiente"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
