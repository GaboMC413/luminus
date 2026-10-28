"use client";

import React, { useRef, useState, useEffect } from "react";

export interface EventItem {
  id?: string;
  slug?: string;
  title: string;
  description?: string;
  speakerName?: string;
  speakerBio?: string;
  category?: string;
  date?: string | Date | null;
  timeText?: string;
  coverUrl?: string | null;
  link?: string;
  isUpcoming?: boolean;
}

interface UpcomingEventsCarouselProps {
  events: EventItem[];
  loading?: boolean;
}

function parseCalendarDate(dateStr?: string | Date | null): Date | null {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
  const str = String(dateStr).trim();
  if (!str) return null;

  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    return new Date(year, month, day);
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

const MONTH_NAMES_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic"
];

function formatUpcomingDateHeader(dateStr?: string | Date | null, timeText?: string) {
  if (!dateStr) return { tag: "PRÓXIMAMENTE", dateText: "" };
  try {
    const d = parseCalendarDate(dateStr);
    if (!d) return { tag: "PRÓXIMAMENTE", dateText: String(dateStr) };

    const weekdayRaw = d.toLocaleDateString("es-ES", { weekday: "long" });
    const weekday = weekdayRaw.charAt(0).toUpperCase() + weekdayRaw.slice(1);
    const day = d.getDate();
    const month = MONTH_NAMES_ES[d.getMonth()];

    const cleanTime = timeText
      ? timeText.replace(/\s*\([^)]*GMT[^)]*\)/gi, "").replace(/\s*\([^)]*UTC[^)]*\)/gi, "").trim()
      : "18:00 hs";

    return {
      tag: "PRÓXIMAMENTE",
      dateText: `${weekday} ${day} de ${month}. ${cleanTime}`,
    };
  } catch {
    return { tag: "PRÓXIMAMENTE", dateText: String(dateStr || "") };
  }
}

function formatSpeakerName(speakerName?: string): string | null {
  if (!speakerName) return null;
  const clean = speakerName.trim();
  if (
    clean === "Especialista LUMINUS" ||
    clean === "Especialistas LUMINUS" ||
    clean === "Especialista" ||
    clean === "LUMINUS"
  ) {
    return null;
  }
  return clean.startsWith("Con ") ? clean : `Con ${clean}`;
}

export function UpcomingEventsCarousel({ events, loading }: UpcomingEventsCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    updateScrollState();
    const el = carouselRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [events, loading]);

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const firstCard = carouselRef.current.firstElementChild as HTMLElement | null;
    const secondCard = firstCard?.nextElementSibling as HTMLElement | null;
    const gap = firstCard && secondCard
      ? secondCard.offsetLeft - (firstCard.offsetLeft + firstCard.offsetWidth)
      : 8;
    const scrollAmount = firstCard ? firstCard.offsetWidth + gap : 288;
    const target =
      direction === "left"
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount;

    carouselRef.current.scrollTo({
      left: target,
      behavior: "smooth",
    });
  };

  // If 0 events and not loading, hide block completely
  if (!loading && (!events || events.length === 0)) {
    return null;
  }

  return (
    <section className="w-full flex flex-col gap-3 py-1 relative">
      {/* Header: Clean title with Right-Aligned Navigation Controls */}
      <div className="flex items-center justify-between px-0.5">
        <h3 className="text-base font-bold text-slate-900 font-jakarta tracking-tight">
          Próximas actividades
        </h3>

        {/* Header Navigation Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Desplazar a la izquierda"
            className="w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center transition-all hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:scale-95 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300 shadow-none"
          >
            <span className="material-symbols-outlined text-[20px] select-none leading-none">
              chevron_left
            </span>
          </button>

          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Desplazar a la derecha"
            className="w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center transition-all hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:scale-95 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300 shadow-none"
          >
            <span className="material-symbols-outlined text-[20px] select-none leading-none">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      {/* Carousel Wrapper */}
      <div className="relative w-full group/carousel">

        {/* Horizontal Carousel (Mobile: edge bleed; Desktop: strictly contained within post margins) */}
        <div
          ref={carouselRef}
          className="flex items-stretch gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory custom-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 scroll-px-4 sm:scroll-px-6 md:scroll-px-0 py-1"
        >
          {loading && events.length === 0 ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-[280px] sm:w-[320px] h-[340px] sm:h-[365px] shrink-0 snap-start bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 animate-pulse"
              >
                <div className="w-full aspect-video rounded-xl bg-slate-100" />
                <div className="w-32 h-3 bg-slate-100 rounded" />
                <div className="w-full h-4 bg-slate-100 rounded" />
                <div className="w-24 h-3 bg-slate-100 rounded" />
                <div className="mt-auto w-20 h-4 bg-slate-100 rounded" />
              </div>
            ))
          ) : (
            events.map((event) => {
              const eventSlug = event.slug || event.id;
              const cardHref = `https://luminuslatam.com/proximasfechas/${eventSlug}`;
              const upcomingHeader = formatUpcomingDateHeader(event.date, event.timeText);
              const speakerText = formatSpeakerName(event.speakerName);
              const thumbUrl = event.coverUrl || "/placeholder-video.jpg";

              return (
                <div
                  key={event.id || event.title}
                  className="w-[280px] sm:w-[320px] h-[340px] sm:h-[365px] bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors overflow-hidden flex flex-col shrink-0 snap-start group shadow-none"
                >
                  {/* 1. Cover image linking to marketing in new tab */}
                  <a
                    href={cardHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full aspect-video relative overflow-hidden bg-slate-100 shrink-0 block hover:opacity-95 transition-opacity"
                  >
                    <img
                      src={thumbUrl}
                      alt={event.title}
                      className="w-full h-full object-cover object-center"
                    />
                  </a>

                  {/* 2. Card body */}
                  <div className="w-full flex-1 p-3.5 sm:p-4 flex flex-col justify-between items-start gap-2 min-h-0">
                    <div className="w-full flex flex-col gap-1.5 shrink-0">
                      {/* Date header */}
                      <div className="w-full flex justify-start items-center gap-1.5 text-xs font-medium truncate h-4">
                        <span className="font-bold text-slate-900 tracking-tight shrink-0 font-jakarta">
                          {upcomingHeader.tag}
                        </span>
                        <span className="text-slate-500 truncate font-sans">
                          {upcomingHeader.dateText}
                        </span>
                      </div>

                      {/* Title */}
                      <a
                        href={cardHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline hover:text-slate-600 transition-colors block"
                      >
                        <h4 className="w-full text-base font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[44px] font-jakarta">
                          {event.title}
                        </h4>
                      </a>

                      {/* Speaker name */}
                      <div className="h-5 flex items-center">
                        {speakerText && (
                          <span className="text-xs font-medium text-slate-500 truncate max-w-full font-sans">
                            {speakerText}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3. Divider & Action: Inscribirme -> */}
                    <div className="inline-flex justify-start items-center mt-auto pt-2.5 border-t border-slate-100 w-full shrink-0">
                      <a
                        href={cardHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 no-underline leading-5 hover:text-slate-600 transition-colors"
                      >
                        <span className="font-jakarta font-semibold">Inscribirme</span>
                        <svg
                          className="w-4 h-4 text-slate-900 group-hover/link:translate-x-0.5 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default UpcomingEventsCarousel;
