"use client";

import { useState, useEffect, useRef } from "react";
import { EventCard, EventItem } from "./EventCard";

interface PastEventsGridProps {
  events: EventItem[];
  title?: string;
  subtitle?: string;
}

const ITEMS_PER_PAGE = 8;

function getPageNumbers(currentPage: number, totalPages: number, isMobile = false): (number | string)[] {
  if (isMobile) {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 2) {
      return [1, 2, 3, "...", totalPages];
    }
    if (currentPage >= totalPages - 1) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage, "...", totalPages];
  }

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

export function PastEventsGrid({ events, title, subtitle }: PastEventsGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 640);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = events.slice(start, start + ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    if (sectionRef.current) {
      const yOffset = -70; // Navbar offset
      const y = sectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (events.length === 0) return null;

  return (
    <section ref={sectionRef} className="w-full pt-8 md:pt-12 pb-8 md:pb-16 bg-white flex-1 flex flex-col">

      {/* Header — same structure and spacing as InterviewsSection */}
      {(title || subtitle) && (
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 mb-6 md:mb-10 w-full">
          <div className="w-full flex flex-col justify-start items-start gap-3 md:gap-4 text-left">
            {title && (
              <h2 className="w-full text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-slate-900 leading-[40px] md:leading-[48px]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="w-full text-lg sm:text-xl lg:text-[24px] font-normal text-slate-800 leading-7 md:leading-8">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Grid — same max-w, px as InterviewsSection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 max-w-[1440px] mx-auto px-4 md:px-10 w-full">
        {paginated.map((item, index) => (
          <EventCard key={item.id || item.youtube_id || index} item={item} />
        ))}
      </div>

      {/* Pagination — Numeric Buttons */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 sm:gap-2 mt-8 md:mt-12 w-full">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex justify-center items-center transition-all ${
              currentPage > 1
                ? "bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                : "bg-slate-100 text-slate-300 cursor-not-allowed pointer-events-none"
            }`}
            aria-label="Página anterior"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {getPageNumbers(currentPage, totalPages, isMobile).map((p, idx) => {
            if (typeof p === "string") {
              return (
                <span key={`ellipsis-${idx}`} className="px-1 text-xs sm:text-sm text-slate-400 font-medium select-none">
                  ...
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
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
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex justify-center items-center transition-all ${
              currentPage < totalPages
                ? "bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                : "bg-slate-100 text-slate-300 cursor-not-allowed pointer-events-none"
            }`}
            aria-label="Página siguiente"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
