"use client";

import React, { useState, useEffect, useRef } from "react";
import usePlacesAutocomplete, { getGeocode } from "use-places-autocomplete";

export interface BillingAddressData {
  address: string;
  city: string;
  country: string;
  countryCode?: string;
  postalCode: string;
}

interface BillingAddressInputProps {
  defaultValue?: string;
  onAddressSelect: (data: BillingAddressData) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function BillingAddressInput({
  defaultValue = "",
  onAddressSelect,
  placeholder = "Dirección de facturación (Calle y número)",
  label,
  className = "",
  disabled = false,
}: BillingAddressInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const isTypingRef = useRef(false);
  const prevDefaultValueRef = useRef(defaultValue);

  const {
    ready,
    value,
    suggestions: { status, data: suggestions },
    setValue,
    clearSuggestions,
    init,
  } = usePlacesAutocomplete({
    defaultValue,
    debounce: 300,
  });

  // Ensure Google Places initializes if the script finishes loading after mount
  useEffect(() => {
    if (ready) return;
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).google?.maps?.places) {
        init();
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [ready, init]);

  // Keep internal value synced only when defaultValue changes externally (not while typing)
  useEffect(() => {
    if (defaultValue !== prevDefaultValueRef.current) {
      prevDefaultValueRef.current = defaultValue;
      if (!isTypingRef.current) {
        setValue(defaultValue || "", false);
      }
    }
  }, [defaultValue, setValue]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        clearSuggestions();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [clearSuggestions]);

  const handleSelectSuggestion = async (description: string) => {
    isTypingRef.current = false;
    prevDefaultValueRef.current = description;
    setValue(description, false);
    clearSuggestions();
    setHighlightedIndex(-1);

    // Immediately set the selected address string
    onAddressSelect({
      address: description,
      city: "",
      country: "",
      postalCode: "",
    });

    try {
      const results = await getGeocode({ address: description });
      const addressComponents = results[0]?.address_components || [];

      const countryComp = addressComponents.find((c: any) => c.types.includes("country"));
      const postalCodeComp = addressComponents.find((c: any) => c.types.includes("postal_code"));
      const localityComp = addressComponents.find(
        (c: any) =>
          c.types.includes("locality") ||
          c.types.includes("sublocality") ||
          c.types.includes("postal_town") ||
          c.types.includes("administrative_area_level_2")
      );

      const city = localityComp ? localityComp.long_name : "";
      const country = countryComp ? countryComp.long_name : "";
      const countryCode = countryComp ? countryComp.short_name : "";
      const postalCode = postalCodeComp ? postalCodeComp.long_name : "";

      onAddressSelect({
        address: description,
        city,
        country,
        countryCode,
        postalCode,
      });
    } catch (err) {
      console.error("Geocoding failed for billing address:", err);
    }
  };

  const hasSuggestions = status === "OK" && suggestions.length > 0;

  return (
    <div ref={containerRef} className={`relative w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 font-jakarta">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const nextVal = e.target.value;
            isTypingRef.current = true;
            setValue(nextVal);
            onAddressSelect({
              address: nextVal,
              city: "",
              country: "",
              postalCode: "",
            });
            setHighlightedIndex(-1);
          }}
          onBlur={() => {
            isTypingRef.current = false;
          }}
          onKeyDown={(e) => {
            if (!hasSuggestions) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
            } else if (e.key === "Enter" && highlightedIndex >= 0) {
              e.preventDefault();
              handleSelectSuggestion(suggestions[highlightedIndex].description);
            } else if (e.key === "Escape") {
              clearSuggestions();
            }
          }}
          placeholder={placeholder}
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          name="luminus_place_lookup"
          id="luminus_place_lookup"
          data-lpignore="true"
          data-1p-ignore="true"
          data-bwignore="true"
          data-form-type="other"
          className="w-full h-12 pl-4 pr-10 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 font-sans"
        />
        <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
          home_pin
        </span>
      </div>

      {/* Autocomplete Dropdown */}
      {hasSuggestions && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-xl border border-zinc-200/90 z-50 max-h-56 overflow-y-auto overflow-x-hidden"
        >
          {suggestions.map((suggestion, index) => {
            const isHighlighted = index === highlightedIndex;
            return (
              <div
                key={suggestion.place_id}
                onClick={() => handleSelectSuggestion(suggestion.description)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  isHighlighted ? "bg-slate-100 text-slate-900" : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">
                  location_on
                </span>
                <span className="truncate">
                  <strong className="font-semibold text-slate-900">
                    {suggestion.structured_formatting.main_text}
                  </strong>{" "}
                  <span className="text-slate-500">
                    {suggestion.structured_formatting.secondary_text}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
