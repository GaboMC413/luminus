"use client";

import React from "react";

export interface SelectionCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function SelectionCard({
  title,
  description,
  selected,
  onSelect,
  children,
  className = "",
}: SelectionCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`flex flex-col p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none bg-white ${
        selected
          ? "border-slate-900 ring-1 ring-slate-900 shadow-sm"
          : "border-slate-200 hover:border-slate-300"
      } ${className}`}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm sm:text-base font-bold text-slate-900 font-jakarta">
          {title}
        </span>
        {description && (
          <span className="text-xs sm:text-sm text-slate-500 font-sans leading-relaxed">
            {description}
          </span>
        )}
      </div>

      {selected && children && (
        <div
          className="flex flex-col gap-4 mt-4 pt-4 border-t border-slate-100 animate-in fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default SelectionCard;
