"use client";

import React, { useState, useEffect, useRef } from "react";
import usePlacesAutocomplete, { getGeocode } from "use-places-autocomplete";
import { InputField } from "./InputField";
import { sortLatamFirst } from "@/utils/locationUtils";
import { MapPin } from "lucide-react";

interface LocationInputProps {
  defaultValue?: string;
  onSelect: (data: { city: string; country: string; countryCode?: string }) => void;
  placeholder?: string;
  variant?: "clean" | "bordered";
  className?: string;
  inputClassName?: string;
  label?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  name?: string;
  id?: string;
  autoComplete?: string;
}

export const LocationInput = React.forwardRef<HTMLInputElement, LocationInputProps>(
  (
    {
      defaultValue = "",
      onSelect,
      placeholder = "Ingresa tu ciudad",
      variant = "bordered",
      className = "",
      inputClassName = "",
      label,
      disabled = false,
      autoFocus,
      name = "luminus_location_search",
      id = "luminus_location_search",
    },
    ref
  ) => {
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const {
      ready,
      value,
      suggestions: { status, data: suggestions },
      setValue,
      clearSuggestions,
      init,
    } = usePlacesAutocomplete({
      defaultValue,
      requestOptions: { types: ["(cities)"] },
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

    // Reorder predictions: LatAm countries first, then rest of the world
    const sortedSuggestions = React.useMemo(() => {
      return sortLatamFirst(suggestions);
    }, [suggestions]);

    const instanceIdRef = useRef(Math.random().toString(36).substring(2, 9));
    const lastResolvedValueRef = useRef(defaultValue);

    // Listen to global open broadcasts to close suggestions when another dropdown opens
    useEffect(() => {
      const handleOtherSelectOpen = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail?.id !== instanceIdRef.current) {
          clearSuggestions();
        }
      };
      window.addEventListener("luminus-select-open", handleOtherSelectOpen);
      return () => window.removeEventListener("luminus-select-open", handleOtherSelectOpen);
    }, [clearSuggestions]);

    // Close dropdown when clicking outside
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

    const scrollToInputTop = () => {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setTimeout(() => {
          containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    };

    const isTypingRef = useRef(false);
    const prevDefaultValueRef = useRef(defaultValue);

    useEffect(() => {
      if (defaultValue !== prevDefaultValueRef.current) {
        prevDefaultValueRef.current = defaultValue;
        if (!isTypingRef.current) {
          setValue(defaultValue || "", false);
          lastResolvedValueRef.current = defaultValue;
        }
      }
    }, [defaultValue, setValue]);

    const extractCityAndCountry = (
      description: string,
      mainText?: string,
      secondaryText?: string
    ) => {
      const parts = description
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      const cityName = (mainText || parts[0] || description).split(",")[0].trim();
      const countryName = secondaryText
        ? secondaryText.split(",").pop()?.trim() || ""
        : parts.length > 1
        ? parts[parts.length - 1]
        : "";
      const displayValue =
        countryName && countryName.toLowerCase() !== cityName.toLowerCase()
          ? `${cityName}, ${countryName}`
          : cityName;
      return { cityName, countryName, displayValue };
    };

    const handleSelect = async (
      description: string,
      mainText?: string,
      secondaryText?: string
    ) => {
      const { cityName, countryName, displayValue } = extractCityAndCountry(
        description,
        mainText,
        secondaryText
      );

      isTypingRef.current = false;
      prevDefaultValueRef.current = displayValue;
      setValue(displayValue, false);
      clearSuggestions();
      lastResolvedValueRef.current = displayValue;

      // Immediately update with clean City and Country
      onSelect({
        city: cityName,
        country: countryName,
      });

      try {
        const results = await getGeocode({ address: description });
        const addressComponents = results[0]?.address_components || [];
        const countryComp = addressComponents.find((c: any) => c.types.includes("country"));
        const resolvedCountry = countryComp ? countryComp.long_name : countryName;
        const resolvedDisplay =
          resolvedCountry && resolvedCountry.toLowerCase() !== cityName.toLowerCase()
            ? `${cityName}, ${resolvedCountry}`
            : cityName;

        prevDefaultValueRef.current = resolvedDisplay;
        setValue(resolvedDisplay, false);

        onSelect({
          city: cityName,
          country: resolvedCountry,
          countryCode: countryComp ? countryComp.short_name : "",
        });

        setHighlightedIndex(-1);
      } catch (error) {
        console.error("Error getting geocode: ", error);
        setHighlightedIndex(-1);
      }
    };

    const hasOpenSuggestions = status === "OK" && sortedSuggestions.length > 0;

    return (
      <div
        className={`relative w-full ${className}`}
        ref={containerRef}
        style={{ scrollMarginTop: "16px" }}
      >
        <InputField
          ref={ref}
          id={id}
          name={name}
          label={label}
          placeholder={placeholder}
          value={value}
          className={inputClassName}
          rightIcon={<MapPin className="w-4 h-4 text-slate-400" />}
          onChange={(e) => {
            const nextValue = e.target.value;
            isTypingRef.current = true;
            setValue(nextValue);
            const rawParts = nextValue.split(",").map((p) => p.trim());
            onSelect({
              city: rawParts[0] || "",
              country: rawParts.length > 1 ? rawParts[rawParts.length - 1] : "",
            });
            setHighlightedIndex(-1);
            window.dispatchEvent(
              new CustomEvent("luminus-select-open", { detail: { id: instanceIdRef.current } })
            );
            scrollToInputTop();
          }}
          onBlur={() => {
            isTypingRef.current = false;
          }}
          onFocus={() => {
            window.dispatchEvent(
              new CustomEvent("luminus-select-open", { detail: { id: instanceIdRef.current } })
            );
            scrollToInputTop();
          }}
          onKeyDown={(e) => {
            if (!hasOpenSuggestions) {
              if (e.key === "Escape") {
                clearSuggestions();
              }
              return;
            }

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlightedIndex((prev) => (prev + 1) % sortedSuggestions.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlightedIndex(
                (prev) => (prev - 1 + sortedSuggestions.length) % sortedSuggestions.length
              );
            } else if (e.key === "Enter") {
              e.preventDefault();
              const s =
                highlightedIndex >= 0
                  ? sortedSuggestions[highlightedIndex]
                  : sortedSuggestions[0];
              handleSelect(
                s.description,
                s.structured_formatting?.main_text,
                s.structured_formatting?.secondary_text
              );
            } else if (e.key === "Escape") {
              e.preventDefault();
              clearSuggestions();
            }
          }}
          disabled={disabled}
          variant={variant}
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-lpignore="true"
          data-1p-ignore="true"
          data-form-type="other"
          enterKeyHint="next"
          autoFocus={autoFocus}
        />

        {hasOpenSuggestions && (
          <div
            ref={dropdownRef}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white rounded-xl border border-zinc-200/90 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.08)] overflow-y-auto overflow-x-hidden overscroll-contain max-h-[190px] sm:max-h-[250px] animate-in fade-in duration-150"
          >
            {sortedSuggestions.map(({ place_id, description, structured_formatting }, index) => {
              const { cityName, countryName } = extractCityAndCountry(
                description,
                structured_formatting?.main_text,
                structured_formatting?.secondary_text
              );
              const isHighlighted = highlightedIndex === index;
              return (
                <div
                  key={place_id}
                  onClick={() =>
                    handleSelect(
                      description,
                      structured_formatting?.main_text,
                      structured_formatting?.secondary_text
                    )
                  }
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-3.5 py-2.5 cursor-pointer transition-colors flex items-center gap-2 min-w-0 text-xs ${
                    isHighlighted
                      ? "bg-slate-100 text-slate-900"
                      : "bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    <strong className="font-semibold text-slate-900">{cityName}</strong>
                    {countryName ? <span className="text-slate-500">{`, ${countryName}`}</span> : null}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

LocationInput.displayName = "LocationInput";
export default LocationInput;
