"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: (string | SelectOption)[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  dark?: boolean;
}

export function CustomSelect({
  options,
  value,
  onSelect,
  placeholder = "Selecciona una opción",
  disabled = false,
  dark = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
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
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect) {
        const preferredMaxHeight = 240;
        const spaceBelow = window.innerHeight - rect.bottom - 12;
        const spaceAbove = rect.top - 12;

        let top: number | undefined = rect.bottom + 4;
        let bottom: number | undefined = undefined;
        let maxHeight = preferredMaxHeight;

        if (spaceBelow < 160 && spaceAbove > spaceBelow) {
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
          width: rect.width,
          maxHeight: Math.max(maxHeight, 140),
        });
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      const handleScroll = (event: Event) => {
        if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
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
  }, [isOpen]);

  const currentOptionLabel = typeof options[0] === "string"
    ? value
    : (options as SelectOption[]).find((opt) => opt.value === value)?.label;

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
      {options.map((option) => {
        const optLabel = typeof option === "string" ? option : option.label;
        const optValue = typeof option === "string" ? option : option.value;
        const isSelected = value === optValue;

        return (
          <div
            key={optValue}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(optValue);
              setIsOpen(false);
            }}
            className={`px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors text-sm ${
              dark
                ? isSelected
                  ? "bg-zinc-800 font-medium text-white"
                  : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                : isSelected
                ? "bg-slate-100 font-medium text-slate-900"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {optLabel}
          </div>
        );
      })}
    </div>
  );

  return (
    <div ref={containerRef} className="w-full relative">
      <div
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-12 px-5 rounded-2xl transition-colors flex items-center justify-between cursor-pointer select-none ${
          dark
            ? `bg-zinc-900 border border-zinc-800 text-white ${isOpen ? "border-white ring-1 ring-white" : "focus:border-white focus:ring-1 focus:ring-white"}`
            : `bg-white border border-slate-300 text-slate-900 ${isOpen ? "border-black ring-1 ring-black" : "focus:border-black focus:ring-1 focus:ring-black"}`
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className={`text-base font-normal truncate ${!value ? (dark ? "text-zinc-500" : "text-slate-400") : (dark ? "text-white" : "text-slate-900")}`}>
          {currentOptionLabel || placeholder}
        </span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`shrink-0 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M1 1L5 5L9 1" stroke={dark ? "#A1A1AA" : "#94A3B8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {isOpen && dropdownPortal && createPortal(dropdownPortal, document.body)}
    </div>
  );
}
