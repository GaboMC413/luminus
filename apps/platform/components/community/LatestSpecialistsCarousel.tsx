"use client";

import React, { useRef, useState, useEffect } from "react";
import { UserCard, UserCardData } from "@/components/ui/UserCard";
import { CarouselNavControls } from "./molecules/CarouselNavControls";

export interface SpecialistCarouselItem extends UserCardData {
  slug?: string | null;
  areas?: string[];
}

interface LatestSpecialistsCarouselProps {
  specialists: SpecialistCarouselItem[];
  loading?: boolean;
}

/**
 * Horizontal carousel showcasing the most recent active specialists in the community feed.
 */
export function LatestSpecialistsCarousel({
  specialists,
  loading,
}: LatestSpecialistsCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const visibleSpecialists = React.useMemo(
    () => (specialists || []).slice(0, 10),
    [specialists]
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
  }, [visibleSpecialists, loading]);

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const firstCard = carouselRef.current.firstElementChild as HTMLElement | null;
    const secondCard = firstCard?.nextElementSibling as HTMLElement | null;
    const gap =
      firstCard && secondCard
        ? secondCard.offsetLeft - (firstCard.offsetLeft + firstCard.offsetWidth)
        : 10;
    const scrollAmount = firstCard ? firstCard.offsetWidth + gap : 220;
    const target =
      direction === "left"
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount;

    carouselRef.current.scrollTo({
      left: target,
      behavior: "smooth",
    });
  };

  if (!loading && visibleSpecialists.length === 0) {
    return null;
  }

  return (
    <section className="w-full flex flex-col gap-3 py-1 relative">
      <div className="flex items-center justify-between px-0.5">
        <h3 className="text-sm font-semibold text-slate-900 font-jakarta">
          Últimos especialistas
        </h3>

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
          {loading && visibleSpecialists.length === 0
            ? [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-[210px] h-[250px] shrink-0 snap-start bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center justify-between animate-pulse"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-100" />
                  <div className="w-full flex flex-col items-center gap-2">
                    <div className="w-28 h-3.5 bg-slate-100 rounded" />
                    <div className="w-20 h-3 bg-slate-100 rounded" />
                  </div>
                  <div className="w-full h-8 bg-slate-100 rounded-xl" />
                </div>
              ))
            : visibleSpecialists.map((specialist) => (
                <div
                  key={specialist.id}
                  className="w-[210px] shrink-0 snap-start flex"
                >
                  <UserCard
                    user={{
                      ...specialist,
                      categories: specialist.areas,
                    }}
                    specialty={specialist.specialty}
                    title={specialist.title}
                    actionLabel="Ver perfil"
                    profileHref={`/perfil/${encodeURIComponent(
                      specialist.slug || specialist.id
                    )}`}
                    className="w-full"
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

export default LatestSpecialistsCarousel;
