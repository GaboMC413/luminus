"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { EventCard, EventItem } from "./EventCard";

interface PastEventsArchiveProps {
  events: EventItem[];
  title?: string;
  subtitle?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Todos": "#000000",
  "Crecimiento Personal": "#F0A500",
  "Bienestar Emocional": "#E855C8",
  "Salud Integral": "#0450FB",
  "Movimiento Físico": "#E63946",
  "Actividad Física": "#E11D48",
  "Nutrición": "#A8C800",
  "Espiritualidad": "#6D28D9",
  "Vínculos y Relaciones": "#FF7700",
  "Terapias Complementarias": "#0FA87A",
};

export function PastEventsArchive({
  events,
  title = "Encuentros Pasados y Grabaciones",
  subtitle = "Explora el registro de talleres, conversaciones y experiencias de bienestar que ya realizamos.",
}: PastEventsArchiveProps) {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const sectionRef = useRef<HTMLDivElement>(null);

  // 1. Sort events descending by date (most recent past event first)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [events]);

  // 2. Filter events by category
  const filteredEvents = useMemo(() => {
    if (activeCategory === "Todos") return sortedEvents;
    return sortedEvents.filter((item) => item.category === activeCategory);
  }, [sortedEvents, activeCategory]);

  // Reset to page 1 on category change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  // Scroll to section top on page change
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage, itemsPerPage]);

  return (
    <section ref={sectionRef} className="w-full py-10 md:py-16 bg-slate-100 border-t border-slate-200">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-10 flex flex-col gap-8 md:gap-10">
        
        {/* Header Title */}
        <div className="w-full flex flex-col justify-start items-start gap-3 md:gap-4 text-left">
          <h2 className="w-full text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-slate-900 leading-[40px] md:leading-[48px]">
            {title}
          </h2>
          {subtitle && (
            <p className="w-full text-lg sm:text-xl lg:text-[24px] font-normal text-slate-800 leading-7 md:leading-8">
              {subtitle}
            </p>
          )}
        </div>

        {/* Category Filters */}
        <div
          className="w-full flex flex-nowrap overflow-x-auto gap-2 justify-start pb-2 touch-pan-x scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {Object.keys(CATEGORY_COLORS).map((catName) => {
            const isSelected = activeCategory === catName;
            const color = CATEGORY_COLORS[catName];
            return (
              <button
                key={catName}
                onClick={() => setActiveCategory(catName)}
                style={{
                  backgroundColor: isSelected ? color : "#ffffff",
                  color: isSelected ? "#ffffff" : "#475569",
                  borderColor: isSelected ? color : "#e2e8f0",
                }}
                className="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full border transition-all duration-300 hover:scale-105 cursor-pointer shrink-0"
              >
                {catName}
              </button>
            );
          })}
        </div>

        {/* 4-Column Events Grid (Matching Grabaciones layout) */}
        {paginatedItems.length === 0 ? (
          <div className="w-full py-16 text-center text-slate-500 font-light bg-white rounded-3xl border border-slate-200">
            No hay actividades registradas en esta categoría por el momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 w-full">
            {paginatedItems.map((item, idx) => (
              <EventCard key={item.id || item.slug || idx} item={item} />
            ))}
          </div>
        )}

        {/* Pagination Controls (Matching exact Grabaciones pagination style: '< Página X de Y >') */}
        {totalPages > 1 && (
          <div className="w-full flex justify-center items-center gap-4 pt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-12 h-12 rounded-2xl bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="text-base sm:text-lg font-medium text-slate-900 select-none">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-12 h-12 rounded-2xl bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
