"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
    getAutocompleteService();
  }, []);

  useEffect(() => {
    if (defaultValue !== value) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const scrollToInputTop = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
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
            scrollToInputTop();
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

  const hasOpenPredictions = isOpen && predictions.length > 0;

  return (
    <div 
      className={`flex flex-col gap-1.5 relative w-full ${className}`} 
      ref={containerRef}
      style={{ scrollMarginTop: '16px' }}
    >
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
          scrollToInputTop();
        }}
        onKeyDown={(e) => {
          if (!hasOpenPredictions) {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
            return;
          }

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
          } else if (e.key === 'Escape') {
            e.preventDefault();
            setIsOpen(false);
          }
        }}
        className="w-full h-12 px-5 text-base font-normal text-slate-900 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors placeholder:text-slate-400"
      />

      {hasOpenPredictions && (
        <div
          ref={dropdownRef}
          onMouseDown={(e) => {
            // Prevent blur on mobile / desktop before click/selection happens
            e.preventDefault();
          }}
          className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-y-auto overscroll-contain max-h-[190px] sm:max-h-[250px] pr-1 animate-in fade-in duration-150 py-1"
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
      )}
    </div>
  );
});

LocationInput.displayName = 'LocationInput';
export default LocationInput;
