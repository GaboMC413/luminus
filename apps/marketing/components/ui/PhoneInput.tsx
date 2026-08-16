"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { COUNTRIES, Country } from "@/lib/countries";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  phoneCountry?: Country | null;
  onCountryChange?: (country: Country) => void;
  placeholder?: string;
  disabled?: boolean;
  dark?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  phoneCountry = null,
  onCountryChange,
  placeholder = "Teléfono",
  disabled = false,
  dark = false,
}: PhoneInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number; width: number; maxHeight: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect) {
        const preferredMaxHeight = 220;
        const spaceBelow = window.innerHeight - rect.bottom - 12;
        const spaceAbove = rect.top - 12;

        let top: number | undefined = rect.bottom + 4;
        let bottom: number | undefined = undefined;
        let maxHeight = preferredMaxHeight;

        if (spaceBelow < 140 && spaceAbove > spaceBelow) {
          top = undefined;
          bottom = window.innerHeight - rect.top + 4;
          maxHeight = Math.min(preferredMaxHeight, spaceAbove);
        } else {
          maxHeight = Math.min(preferredMaxHeight, spaceBelow);
        }

        setCoords({
          top,
          bottom,
          left: rect.left,
          width: 220,
          maxHeight: Math.max(maxHeight, 120),
        });
      }
    }
  };

  useEffect(() => {
    if (showDropdown) {
      updateCoords();
      const handleScroll = (event: Event) => {
        if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
          return;
        }
        setShowDropdown(false);
      };
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", updateCoords);
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", updateCoords);
      };
    } else {
      setCoords(null);
    }
  }, [showDropdown]);

  const handleCountrySelect = (c: Country) => {
    if (onCountryChange) {
      onCountryChange(c);
    }
    setShowDropdown(false);
  };

  const dropdownPortal = coords && mounted && (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: coords.top !== undefined ? `${coords.top}px` : "auto",
        bottom: coords.bottom !== undefined ? `${coords.bottom}px` : "auto",
        left: `${coords.left}px`,
        width: `${coords.width}px`,
        maxHeight: `${coords.maxHeight}px`,
        zIndex: 10000,
      }}
      className={`rounded-2xl p-1.5 border shadow-none overflow-y-auto overscroll-contain animate-in fade-in duration-150 ${
        dark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      {COUNTRIES.map((c) => (
        <div
          key={c.code}
          onClick={(e) => {
            e.stopPropagation();
            handleCountrySelect(c);
          }}
          className={`px-3.5 py-2 rounded-xl cursor-pointer transition-colors flex items-center group w-full truncate text-sm ${
            dark
              ? phoneCountry?.code === c.code
                ? "font-semibold text-white bg-zinc-800"
                : "text-zinc-300 hover:text-white hover:bg-zinc-800/60"
              : phoneCountry?.code === c.code
              ? "font-semibold text-slate-900 bg-slate-100"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <span className="truncate whitespace-nowrap transition-colors font-normal">
            {c.name} ({c.dial})
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`w-full h-12 px-4 rounded-2xl transition-colors flex items-center relative ${
        dark
          ? "bg-zinc-900 border border-zinc-800 focus-within:border-white focus-within:ring-1 focus-within:ring-white"
          : "bg-white border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Country Selector Trigger */}
      <div
        className={`flex items-center gap-1.5 pr-3 shrink-0 h-full border-r cursor-pointer select-none ${
          dark ? "border-zinc-800" : "border-slate-200"
        }`}
        onClick={() => !disabled && setShowDropdown(!showDropdown)}
      >
        {phoneCountry ? (
          <span className={`text-base font-normal ${dark ? "text-white" : "text-slate-900"}`}>
            {phoneCountry.dial}
          </span>
        ) : (
          <span
            className={`material-symbols-outlined text-[19px] select-none ${dark ? "text-zinc-400" : "text-slate-400"}`}
            style={{ fontVariationSettings: "'wght' 300", fontWeight: 300 }}
          >
            language
          </span>
        )}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
        >
          <path d="M1 1L5 5L9 1" stroke={dark ? "#A1A1AA" : "#94A3B8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Phone Number Input */}
      <input
        type="tel"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-full bg-transparent px-3 text-base font-normal focus:outline-none ${
          dark ? "text-white placeholder:text-zinc-500" : "text-slate-900 placeholder:text-slate-400"
        }`}
      />

      {showDropdown && dropdownPortal && createPortal(dropdownPortal, document.body)}
    </div>
  );
}
