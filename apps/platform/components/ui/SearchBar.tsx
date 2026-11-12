"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  X,
  User,
  MapPin,
  Globe,
  Sparkles,
  Briefcase,
} from "lucide-react";

export interface SearchSuggestion {
  label: string;
  value: string;
  category: string;
  icon?: "user" | "city" | "country" | "interest" | "title" | "area";
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onSubmit?: (value: string) => void;
  suggestions?: SearchSuggestion[];
  onSelectSuggestion?: (suggestion: SearchSuggestion) => void;
  submitLabel?: string;
  showSubmitButton?: boolean;
  className?: string;
  autoFocus?: boolean;
}

function SuggestionIcon({ type }: { type?: SearchSuggestion["icon"] }) {
  const iconClass = "w-4 h-4 text-slate-400 shrink-0";
  switch (type) {
    case "user":
      return <User className={iconClass} />;
    case "city":
      return <MapPin className={iconClass} />;
    case "country":
      return <Globe className={iconClass} />;
    case "title":
      return <Briefcase className={iconClass} />;
    case "interest":
    case "area":
    default:
      return <Sparkles className={iconClass} />;
  }
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  onClear,
  onSubmit,
  suggestions = [],
  onSelectSuggestion,
  submitLabel = "Buscar",
  showSubmitButton,
  className = "",
  autoFocus = false,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const shouldShowSubmit = showSubmitButton ?? Boolean(onSubmit);
  const showSuggestions = isFocused && suggestions.length > 0 && value.trim().length >= 2;

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [value, suggestions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleClear = () => {
    onChange("");
    onClear?.();
    onSubmit?.("");
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleExecuteSubmit = () => {
    setIsFocused(false);
    onSubmit?.(value.trim());
  };

  const handlePickSuggestion = (suggestion: SearchSuggestion) => {
    onChange(suggestion.value);
    setIsFocused(false);
    setHighlightedIndex(-1);
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    } else {
      onSubmit?.(suggestion.value);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="w-full h-11 pl-3.5 pr-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2 focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 transition-colors">
        <Search
          className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none"
          strokeWidth={2}
        />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isFocused) setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && showSuggestions) {
              e.preventDefault();
              setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
            } else if (e.key === "ArrowUp" && showSuggestions) {
              e.preventDefault();
              setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (showSuggestions && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                handlePickSuggestion(suggestions[highlightedIndex]);
              } else {
                handleExecuteSubmit();
              }
            } else if (e.key === "Escape") {
              setIsFocused(false);
            }
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 min-w-0 h-full bg-transparent border-none text-xs sm:text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none p-0"
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center shrink-0"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        )}

        {shouldShowSubmit && (
          <button
            type="button"
            onClick={handleExecuteSubmit}
            className={`h-7 sm:h-8 px-3 rounded-lg text-xs font-semibold font-jakarta transition-colors shrink-0 border-none cursor-pointer flex items-center justify-center ${
              value.trim()
                ? "bg-slate-900 text-white hover:bg-black"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
            }`}
          >
            {submitLabel}
          </button>
        )}
      </div>

      {/* Categorized Predictive Suggestions Dropdown */}
      {showSuggestions && (
        <div
          role="listbox"
          className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white border border-slate-200/90 rounded-2xl shadow-none overflow-hidden py-1.5 animate-in fade-in-0 zoom-in-98 duration-150"
        >
          {suggestions.map((suggestion, idx) => {
            const isHighlighted = idx === highlightedIndex;
            return (
              <button
                key={`${suggestion.category}-${suggestion.value}-${idx}`}
                type="button"
                role="option"
                aria-selected={isHighlighted}
                onMouseDown={(e) => {
                  // Prevent input blur before click registers
                  e.preventDefault();
                  handlePickSuggestion(suggestion);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-3 transition-colors border-none cursor-pointer ${
                  isHighlighted ? "bg-slate-50" : "bg-transparent hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <SuggestionIcon type={suggestion.icon} />
                  <span className="text-xs sm:text-sm font-medium text-slate-900 font-sans truncate">
                    {suggestion.label}
                  </span>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 font-jakarta shrink-0 bg-slate-100/80 px-2 py-0.5 rounded-md">
                  {suggestion.category}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default SearchBar;
