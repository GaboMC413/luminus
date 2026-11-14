"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselNavControlsProps {
  onPrev: () => void;
  onNext: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  className?: string;
}

export function CarouselNavControls({
  onPrev,
  onNext,
  canPrev = true,
  canNext = true,
  className = "",
}: CarouselNavControlsProps) {
  return (
    <div className={`flex items-center gap-1.5 shrink-0 ${className}`}>
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Anterior"
        className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 flex items-center justify-center transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Siguiente"
        className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 flex items-center justify-center transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
