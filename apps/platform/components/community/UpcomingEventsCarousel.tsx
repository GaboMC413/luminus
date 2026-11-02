"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CarouselNavControls } from "./molecules/CarouselNavControls";
import { formatEventDateTime } from "@/lib/eventDateUtils";

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
  location?: string;
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!loading && (!events || events.length === 0)) {
    return null;
  }

  return (
    <section className="w-full flex flex-col gap-3 py-1 relative">
      {/* Header: Clean title with Right-Aligned Navigation Controls */}
      <div className="flex items-center justify-between px-0.5">
        <h3 className="text-sm font-semibold text-slate-900 font-jakarta">
          Próximas actividades
        </h3>

        {/* Molecule: Header Navigation Arrows */}
        <CarouselNavControls
          onPrev={() => scroll("left")}
          onNext={() => scroll("right")}
          canPrev={canScrollLeft}
          canNext={canScrollRight}
        />
      </div>

      {/* Carousel Wrapper */}
      <div className="relative w-full group/carousel">
        {/* Horizontal Carousel */}
        <div
          ref={carouselRef}
          className="flex items-stretch gap-2.5 overflow-x-auto scroll-smooth snap-x snap-mandatory custom-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 scroll-px-4 sm:scroll-px-6 md:scroll-px-0 py-1"
        >
          {loading && events.length === 0 ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-[280px] sm:w-[320px] h-[335px] sm:h-[355px] shrink-0 snap-start bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-3 animate-pulse"
              >
                <div className="w-full aspect-video rounded-xl bg-slate-100" />
                <div className="flex flex-col gap-1.5">
                  <div className="w-20 h-2.5 bg-slate-100 rounded" />
                  <div className="w-36 h-3 bg-slate-100 rounded" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="w-full h-4 bg-slate-100 rounded" />
                  <div className="w-28 h-3 bg-slate-100 rounded" />
                </div>
                <div className="mt-auto w-full h-8.5 bg-slate-100 rounded-xl" />
              </div>
            ))
          ) : (
            events.map((event) => {
              const eventSlug = event.slug || event.id;
              const cardHref = `/actividades/${eventSlug}`;
              const formattedDate = mounted ? formatEventDateTime(event.date, event.timeText) : null;
              const displayTag = event.location || "Estreno en YouTube";
              const displayDateText = formattedDate?.dateText || (event.date ? formatUpcomingDateHeader(event.date, event.timeText).dateText : "");
              const speakerText = formatSpeakerName(event.speakerName);
              const thumbUrl = event.coverUrl || "/placeholder-video.jpg";

              return (
                <div
                  key={event.id || event.title}
                  className="w-[280px] sm:w-[320px] h-[335px] sm:h-[355px] bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-colors overflow-hidden flex flex-col shrink-0 snap-start group shadow-none"
                >
                  {/* 1. Cover image linking to platform activity detail */}
                  <Link
                    href={cardHref}
                    className="w-full aspect-video relative overflow-hidden bg-slate-100 shrink-0 block hover:opacity-95 transition-opacity"
                  >
                    <img
                      src={thumbUrl}
                      alt={event.title}
                      className="w-full h-full object-cover object-center"
                    />
                  </Link>

                  {/* 2. Card body ordered: Próximamente -> Fecha -> Título (+ Speaker) -> Botón */}
                  <div className="w-full flex-1 p-3.5 sm:p-4 flex flex-col justify-between items-start min-h-0">
                    <div className="w-full flex flex-col gap-2.5">
                      {/* 1. Header: Próximamente text + Date */}
                      <div className="flex flex-col gap-1">
                        <span className="font-jakarta text-xs font-semibold uppercase tracking-wider text-slate-500">
                          {displayTag}
                        </span>
                        <p className="text-xs text-slate-500 font-sans truncate w-full">
                          {displayDateText}
                        </p>
                      </div>

                      {/* 2. Title & Speaker */}
                      <div className="flex flex-col gap-1">
                        <Link
                          href={cardHref}
                          className="no-underline block group/title"
                        >
                          <h4 className="w-full text-sm font-semibold text-slate-900 leading-snug line-clamp-2 font-jakarta group-hover/title:text-slate-600 transition-colors">
                            {event.title}
                          </h4>
                        </Link>

                        {speakerText && (
                          <p className="text-xs text-slate-500 truncate w-full font-sans">
                            {speakerText}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 3. Button: Inscribirme */}
                    <div className="w-full mt-auto pt-2">
                      <Link href={cardHref} className="w-full block">
                        <Button
                          variant="soft"
                          size="sm"
                          className="w-full"
                        >
                          Inscribirme
                        </Button>
                      </Link>
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
