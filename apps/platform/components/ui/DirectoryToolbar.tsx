"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X, ChevronDown, Check, Search } from "lucide-react";
import { SearchBar, SearchSuggestion } from "./SearchBar";
import { Button } from "./Button";

export interface ActiveFilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

export interface DirectoryTagPopoverProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (nextSelected: string[]) => void;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

/**
 * Inline 44px (h-11) multi-select tag popover trigger for Desktop Directory Toolbars.
 * Matches SelectInput and SearchBar geometry while allowing multi-tag selection over the listing.
 */
export function DirectoryTagPopover({
  label,
  options,
  selectedValues,
  onChange,
  searchPlaceholder = "Filtrar opciones...",
  emptyText = "No hay opciones disponibles.",
  className = "",
}: DirectoryTagPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceIdRef = useRef(Math.random().toString(36).substring(2, 9));

  // Close when another SelectInput or DirectoryTagPopover opens
  useEffect(() => {
    const handleOtherOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.id !== instanceIdRef.current) {
        setIsOpen(false);
      }
    };
    window.addEventListener("luminus-select-open", handleOtherOpen);
    return () => window.removeEventListener("luminus-select-open", handleOtherOpen);
  }, []);

  // Close on click outside or Escape
  useEffect(() => {
    if (!isOpen) {
      setFilterText("");
      return;
    }

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, filterText]);

  const toggleOption = (item: string) => {
    if (selectedValues.includes(item)) {
      onChange(selectedValues.filter((val) => val !== item));
    } else {
      onChange([...selectedValues, item]);
    }
  };

  const count = selectedValues.length;

  return (
    <div ref={containerRef} className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next) {
            window.dispatchEvent(
              new CustomEvent("luminus-select-open", { detail: { id: instanceIdRef.current } })
            );
          }
        }}
        aria-expanded={isOpen}
        className={`h-11 px-3.5 rounded-xl bg-white border text-xs sm:text-sm font-sans flex items-center justify-between gap-2 cursor-pointer transition-colors outline-none select-none ${
          isOpen
            ? "border-slate-800 ring-1 ring-slate-800 text-slate-900"
            : count > 0
            ? "border-slate-800 text-slate-900 font-medium"
            : "border-slate-200 text-slate-500 hover:border-slate-300"
        }`}
      >
        <span className="truncate">{label}</span>
        {count > 0 && (
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold font-jakarta flex items-center justify-center shrink-0">
            {count}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] right-0 w-[340px] sm:w-[380px] z-50 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-none flex flex-col gap-3 animate-in fade-in-0 zoom-in-98 duration-150 origin-top-right">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 font-jakarta flex items-center">
              {label}
              {count > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                  {count} seleccionado{count > 1 ? "s" : ""}
                </span>
              )}
            </span>

            {count > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 bg-transparent border-none p-0 cursor-pointer font-jakarta transition-colors"
              >
                Desmarcar todos
              </button>
            )}
          </div>

          {options.length > 8 && (
            <div className="relative flex items-center w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 pl-8 pr-7 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
              />
              {filterText && (
                <button
                  type="button"
                  onClick={() => setFilterText("")}
                  className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 max-h-[210px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {filteredOptions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 w-full text-center font-sans">
                {emptyText}
              </p>
            ) : (
              filteredOptions.map((item) => {
                const isChecked = selectedValues.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleOption(item)}
                    className={`h-8 px-3 rounded-full text-xs font-medium font-jakarta transition-all border cursor-pointer select-none flex items-center gap-1.5 shrink-0 ${
                      isChecked
                        ? "bg-slate-900 text-white border-slate-900 shadow-none font-semibold"
                        : "bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                    <span>{item}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export interface DirectoryToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  onSearchClear?: () => void;
  searchSuggestions?: SearchSuggestion[];
  onSelectSuggestion?: (suggestion: SearchSuggestion) => void;
  searchPlaceholder?: string;
  /**
   * Inline filter controls rendered directly on the 44px (h-11) desktop row
   * alongside the SearchBar (Circle.so / ADPList hybrid pattern).
   */
  desktopFilters?: React.ReactNode;
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
 * - Desktop (md+): Single 44px (h-11) horizontal row with predictive SearchBar + inline dropdowns/popovers.
 * - Mobile (< md): Predictive SearchBar + 44px (h-11) Filters button opening a clean bottom sheet drawer.
 * - Active Chips: Removable filter pills displayed directly below the toolbar.
 */
export function DirectoryToolbar({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  searchSuggestions = [],
  onSelectSuggestion,
  searchPlaceholder = "Buscar...",
  desktopFilters,
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
  const [mounted, setMounted] = useState(false);
  const hasActiveFilters = activeFiltersCount > 0 || activeFilterChips.length > 0;
  const filterContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Close desktop fallback filter overlay on click outside or Escape key
  useEffect(() => {
    if (!filtersOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.closest?.('[data-select-portal="true"]') ||
        target?.closest?.('[data-mobile-filters="true"]')
      ) {
        return;
      }

      if (filterContainerRef.current && !filterContainerRef.current.contains(e.target as Node)) {
        onToggleFilters();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onToggleFilters();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [filtersOpen, onToggleFilters]);

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Search Bar + Inline Desktop Filters / Mobile Filter Trigger */}
      <div className="relative w-full" ref={filterContainerRef}>
        <div className="flex items-center gap-2.5 w-full">
          <div className="flex-1 min-w-0">
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              onSubmit={onSearchSubmit}
              onClear={onSearchClear}
              suggestions={searchSuggestions}
              onSelectSuggestion={onSelectSuggestion}
              placeholder={searchPlaceholder}
            />
          </div>

          {/* Desktop Inline Filters (Circle.so / ADPList pattern) */}
          {desktopFilters && (
            <div className="hidden md:flex items-center gap-2.5 shrink-0">
              {desktopFilters}
            </div>
          )}

          {/* Filter Trigger Button (Always shown on mobile; shown on desktop only if desktopFilters is omitted) */}
          <button
            type="button"
            onClick={onToggleFilters}
            aria-expanded={filtersOpen}
            className={`${
              desktopFilters ? "flex md:hidden" : "flex"
            } h-11 px-3.5 sm:px-4 rounded-xl bg-white shrink-0 items-center justify-center gap-2 border font-jakarta transition-colors cursor-pointer select-none outline-none ${
              filtersOpen || hasActiveFilters
                ? "border-slate-800 text-slate-900 bg-slate-50"
                : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 shrink-0 text-slate-600" />
            <span className="text-xs sm:text-sm font-semibold">{filterTriggerLabel}</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Fallback Popover (only when desktopFilters is not used) */}
        {!desktopFilters && filtersOpen && children && (
          <div className="hidden md:flex absolute top-[calc(100%+8px)] right-0 w-[420px] z-40 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-none flex-col gap-5 animate-in fade-in-0 zoom-in-98 duration-150 origin-top-right">
            <div>{children}</div>

            <div className="flex items-center justify-between pt-1 gap-3">
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

        {/* Mobile Bottom Sheet Drawer (< md) */}
        {filtersOpen &&
          children &&
          mounted &&
          createPortal(
            <div
              data-mobile-filters="true"
              className="md:hidden fixed inset-0 z-[9999] flex flex-col justify-end bg-slate-900/30 animate-in fade-in duration-150"
              onClick={onToggleFilters}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-h-[85vh] bg-white rounded-t-2xl border-t border-slate-200/90 shadow-none flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
              >
                <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
                  <span className="text-sm font-bold text-slate-900 font-jakarta">
                    {filterTriggerLabel}
                  </span>
                  <button
                    type="button"
                    onClick={onToggleFilters}
                    aria-label="Cerrar filtros"
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center border-none cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-5 py-3 overflow-y-auto flex-1 min-h-0 flex flex-col gap-4">
                  {children}
                </div>

                <div className="px-5 pt-2 pb-5 flex items-center justify-between gap-3 shrink-0">
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
                        Aplicar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>

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
