"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { RecordingCard, RecordingItem } from "@/components/events/RecordingCard";
import { CarouselNavControls } from "./molecules/CarouselNavControls";

interface RecentRecordingsCarouselProps {
  recordings: RecordingItem[];
  loading?: boolean;
}

/**
 * Horizontal carousel of recent recorded activities for the community home feed.
 */
export function RecentRecordingsCarousel({
  recordings,
  loading,
}: RecentRecordingsCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const visibleRecordings = React.useMemo(
    () => (recordings || []).slice(0, 8),
    [recordings]
  );

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
  }, [visibleRecordings, loading]);

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const firstCard = carouselRef.current.firstElementChild as HTMLElement | null;
    const secondCard = firstCard?.nextElementSibling as HTMLElement | null;
    const gap =
      firstCard && secondCard
        ? secondCard.offsetLeft - (firstCard.offsetLeft + firstCard.offsetWidth)
        : 10;
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

  if (!loading && visibleRecordings.length === 0) {
    return null;
  }

  return (
    <section className="w-full flex flex-col gap-3 py-1 relative">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-900 font-jakarta">
            Grabaciones recientes
          </h3>
          <Link
            href="/grabaciones"
            className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Ver todas
          </Link>
        </div>

        <CarouselNavControls
          onPrev={() => scroll("left")}
          onNext={() => scroll("right")}
          canPrev={canScrollLeft}
          canNext={canScrollRight}
        />
      </div>

      <div className="relative w-full">
        <div
          ref={carouselRef}
          className="flex items-stretch gap-2.5 overflow-x-auto scroll-smooth snap-x snap-mandatory custom-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 scroll-px-4 sm:scroll-px-6 md:scroll-px-0 py-1"
        >
          {loading && visibleRecordings.length === 0
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-[280px] sm:w-[320px] h-[350px] sm:h-[370px] shrink-0 snap-start bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-3 animate-pulse"
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
            : visibleRecordings.map((recording) => (
                <div
                  key={recording.id || recording.youtubeId || recording.title}
                  className="w-[280px] sm:w-[320px] shrink-0 snap-start"
                >
                  <RecordingCard recording={recording} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

export default RecentRecordingsCarousel;
