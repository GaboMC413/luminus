"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import usePlacesAutocomplete, {
  getGeocode,
} from "use-places-autocomplete";
import { InputField } from './InputField';

interface LocationInputProps {
  defaultValue?: string;
  onSelect: (data: { city: string; country: string; countryCode?: string }) => void;
  placeholder?: string;
  variant?: 'clean' | 'bordered';
  className?: string;
  label?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const LocationInput = React.forwardRef<HTMLInputElement, LocationInputProps>(({
  defaultValue = '',
  onSelect,
  placeholder = 'Busca tu ciudad',
  variant = 'bordered',
  className = '',
  label,
  disabled = false,
  autoFocus
}, ref) => {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const {
    ready,
    value,
    suggestions: { status, data: suggestions },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    defaultValue,
    requestOptions: { types: ["(cities)"] },
    debounce: 300,
  });

  const instanceIdRef = useRef(Math.random().toString(36).substring(2, 9));

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Listen to global open broadcasts to close suggestions when another dropdown opens
  useEffect(() => {
    const handleOtherSelectOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.id !== instanceIdRef.current) {
        clearSuggestions();
      }
    };
    window.addEventListener('luminus-select-open', handleOtherSelectOpen);
    return () => window.removeEventListener('luminus-select-open', handleOtherSelectOpen);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        clearSuggestions();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect) {
        setCoords({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width
        });
      }
    }
  };

  React.useLayoutEffect(() => {
    if (status === "OK") {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    } else {
      setCoords(null);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [status]);

  useEffect(() => {
    if (defaultValue !== value) {
      setValue(defaultValue, false);
    }
  }, [defaultValue]);

  const handleSelect = async (description: string, mainText?: string, secondaryText?: string) => {
    let formatted = description;
    if (mainText && secondaryText) {
      const secondaryPart = secondaryText.split(',')[0].trim();
      formatted = `${mainText}, ${secondaryPart}`;
    } else {
      const parts = description.split(',').map(p => p.trim());
      formatted = parts.length > 1 ? parts.slice(0, -1).join(', ') : description;
    }

    setValue(formatted, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const addressComponents = results[0].address_components;
      const countryComp = addressComponents.find((c: any) => c.types.includes('country'));

      onSelect({
        city: formatted,
        country: countryComp ? countryComp.long_name : '',
        countryCode: countryComp ? countryComp.short_name : ''
      });

      setHighlightedIndex(-1);
    } catch (error) {
      console.error("Error getting geocode: ", error);
    }
  };

  const suggestionsDropdown = coords && (
    <div 
      ref={dropdownRef}
      style={{ 
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        width: coords.width,
        zIndex: 10000,
      }}
      className="bg-white rounded-[12px] outline outline-1 outline-zinc-200 overflow-y-auto max-h-[280px] custom-scrollbar animate-in fade-in duration-200"
    >
      {suggestions.map(({ place_id, description, structured_formatting }, index) => (
        <div
          key={place_id}
          onClick={() => handleSelect(description, structured_formatting.main_text, structured_formatting.secondary_text)}
          onMouseEnter={() => setHighlightedIndex(index)}
          className={`px-4 py-2.5 cursor-pointer transition flex flex-col min-w-0 ${highlightedIndex === index ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
        >
          <span className="text-black text-body text-secondary truncate whitespace-nowrap">
            {structured_formatting.main_text}
            {structured_formatting.secondary_text ? `, ${structured_formatting.secondary_text.split(',')[0]}` : ''}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
            {structured_formatting.secondary_text ? structured_formatting.secondary_text.split(',').pop()?.trim() : ''}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`flex flex-col gap-2 relative w-full ${className}`} ref={containerRef}>
      {label && <label className="text-label ml-1">{label}</label>}
      <InputField
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setHighlightedIndex(-1);
          window.dispatchEvent(new CustomEvent('luminus-select-open', { detail: { id: instanceIdRef.current } }));
        }}
        onFocus={() => {
          window.dispatchEvent(new CustomEvent('luminus-select-open', { detail: { id: instanceIdRef.current } }));
        }}
        onKeyDown={(e) => {
          if (status !== "OK" || suggestions.length === 0) return;

          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev + 1) % suggestions.length);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
          } else if (e.key === 'Enter' && highlightedIndex >= 0) {
            e.preventDefault();
            const s = suggestions[highlightedIndex];
            handleSelect(
              s.description,
              s.structured_formatting.main_text,
              s.structured_formatting.secondary_text
            );
          }
        }}
        disabled={disabled || !ready}
        variant={variant}
        autoComplete="new-password"
        enterKeyHint="next"
        autoFocus={autoFocus}
      />

      {status === "OK" && mounted && coords && createPortal(suggestionsDropdown, document.body)}
    </div>
  );
});

LocationInput.displayName = 'LocationInput';
export default LocationInput;
