"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserCard } from "@/components/ui/UserCard";

interface MobileMembersCarouselProps {
  members: any[];
  loading?: boolean;
}

export function MobileMembersCarousel({ members, loading }: MobileMembersCarouselProps) {
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter out official accounts and take top 7 members
  const newMembers = members
    .filter(
      (m) =>
        m.id !== "50d13047-bab8-44f1-9541-a821113845cc" &&
        m.id !== "mock-luminus" &&
        m.name?.toLowerCase() !== "luminus"
    )
    .slice(0, 7);

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
  }, [newMembers, loading]);

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const firstCard = carouselRef.current.firstElementChild as HTMLElement | null;
    const secondCard = firstCard?.nextElementSibling as HTMLElement | null;
    const gap = firstCard && secondCard
      ? secondCard.offsetLeft - (firstCard.offsetLeft + firstCard.offsetWidth)
      : 8;
    const scrollAmount = firstCard ? firstCard.offsetWidth + gap : 163;
    const target =
      direction === "left"
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount;

    carouselRef.current.scrollTo({
      left: target,
      behavior: "smooth",
    });
  };

  if (!loading && newMembers.length === 0) {
    return null;
  }

  return (
    <section className="w-full flex flex-col gap-3 py-1 relative">
      {/* Header: Clean title with Right-Aligned Navigation Controls */}
      <div className="flex items-center justify-between px-0.5">
        <h3 className="text-base font-bold text-slate-900 font-jakarta tracking-tight">
          Nuevos miembros
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

        {/* Horizontal Carousel (Starts at post margin, scrolls until screen edge, ends with margin) */}
        <div
          ref={carouselRef}
          className="flex items-stretch gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory custom-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 scroll-px-4 sm:scroll-px-6 py-1"
        >
          {loading && newMembers.length === 0 ? (
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-[155px] sm:w-[165px] shrink-0 snap-start bg-white rounded-2xl border border-slate-200 p-3 flex flex-col items-center gap-2.5 animate-pulse"
              >
                <div className="w-[64px] h-[64px] rounded-[16px] bg-slate-100" />
                <div className="w-20 h-3 bg-slate-100 rounded" />
                <div className="w-14 h-2.5 bg-slate-100 rounded" />
                <div className="w-16 h-3 bg-slate-100 rounded mt-2" />
              </div>
            ))
          ) : (
            <>
              {newMembers.map((member) => (
                <div
                  key={member.id}
                  className="w-[155px] sm:w-[165px] shrink-0 snap-start flex flex-col"
                >
                  <UserCard user={member} />
                </div>
              ))}

              {/* End Card: Giant grey button with border, arrow directly inside without white container box */}
              <button
                type="button"
                onClick={() => router.push("/comunidad/miembros")}
                className="w-[145px] sm:w-[155px] shrink-0 snap-start bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all outline-none group select-none"
              >
                <span className="material-symbols-outlined text-[32px] text-slate-700 group-hover:text-slate-900 group-hover:translate-x-1 transition-all select-none">
                  arrow_forward
                </span>
                <span className="text-xs font-bold text-slate-800 font-jakarta leading-snug px-1">
                  Ver todos los miembros
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default MobileMembersCarousel;
