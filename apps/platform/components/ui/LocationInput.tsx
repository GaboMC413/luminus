"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  inputClassName?: string;
  label?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  name?: string;
  id?: string;
  autoComplete?: string;
}

export const LocationInput = React.forwardRef<HTMLInputElement, LocationInputProps>(({
  defaultValue = '',
  onSelect,
  placeholder = 'Ingresa tu ciudad',
  variant = 'bordered',
  className = '',
  inputClassName = '',
  label,
  disabled = false,
  autoFocus,
  name = 'luminus_location_search',
  id = 'luminus_location_search',
  autoComplete = 'off',
}, ref) => {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        clearSuggestions();
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

  const handleSelect = async (description: string, mainText?: string, secondaryText?: string) => {
    let formatted = description;
    if (mainText && secondaryText) {
      const secondaryPart = secondaryText.split(',')[0].trim();
      formatted = `${mainText}, ${secondaryPart}`;
    } else {
      const parts = description.split(',').map(p => p.trim());
      formatted = parts.length > 1 ? parts.slice(0, -1).join(', ') : description;
    }

    isTypingRef.current = false;
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

  const hasOpenSuggestions = status === "OK" && sortedSuggestions.length > 0;

  return (
    <div 
      className={`relative w-full ${className}`} 
      ref={containerRef}
      style={{ scrollMarginTop: '16px' }}
    >
      <InputField
        ref={ref}
        id={id}
        name={name}
        label={label}
        placeholder={placeholder}
        value={value}
        className={inputClassName}
        rightIcon={
          <span className="material-symbols-outlined text-[20px]">
            location_on
          </span>
        }
        onChange={(e) => {
          const nextValue = e.target.value;
          isTypingRef.current = true;
          setValue(nextValue);
          onSelect({ city: nextValue, country: '' });
          setHighlightedIndex(-1);
          window.dispatchEvent(new CustomEvent('luminus-select-open', { detail: { id: instanceIdRef.current } }));
          scrollToInputTop();
        }}
        onBlur={() => {
          isTypingRef.current = false;
        }}
        onFocus={() => {
          window.dispatchEvent(new CustomEvent('luminus-select-open', { detail: { id: instanceIdRef.current } }));
          scrollToInputTop();
        }}
        onKeyDown={(e) => {
          if (!hasOpenSuggestions) {
            if (e.key === 'Escape') {
              clearSuggestions();
            }
            return;
          }

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
          } else if (e.key === 'Escape') {
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
            // Prevent input blur before selection is processed
            e.preventDefault();
          }}
          className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white rounded-xl border border-zinc-200/90 overflow-y-auto overscroll-contain max-h-[190px] sm:max-h-[250px] animate-in fade-in duration-150 pr-1"
        >
          {sortedSuggestions.map(({ place_id, description, structured_formatting }, index) => (
            <div
              key={place_id}
              onClick={() => handleSelect(description, structured_formatting?.main_text, structured_formatting?.secondary_text)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-4 py-2.5 cursor-pointer transition flex flex-col min-w-0 ${highlightedIndex === index ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
            >
              <span className="text-slate-900 text-sm font-medium truncate whitespace-nowrap font-sans">
                {structured_formatting?.main_text || description.split(',')[0]}
                {structured_formatting?.secondary_text ? `, ${structured_formatting.secondary_text.split(',')[0]}` : ''}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate font-jakarta">
                {structured_formatting?.secondary_text ? structured_formatting.secondary_text.split(',').pop()?.trim() : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

LocationInput.displayName = 'LocationInput';
export default LocationInput;
