"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Infinity as InfinityIcon,
  Sun,
  Smile,
  HeartPulse,
  Dumbbell,
  Apple,
  Sparkle,
  Blend,
  Flower,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SelectInput } from "@/components/ui/SelectInput";
import {
  useDynamicCategories,
  getCategoryIconComponent,
  getCategoryCustomStyles,
} from "@/components/ui/InterestPill";

export interface CategoryItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIconBg: string;
  activeText: string;
  activeBorder: string;
  hoverIconBg: string;
  hoverText: string;
}

export const RECORDING_CATEGORIES: CategoryItem[] = [
  {
    id: "Todas las grabaciones",
    label: "Todas las grabaciones",
    icon: InfinityIcon,
    activeIconBg: "bg-slate-900 text-white",
    activeText: "text-slate-900 font-semibold",
    activeBorder: "border-slate-900",
    hoverIconBg: "group-hover:bg-slate-200 group-hover:text-slate-800",
    hoverText: "group-hover:text-slate-900",
  },
  {
    id: "Crecimiento Personal",
    label: "Crecimiento Personal",
    icon: Sun,
    activeIconBg: "bg-amber-100 text-amber-600",
    activeText: "text-amber-600 font-semibold",
    activeBorder: "border-amber-500",
    hoverIconBg: "group-hover:bg-amber-50 group-hover:text-amber-600",
    hoverText: "group-hover:text-amber-700",
  },
  {
    id: "Bienestar Emocional",
    label: "Bienestar Emocional",
    icon: Smile,
    activeIconBg: "bg-pink-100 text-pink-600",
    activeText: "text-pink-600 font-semibold",
    activeBorder: "border-pink-500",
    hoverIconBg: "group-hover:bg-pink-50 group-hover:text-pink-600",
    hoverText: "group-hover:text-pink-700",
  },
  {
    id: "Salud Integral",
    label: "Salud Integral",
    icon: HeartPulse,
    activeIconBg: "bg-blue-100 text-blue-600",
    activeText: "text-blue-600 font-semibold",
    activeBorder: "border-blue-600",
    hoverIconBg: "group-hover:bg-blue-50 group-hover:text-blue-600",
    hoverText: "group-hover:text-blue-700",
  },
  {
    id: "Movimiento Físico",
    label: "Movimiento Físico",
    icon: Dumbbell,
    activeIconBg: "bg-red-100 text-red-600",
    activeText: "text-red-600 font-semibold",
    activeBorder: "border-red-500",
    hoverIconBg: "group-hover:bg-red-50 group-hover:text-red-600",
    hoverText: "group-hover:text-red-700",
  },
  {
    id: "Nutrición",
    label: "Nutrición",
    icon: Apple,
    activeIconBg: "bg-lime-100 text-lime-700",
    activeText: "text-lime-700 font-semibold",
    activeBorder: "border-lime-600",
    hoverIconBg: "group-hover:bg-lime-50 group-hover:text-lime-700",
    hoverText: "group-hover:text-lime-700",
  },
  {
    id: "Espiritualidad",
    label: "Espiritualidad",
    icon: Sparkle,
    activeIconBg: "bg-purple-100 text-purple-600",
    activeText: "text-purple-600 font-semibold",
    activeBorder: "border-purple-600",
    hoverIconBg: "group-hover:bg-purple-50 group-hover:text-purple-600",
    hoverText: "group-hover:text-purple-700",
  },
  {
    id: "Vínculos y Relaciones",
    label: "Vínculos y Relaciones",
    icon: Blend,
    activeIconBg: "bg-orange-100 text-orange-600",
    activeText: "text-orange-600 font-semibold",
    activeBorder: "border-orange-500",
    hoverIconBg: "group-hover:bg-orange-50 group-hover:text-orange-600",
    hoverText: "group-hover:text-orange-700",
  },
  {
    id: "Terapias Complementarias",
    label: "Terapias Complementarias",
    icon: Flower,
    activeIconBg: "bg-teal-100 text-teal-700",
    activeText: "text-teal-700 font-semibold",
    activeBorder: "border-teal-600",
    hoverIconBg: "group-hover:bg-teal-50 group-hover:text-teal-700",
    hoverText: "group-hover:text-teal-700",
  },
];

