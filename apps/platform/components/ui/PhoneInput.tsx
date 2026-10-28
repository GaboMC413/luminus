"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { COUNTRIES as ALL_COUNTRIES } from "@/utils/countries";
import { AsYouType, CountryCode, getExampleNumber } from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";

const getCountryMaxLength = (countryCode: string): number => {
  if (countryCode === "XX") return 15;
  try {
    const example = getExampleNumber(countryCode as CountryCode, examples);
    if (example) {
      const nationalNumStr = example.formatNational().replace(/\D/g, "");
      return nationalNumStr.length;
    }
  } catch (err) {
    console.error("Error getting example number length:", err);
  }
  return 12;
};

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  phoneCountry: { code: string; dial: string; name: string; priority?: boolean };
  onCountryChange: (country: any) => void;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  phoneCountry,
  onCountryChange,
  disabled = false,
  className = "",
  error = false,
}: PhoneInputProps) {
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const instanceIdRef = useRef(Math.random().toString(36).substring(2, 9));

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowPhoneDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleOtherSelectOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.id !== instanceIdRef.current) {
        setShowPhoneDropdown(false);
      }
    };
    window.addEventListener("luminus-select-open", handleOtherSelectOpen);
    return () => window.removeEventListener("luminus-select-open", handleOtherSelectOpen);
  }, []);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect) {
        const preferredMaxHeight = 280;
        const spaceBelow = window.innerHeight - rect.bottom - 16;
        const spaceAbove = rect.top - 16;

        let top: number | undefined = rect.bottom + 4;
        let bottom: number | undefined = undefined;
        let maxHeight = preferredMaxHeight;

        if (spaceBelow < 120 && spaceAbove > spaceBelow) {
          top = undefined;
          bottom = window.innerHeight - rect.top + 4;
          maxHeight = Math.min(preferredMaxHeight, spaceAbove);
        } else {
          maxHeight = Math.min(preferredMaxHeight, spaceBelow);
        }

        maxHeight = Math.max(maxHeight, 100);

        setCoords({
          top,
          bottom,
          left: rect.left,
          width: 240,
          maxHeight,
        });
      }
    }
  };

  React.useLayoutEffect(() => {
    if (showPhoneDropdown) {
      updateCoords();
      const handleScroll = (event: Event) => {
        if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
          return;
        }
        setShowPhoneDropdown(false);
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
  }, [showPhoneDropdown]);

  const handleNumberChange = (rawValue: string) => {
    let processedValue = rawValue;
    let selectedCountry = phoneCountry;

    const cleanRaw = rawValue.trim();
    const digitsOnly = cleanRaw.replace(/\D/g, "");

    const sortedCountries = [...ALL_COUNTRIES].sort(
      (a, b) => b.dial.replace(/\D/g, "").length - a.dial.replace(/\D/g, "").length
    );

    if (cleanRaw.startsWith("+")) {
      for (const c of sortedCountries) {
        const dialDigits = c.dial.replace(/\D/g, "");

        if (digitsOnly.startsWith(dialDigits)) {
          selectedCountry = c;
          onCountryChange(c);
          processedValue = digitsOnly.slice(dialDigits.length);
          break;
        }
      }
    }

    const maxLength = getCountryMaxLength(selectedCountry.code);
    const onlyDigits = processedValue.replace(/\D/g, "");
    const truncatedDigits = onlyDigits.slice(0, maxLength);

    let formatted = truncatedDigits;
    if (selectedCountry.code !== "XX") {
      const formatter = new AsYouType(selectedCountry.code as CountryCode);
      formatted = formatter.input(truncatedDigits);
    }
    onChange(formatted);
  };

  const handleCountrySelect = (c: any) => {
    onCountryChange(c);
    setShowPhoneDropdown(false);

    const maxLength = getCountryMaxLength(c.code);
    const currentVal = value || "";
    const onlyDigits = currentVal.replace(/\D/g, "").slice(0, maxLength);
    if (c.code !== "XX") {
      const formatter = new AsYouType(c.code as CountryCode);
      onChange(formatter.input(onlyDigits));
    } else {
      onChange(onlyDigits);
    }
  };

  const dropdownCountries = ALL_COUNTRIES;

  const phoneDropdown = coords && (
    <div
      ref={dropdownRef}
      data-select-portal="true"
      style={{
        position: "fixed",
        top: coords.top !== undefined ? `${coords.top}px` : "auto",
        bottom: coords.bottom !== undefined ? `${coords.bottom}px` : "auto",
        left: `${coords.left}px`,
        width: `${coords.width}px`,
        maxHeight: `${coords.maxHeight}px`,
        zIndex: 10000,
      }}
      className="bg-white rounded-xl border border-zinc-200/90 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.08)] overflow-y-auto overflow-x-hidden overscroll-contain animate-in fade-in duration-150"
    >
      {dropdownCountries.map((c) => {
        const isSelected = phoneCountry.code === c.code;
        return (
          <div
            key={c.code}
            onClick={(e) => {
              e.stopPropagation();
              handleCountrySelect(c);
            }}
            className={`px-3.5 py-2.5 cursor-pointer transition-colors flex items-center group w-full truncate text-xs sm:text-[13px] ${
              isSelected
                ? "bg-slate-100 font-semibold text-slate-900"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span className="truncate whitespace-nowrap font-sans">
              {c.name} ({c.dial})
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      ref={containerRef}
      style={{ scrollMarginTop: "100px" }}
      className={`w-full h-12 px-4 bg-white border border-zinc-200/90 rounded-xl focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 transition-colors flex items-center relative ${className} ${
        disabled ? "pointer-events-none opacity-50" : ""
      } ${error ? "!border-red-500 !ring-red-500" : ""}`}
    >
      <div
        className={`relative flex items-center pr-2.5 shrink-0 h-full border-r border-zinc-200/80 mr-2.5 ${
          !disabled ? "cursor-pointer" : ""
        }`}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) {
            const nextOpen = !showPhoneDropdown;
            setShowPhoneDropdown(nextOpen);
            if (nextOpen) {
              window.dispatchEvent(
                new CustomEvent("luminus-select-open", { detail: { id: instanceIdRef.current } })
              );
              if (typeof window !== "undefined" && window.innerWidth < 768) {
                setTimeout(() => {
                  containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 150);
              }
            }
          }
        }}
      >
        <span
          className={`${
            phoneCountry.dial === "+00" ? "!text-slate-400" : "text-slate-900"
          } text-sm font-normal mr-2 font-sans`}
        >
          {phoneCountry.dial}
        </span>
        {!disabled && (
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            className={`transition-transform duration-200 ${
              showPhoneDropdown ? "rotate-180" : ""
            }`}
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <input
        type="tel"
        placeholder="Número de celular"
        value={value}
        disabled={disabled}
        onChange={(e) => handleNumberChange(e.target.value)}
        className="flex-1 bg-transparent px-2 outline-none text-slate-900 text-sm font-normal placeholder:text-slate-400 h-full font-sans"
        enterKeyHint="done"
        autoComplete="tel"
      />

      {showPhoneDropdown && mounted && coords && createPortal(phoneDropdown, document.body)}
    </div>
  );
}
