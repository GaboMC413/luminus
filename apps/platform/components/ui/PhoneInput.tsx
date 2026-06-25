"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { COUNTRIES as ALL_COUNTRIES } from '@/utils/countries';
import { AsYouType, CountryCode, getExampleNumber } from 'libphonenumber-js';
import examples from 'libphonenumber-js/examples.mobile.json';

const getCountryMaxLength = (countryCode: string): number => {
  if (countryCode === 'XX') return 15;
  try {
    const example = getExampleNumber(countryCode as CountryCode, examples);
    if (example) {
      const nationalNumStr = example.formatNational().replace(/\D/g, '');
      return nationalNumStr.length;
    }
  } catch (err) {
    console.error('Error getting example number length:', err);
  }
  return 12; // fallback
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
  error = false
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

  // Close dropdown when clicking outside
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to global open broadcasts to close when another select opens
  useEffect(() => {
    const handleOtherSelectOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.id !== instanceIdRef.current) {
        setShowPhoneDropdown(false);
      }
    };
    window.addEventListener('luminus-select-open', handleOtherSelectOpen);
    return () => window.removeEventListener('luminus-select-open', handleOtherSelectOpen);
  }, []);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect) {
        const preferredMaxHeight = 280; // Show country codes list comfortably
        const spaceBelow = window.innerHeight - rect.bottom - 16; // 16px safe margin from viewport bottom
        const spaceAbove = rect.top - 16; // 16px safe margin from viewport top

        let top: number | undefined = rect.bottom + 4;
        let bottom: number | undefined = undefined;
        let maxHeight = preferredMaxHeight;

        // Last-resort fallback: only open upwards if space below is extremely tight (less than 120px)
        // AND space above is larger than space below.
        if (spaceBelow < 120 && spaceAbove > spaceBelow) {
          top = undefined;
          bottom = window.innerHeight - rect.top + 4;
          maxHeight = Math.min(preferredMaxHeight, spaceAbove);
        } else {
          maxHeight = Math.min(preferredMaxHeight, spaceBelow);
        }

        // Fallback safety
        maxHeight = Math.max(maxHeight, 100);

        setCoords({
          top,
          bottom,
          left: rect.left,
          width: 240, // Phone dropdown is standard 240px wide
          maxHeight
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
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', updateCoords);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', updateCoords);
      };
    } else {
      setCoords(null);
    }
  }, [showPhoneDropdown]);

  const handleNumberChange = (rawValue: string) => {
    let processedValue = rawValue;
    let selectedCountry = phoneCountry;

    // Clean raw value
    const cleanRaw = rawValue.trim();
    const digitsOnly = cleanRaw.replace(/\D/g, '');

    const sortedCountries = [...ALL_COUNTRIES].sort(
      (a, b) => b.dial.replace(/\D/g, '').length - a.dial.replace(/\D/g, '').length
    );

    if (cleanRaw.startsWith('+') || /^\d{10,}/.test(digitsOnly)) {
      for (const c of sortedCountries) {
        const dialDigits = c.dial.replace(/\D/g, '');
        
        // Match with leading +
        if (cleanRaw.startsWith('+') && digitsOnly.startsWith(dialDigits)) {
          selectedCountry = c;
          onCountryChange(c);
          processedValue = digitsOnly.slice(dialDigits.length);
          break;
        }
        
        // Match without leading +
        if (!cleanRaw.startsWith('+') && digitsOnly.startsWith(dialDigits) && digitsOnly.length >= dialDigits.length + 7) {
          selectedCountry = c;
          onCountryChange(c);
          processedValue = digitsOnly.slice(dialDigits.length);
          break;
        }
      }
    }

    const maxLength = getCountryMaxLength(selectedCountry.code);
    const onlyDigits = processedValue.replace(/\D/g, '');
    const truncatedDigits = onlyDigits.slice(0, maxLength);

    let formatted = truncatedDigits;
    if (selectedCountry.code !== 'XX') {
      const formatter = new AsYouType(selectedCountry.code as CountryCode);
      formatted = formatter.input(truncatedDigits);
    }
    onChange(formatted);
  };

  const handleCountrySelect = (c: any) => {
    onCountryChange(c);
    setShowPhoneDropdown(false);
    
    // Also re-format and truncate current value for the new country
    const maxLength = getCountryMaxLength(c.code);
    const currentVal = value || '';
    const onlyDigits = currentVal.replace(/\D/g, '').slice(0, maxLength);
    if (c.code !== 'XX') {
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
        position: 'fixed',
        top: coords.top !== undefined ? `${coords.top}px` : 'auto',
        bottom: coords.bottom !== undefined ? `${coords.bottom}px` : 'auto',
        left: `${coords.left}px`,
        width: `${coords.width}px`,
        maxHeight: `${coords.maxHeight}px`,
        zIndex: 10000,
      }}
      className="bg-white rounded-2xl py-2 border border-slate-200 overflow-y-auto overscroll-contain pr-1 animate-in fade-in duration-200"
    >
      {dropdownCountries.map((c) => (
        <div
          key={c.code}
          onClick={(e) => { 
            e.stopPropagation(); 
            handleCountrySelect(c);
          }}
          className="px-4 py-2 hover:bg-slate-50 cursor-pointer transition flex items-center group w-full truncate"
        >
          <span className={`text-body truncate whitespace-nowrap transition-colors ${phoneCountry.code === c.code ? 'font-semibold text-black' : 'text-slate-600 group-hover:text-black'}`}>
            {c.name} ({c.dial})
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div 
      ref={containerRef}
      style={{ scrollMarginTop: '100px' }}
      className={`reg-input-bordered px-4 flex items-center transition w-full relative ${className} ${disabled ? 'pointer-events-none' : 'focus-within:border-black focus-within:ring-1 focus-within:ring-black'} ${error ? '!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]' : ''}`}
    >
      <div
        className={`relative flex items-center pr-2 shrink-0 h-full border-r border-slate-100 mr-2 ${!disabled ? 'cursor-pointer' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) {
            const nextOpen = !showPhoneDropdown;
            setShowPhoneDropdown(nextOpen);
            if (nextOpen) {
              window.dispatchEvent(new CustomEvent('luminus-select-open', { detail: { id: instanceIdRef.current } }));
              setTimeout(() => {
                containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 150);
            }
          }
        }}
      >
        <span className={`${phoneCountry.dial === '+00' ? '!text-slate-400' : 'text-zinc-900'} text-[13px] md:text-base font-normal mr-2`}>
          {phoneCountry.dial}
        </span>
        {!disabled && (
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform duration-200 ${showPhoneDropdown ? 'rotate-180' : ''}`}>
            <path d="M1 1L5 5L9 1" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <input
        type="tel"
        placeholder="Número de celular"
        value={value}
        disabled={disabled}
        onChange={(e) => handleNumberChange(e.target.value)}
        className="flex-1 bg-transparent px-2 outline-none text-zinc-900 text-[13px] md:text-base font-normal placeholder:text-slate-400 h-full"
        enterKeyHint="done"
        autoComplete="tel"
      />

      {showPhoneDropdown && mounted && coords && createPortal(phoneDropdown, document.body)}
    </div>
  );
}