interface RecordingCategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function RecordingCategorySelector({
  selectedCategory,
  onSelectCategory,
}: RecordingCategorySelectorProps) {
  const dbCategories = useDynamicCategories();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
  }, []);

  useEffect(() => {
    checkScrollState();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScrollState, { passive: true });
    window.addEventListener("resize", checkScrollState);
    return () => {
      el.removeEventListener("scroll", checkScrollState);
      window.removeEventListener("resize", checkScrollState);
    };
  }, [checkScrollState]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 260;
    const target =
      direction === "left"
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;
    scrollRef.current.scrollTo({ left: target, behavior: "smooth" });
  };

  const selectOptions = RECORDING_CATEGORIES.map((cat) => ({
    label: cat.label,
    value: cat.id,
  }));

  const activeCategoryItem =
    RECORDING_CATEGORIES.find((cat) => cat.id === selectedCategory) ||
    RECORDING_CATEGORIES[0];
  const ActiveIcon = activeCategoryItem.icon;

  return (
    <div className="w-full">
      {/* MOBILE VIEW (< md): Dropdown using platform SelectInput */}
      <div className="md:hidden w-full flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-jakarta">
          Filtrar por categoría
        </label>
        <div className="relative w-full">
          <SelectInput
            value={selectedCategory}
            options={selectOptions}
            onSelect={onSelectCategory}
            placeholder="Selecciona categoría"
            variant="bordered"
            size="md"
            className="w-full"
          />
        </div>
      </div>

      {/* DESKTOP VIEW (>= md): Carousel on top with Navigation Controls */}
      <div className="hidden md:block relative w-full group/categories">
        {/* Left Arrow Button with gradient fade */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-6 bg-gradient-to-r from-white via-white/95 to-transparent">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Ver categorías anteriores"
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 shadow-sm flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right Arrow Button with gradient fade */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-6 bg-gradient-to-l from-white via-white/95 to-transparent">
            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="Ver más categorías"
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 shadow-sm flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Category Items Container */}
        <div
          ref={scrollRef}
          className="w-full flex items-center gap-6 overflow-x-auto scroll-smooth custom-scrollbar pb-2 pt-1 select-none"
        >
          {RECORDING_CATEGORIES.map((category) => {
            const isAll = category.id === "Todas las grabaciones";
            const isSelected = selectedCategory === category.id;
            const Icon = isAll
              ? category.icon
              : getCategoryIconComponent(category.id, dbCategories) || category.icon;
            const customStyles = isAll
              ? null
              : getCategoryCustomStyles(category.id, dbCategories);

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(category.id)}
                style={
                  isSelected && customStyles?.color
                    ? { borderColor: customStyles.color }
                    : undefined
                }
                className={`flex flex-col items-center gap-2 pb-2 px-1 shrink-0 group transition-all relative cursor-pointer border-b-2 ${
                  isSelected
                    ? category.activeBorder
                    : "border-transparent hover:border-slate-200"
                }`}
              >
                {/* Icon Container */}
                <div
                  style={
                    isSelected && customStyles?.color && customStyles?.bgColor
                      ? {
                          backgroundColor: customStyles.bgColor,
                          color: customStyles.color,
                        }
                      : undefined
                  }
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 group-hover:scale-105 ${
                    isSelected
                      ? category.activeIconBg
                      : `bg-slate-100 text-slate-500 ${category.hoverIconBg}`
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                </div>

                {/* Category Label */}
                <span
                  style={
                    isSelected && customStyles?.color
                      ? { color: customStyles.color }
                      : undefined
                  }
                  className={`text-xs whitespace-nowrap font-jakarta transition-colors duration-150 ${
                    isSelected
                      ? category.activeText
                      : `text-slate-600 ${category.hoverText}`
                  }`}
                >
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RecordingCategorySelector;
