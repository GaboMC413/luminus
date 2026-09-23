"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { sortLatamFirst } from '@/utils/locationUtils';

interface LocationInputProps {
  defaultValue?: string;
  onSelect: (data: { city: string; country?: string; countryCode?: string }) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
}

export const LocationInput = React.forwardRef<HTMLInputElement, LocationInputProps>(({
  defaultValue = '',
  onSelect,
  placeholder = 'Ingresa tu ciudad',
  className = '',
  label,
  required = false
}, ref) => {
  const [value, setValue] = useState(defaultValue);
  const [predictions, setPredictions] = useState<Array<{ place_id: string; description: string; main_text: string; secondary_text?: string }>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number; width: number; maxHeight: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const autocompleteServiceRef = useRef<any>(null);

  const getAutocompleteService = () => {
    if (autocompleteServiceRef.current) return autocompleteServiceRef.current;
    if (typeof window !== 'undefined' && (window as any).google?.maps?.places) {
      autocompleteServiceRef.current = new (window as any).google.maps.places.AutocompleteService();
      return autocompleteServiceRef.current;
    }
    return null;
  };

  useEffect(() => {
    setMounted(true);
    getAutocompleteService();
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (defaultValue !== value) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  // Handle outside click
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect) {
        const vHeight = typeof window !== 'undefined' && window.visualViewport
          ? window.visualViewport.height
          : window.innerHeight;

        const preferredMaxHeight = 240;
        const spaceBelow = vHeight - rect.bottom - 12;
        const spaceAbove = rect.top - 12;

        let top: number | undefined = rect.bottom + 4;
        let bottom: number | undefined = undefined;
        let maxHeight = preferredMaxHeight;

        // Open upwards if space below is tight (< 160px) and space above is larger
        if (spaceBelow < 160 && spaceAbove > spaceBelow) {
          top = undefined;
          bottom = vHeight - rect.top + 4;
          maxHeight = Math.min(preferredMaxHeight, Math.max(spaceAbove, 120));
        } else {
          maxHeight = Math.min(preferredMaxHeight, Math.max(spaceBelow, 120));
        }

        setCoords({
          top,
          bottom,
          left: rect.left,
          width: rect.width,
          maxHeight
        });
      }
    }
  };

  const fetchPredictions = (inputVal: string) => {
    if (!inputVal || inputVal.trim().length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    const service = getAutocompleteService();
    if (service) {
      service.getPlacePredictions(
        { input: inputVal.trim(), types: ['(cities)'] },
        (results: any[], status: string) => {
          if (status === 'OK' && results && results.length > 0) {
            const formatted = results.map((item) => ({
              place_id: item.place_id,
              description: item.description,
              main_text: item.structured_formatting?.main_text || item.description.split(',')[0],
              secondary_text: item.structured_formatting?.secondary_text || item.description.split(',').slice(1).join(',')
            }));

            // Prioritize Latin American results
            const sorted = sortLatamFirst(formatted);

            setPredictions(sorted);
            setIsOpen(true);
            updateCoords();
          } else {
            setPredictions([]);
            setIsOpen(false);
          }
        }
      );
    } else {
      setPredictions([]);
      setIsOpen(false);
    }
  };

  React.useLayoutEffect(() => {
    if (isOpen && predictions.length > 0) {
      updateCoords();
      const handleScroll = () => updateCoords();
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', updateCoords);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateCoords);
      }
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', updateCoords);
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', updateCoords);
        }
      };
    }
  }, [isOpen, predictions.length]);

  const handleSelect = (description: string, main_text?: string, secondary_text?: string) => {
    let cityOnly = main_text || description.split(',')[0].trim();
    let countryOnly = '';
    if (secondary_text) {
      const parts = secondary_text.split(',').map(s => s.trim());
      countryOnly = parts[parts.length - 1] || '';
      const secondPart = parts[0];
      cityOnly = `${cityOnly}, ${secondPart}`;
    }
    setValue(cityOnly);
    onSelect({ city: cityOnly, country: countryOnly });
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const suggestionsDropdown = coords && isOpen && predictions.length > 0 && (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: coords.top !== undefined ? `${coords.top}px` : 'auto',
        bottom: coords.bottom !== undefined ? `${coords.bottom}px` : 'auto',
        left: `${coords.left}px`,
        width: `${coords.width}px`,
        maxHeight: `${coords.maxHeight}px`,
        zIndex: 10000,
      }}
      className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-y-auto pr-1 animate-in fade-in duration-150 py-1"
    >
      {predictions.map((p, index) => (
        <div
          key={p.place_id}
          onClick={() => handleSelect(p.description, p.main_text, p.secondary_text)}
          onMouseEnter={() => setHighlightedIndex(index)}
          className={`px-4 py-2.5 cursor-pointer transition flex flex-col min-w-0 ${
            highlightedIndex === index ? 'bg-slate-100' : 'hover:bg-slate-50'
          }`}
        >
          <span className="text-slate-900 text-sm font-medium truncate">
            {p.main_text}
            {p.secondary_text ? `, ${p.secondary_text.split(',')[0]}` : ''}
          </span>
          {p.secondary_text && (
            <span className="text-xs text-slate-400 font-light truncate">
              {p.secondary_text.split(',').pop()?.trim()}
            </span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className={`flex flex-col gap-1.5 relative w-full ${className}`} ref={containerRef}>
      {label && <label className="text-xs font-medium text-slate-700">{label}</label>}
      <input
        ref={ref}
        type="text"
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const nextVal = e.target.value;
          setValue(nextVal);
          onSelect({ city: nextVal });
          fetchPredictions(nextVal);
        }}
        onFocus={() => {
          if (value && value.trim().length >= 2) {
            fetchPredictions(value);
          }
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setTimeout(() => {
              containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 150);
          }
        }}
        onKeyDown={(e) => {
          if (!isOpen || predictions.length === 0) return;

          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev + 1) % predictions.length);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev - 1 + predictions.length) % predictions.length);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            const p = highlightedIndex >= 0 ? predictions[highlightedIndex] : predictions[0];
            handleSelect(p.description, p.main_text, p.secondary_text);
          }
        }}
        className="w-full h-12 px-5 text-base font-normal text-slate-900 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors placeholder:text-slate-400"
      />

      {mounted && createPortal(suggestionsDropdown, document.body)}
    </div>
  );
});

LocationInput.displayName = 'LocationInput';
export default LocationInput;
