"use client";

import React, { useState, useRef, useEffect } from 'react';
import { COUNTRIES as ALL_COUNTRIES } from '@/utils/countries';
import { AsYouType, CountryCode } from 'libphonenumber-js';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceIdRef = useRef(Math.random().toString(36).substring(2, 9));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  const handleNumberChange = (rawValue: string) => {
    let formatted = rawValue;
    if (phoneCountry.code !== 'XX') {
      const formatter = new AsYouType(phoneCountry.code as CountryCode);
      formatted = formatter.input(rawValue);
    }
    onChange(formatted);
  };

  const handleCountrySelect = (c: any) => {
    onCountryChange(c);
    setShowPhoneDropdown(false);
  };

  // No-op - moved logic to top useEffect

  const dropdownCountries = ALL_COUNTRIES;

  return (
    <div 
      ref={containerRef}
      className={`reg-input-bordered px-5 flex items-center transition w-full relative ${className} ${disabled ? 'pointer-events-none' : ''} ${error ? '!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]' : ''}`}
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
            }
          }
        }}
      >
        <span className={`${phoneCountry.dial === '+00' ? '!text-slate-400' : 'text-black'} text-body text-secondary mr-2`}>
          {phoneCountry.dial}
        </span>
        {!disabled && (
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform duration-200 ${showPhoneDropdown ? 'rotate-180' : ''}`}>
            <path d="M1 1L5 5L9 1" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {showPhoneDropdown && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-[240px] bg-white rounded-2xl py-2 z-[100] border border-slate-200 overflow-y-auto max-h-[240px] custom-scrollbar animate-in fade-in duration-200">
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
      )}

      <input
        type="tel"
        placeholder="Número de celular"
        value={value}
        disabled={disabled}
        onChange={(e) => handleNumberChange(e.target.value)}
        className="flex-1 bg-transparent px-2 outline-none text-black text-body text-secondary placeholder:text-slate-400 h-full"
        enterKeyHint="done"
        autoComplete="tel"
      />
    </div>
  );
}
