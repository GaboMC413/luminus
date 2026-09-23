"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import usePlacesAutocomplete, {
  getGeocode,
} from "use-places-autocomplete";
import { InputField } from './InputField';
import { sortLatamFirst } from '@/utils/locationUtils';

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
  placeholder = 'Ingresa tu ciudad',
  variant = 'bordered',
  className = '',
  label,
  disabled = false,
  autoFocus
}, ref) => {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
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

  // Reorder predictions: LatAm countries first, then rest of the world
  const sortedSuggestions = React.useMemo(() => {
    return sortLatamFirst(suggestions);
  }, [suggestions]);

  const instanceIdRef = useRef(Math.random().toString(36).substring(2, 9));
  const lastResolvedValueRef = useRef(defaultValue);

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
        const vHeight = typeof window !== 'undefined' && window.visualViewport
          ? window.visualViewport.height
          : window.innerHeight;

        const preferredMaxHeight = 260;
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

  React.useLayoutEffect(() => {
    if (status === "OK" && sortedSuggestions.length > 0) {
      updateCoords();
      const openedAt = Date.now();
      const handleScroll = (event: Event) => {
        if (Date.now() - openedAt < 500) {
          return;
        }
        if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
          return;
        }
        clearSuggestions();
      };
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', updateCoords);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateCoords);
      }
      
      // Auto-scroll so dropdown suggestions are fully visible above mobile keyboard
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setTimeout(() => {
          containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', updateCoords);
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', updateCoords);
        }
      };
    } else {
      setCoords(null);
    }
  }, [status, sortedSuggestions.length]);

  useEffect(() => {
    if (defaultValue !== value) {
      setValue(defaultValue, false);
      lastResolvedValueRef.current = defaultValue;
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
    lastResolvedValueRef.current = formatted;

    try {
      const results = await getGeocode({ address: description });
      const addressComponents = results[0]?.address_components || [];
      const countryComp = addressComponents.find((c: any) => c.types.includes('country'));

      onSelect({
        city: formatted,
        country: countryComp ? countryComp.long_name : '',
        countryCode: countryComp ? countryComp.short_name : ''
      });

      setHighlightedIndex(-1);
    } catch (error) {
      console.error("Error getting geocode: ", error);
      // Fallback in case getGeocode fails: still provide city
      onSelect({
        city: formatted,
        country: '',
      });
      setHighlightedIndex(-1);
    }
  };

  const suggestionsDropdown = coords && (
    <div 
      ref={dropdownRef}
      data-select-portal="true"
      style={{ 
        position: 'fixed',
        top: coords.top !== undefined ? `${coords.top}px` : 'auto',
        bottom: coords.bottom !== undefined ? `${coords.bottom}px` : 'auto',
        left: `${coords.left}px`,
        width: `${coords.width}px`,
        maxHeight: `${coords.maxHeight}px`,
        zIndex: 10000,
      }}
      className="bg-white rounded-[12px] outline outline-1 outline-zinc-200 overflow-y-auto overscroll-contain pr-1 animate-in fade-in duration-200 shadow-xl"
    >
      {sortedSuggestions.map(({ place_id, description, structured_formatting }, index) => (
        <div
          key={place_id}
          onClick={() => handleSelect(description, structured_formatting?.main_text, structured_formatting?.secondary_text)}
          onMouseEnter={() => setHighlightedIndex(index)}
          className={`px-4 py-2.5 cursor-pointer transition flex flex-col min-w-0 ${highlightedIndex === index ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
        >
          <span className="text-black text-body text-secondary truncate whitespace-nowrap">
            {structured_formatting?.main_text || description.split(',')[0]}
            {structured_formatting?.secondary_text ? `, ${structured_formatting.secondary_text.split(',')[0]}` : ''}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
            {structured_formatting?.secondary_text ? structured_formatting.secondary_text.split(',').pop()?.trim() : ''}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div 
      className={`flex flex-col gap-2 relative w-full ${className}`} 
      ref={containerRef}
      style={{ scrollMarginTop: '100px' }}
    >
      {label && <label className="text-label ml-1">{label}</label>}
      <InputField
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const nextValue = e.target.value;

          setValue(nextValue);
          onSelect({ city: nextValue, country: '' });
          setHighlightedIndex(-1);
          window.dispatchEvent(new CustomEvent('luminus-select-open', { detail: { id: instanceIdRef.current } }));
        }}
        onFocus={() => {
          window.dispatchEvent(new CustomEvent('luminus-select-open', { detail: { id: instanceIdRef.current } }));
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setTimeout(() => {
              containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 150);
          }
        }}
        onKeyDown={(e) => {
          if (status !== "OK" || sortedSuggestions.length === 0) return;

          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev + 1) % sortedSuggestions.length);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev - 1 + sortedSuggestions.length) % sortedSuggestions.length);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            const s = highlightedIndex >= 0 ? sortedSuggestions[highlightedIndex] : sortedSuggestions[0];
            handleSelect(
              s.description,
              s.structured_formatting?.main_text,
              s.structured_formatting?.secondary_text
            );
          }
        }}
        disabled={disabled}
        variant={variant}
        autoComplete="new-password"
        enterKeyHint="next"
        autoFocus={autoFocus}
      />

      {status === "OK" && mounted && coords && sortedSuggestions.length > 0 && createPortal(suggestionsDropdown, document.body)}
    </div>
  );
});

LocationInput.displayName = 'LocationInput';
export default LocationInput;
