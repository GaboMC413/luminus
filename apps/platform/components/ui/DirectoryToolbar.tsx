"use client";

import React from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { Button } from "./Button";

export interface ActiveFilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

export interface DirectoryToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  activeFiltersCount?: number;
  filterTriggerLabel?: string;
  activeFilterChips?: ActiveFilterChip[];
  onClearAllFilters?: () => void;
  clearFiltersLabel?: string;
  children?: React.ReactNode;
  filterActions?: React.ReactNode;
  className?: string;
}

/**
 * Standardized directory search & filter toolbar across LUMINUS directories.
 * Unifies /especialistas, /inicio/miembros, and /red with consistent responsive controls.
 */
export function DirectoryToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filtersOpen,
  onToggleFilters,
  activeFiltersCount = 0,
  filterTriggerLabel = "Filtros",
  activeFilterChips = [],
  onClearAllFilters,
  clearFiltersLabel = "Limpiar filtros",
  children,
  filterActions,
  className = "",
}: DirectoryToolbarProps) {
  const hasActiveFilters = activeFiltersCount > 0 || activeFilterChips.length > 0;

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Search Bar + Filters Toggle Button */}
      <div className="flex items-center gap-2.5 sm:gap-3 w-full">
        <div className="flex-1 min-w-0">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onToggleFilters}
          className={`h-11 px-3.5 sm:px-4 rounded-xl shrink-0 gap-2 border font-jakarta transition-all ${
            filtersOpen || hasActiveFilters
              ? "border-slate-800 text-slate-900 bg-slate-50"
              : "border-slate-200 text-slate-700 hover:border-slate-300"
          }`}
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal className="w-4 h-4 shrink-0 text-slate-600" />
          <span className="text-xs sm:text-sm font-semibold">{filterTriggerLabel}</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 ml-0.5">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {/* Expandable Filter Panel */}
      {filtersOpen && children && (
        <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col gap-4 animate-in fade-in-50 slide-in-from-top-1 duration-150">
          <div>{children}</div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1 gap-3">
            {onClearAllFilters && hasActiveFilters ? (
              <button
                type="button"
                onClick={onClearAllFilters}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer bg-transparent border-none p-0 outline-none font-jakarta"
              >
                {clearFiltersLabel}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 ml-auto">
              {filterActions || (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={onToggleFilters}
                >
                  Cerrar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-0.5">
          {activeFilterChips.map((chip) => (
            <div
              key={chip.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700 select-none animate-in fade-in duration-100"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                aria-label={`Remover filtro ${chip.label}`}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center"
              >
                <X className="w-3 h-3" strokeWidth={2.5} />
              </button>
            </div>
          ))}

          {onClearAllFilters && (
            <button
              type="button"
              onClick={onClearAllFilters}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer bg-transparent border-none p-1 outline-none font-jakarta ml-1"
            >
              {clearFiltersLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default DirectoryToolbar;
