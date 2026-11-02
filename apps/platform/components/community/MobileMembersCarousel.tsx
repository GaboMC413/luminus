"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserCard } from "@/components/ui/UserCard";
import { ArrowRight } from "lucide-react";
import { CarouselNavControls } from "./molecules/CarouselNavControls";

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
        <h3 className="text-sm font-semibold text-slate-900 font-jakarta">
          Nuevos miembros
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
          className="flex items-stretch gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory custom-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 scroll-px-4 sm:scroll-px-6 md:scroll-px-0 py-1"
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

              {/* End Card: Ver todos los miembros */}
              <button
                type="button"
                onClick={() => router.push("/inicio/miembros")}
                className="w-[145px] sm:w-[155px] shrink-0 snap-start bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all outline-none group select-none"
              >
                <ArrowRight className="w-7 h-7 text-slate-700 group-hover:text-slate-900 group-hover:translate-x-1 transition-transform" />
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
