"use client";

import React, { useState, useRef, useEffect } from 'react';
import { COUNTRIES as ALL_COUNTRIES } from '@/utils/countries';
import { AsYouType, CountryCode } from 'libphonenumber-js';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  disabled = false,
  className = "",
  error = false
}: PhoneInputProps) {
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Try to parse the incoming value to find the dial code
  const detectInitialCountry = () => {
    if (!value) return ALL_COUNTRIES.find(c => c.code === 'AR') || ALL_COUNTRIES[0];
    
    // Simple matching: find the longest dial code that matches the start of the string
    const matchingCountries = ALL_COUNTRIES.filter(c => value.startsWith(c.dial));
    if (matchingCountries.length > 0) {
      return matchingCountries.reduce((prev, current) => 
        (prev.dial.length > current.dial.length) ? prev : current
      );
    }
    return ALL_COUNTRIES.find(c => c.code === 'AR') || ALL_COUNTRIES[0];
  };

  const [phoneCountry, setPhoneCountry] = useState(detectInitialCountry());
  const [number, setNumber] = useState("");

  // Update local number and country when external value changes
  useEffect(() => {
    if (value) {
      // Find matching country dial prefix
      const matchingCountries = ALL_COUNTRIES.filter(c => value.startsWith(c.dial));
      if (matchingCountries.length > 0) {
        const detected = matchingCountries.reduce((prev, current) => 
          (prev.dial.length > current.dial.length) ? prev : current
        );
        setPhoneCountry(detected);
        setNumber(value.slice(detected.dial.length).trim());
      } else {
        setNumber(value);
      }
    } else {
      setNumber("");
    }
  }, [value]);

  const handleNumberChange = (rawValue: string) => {
    const formatter = new AsYouType(phoneCountry.code as CountryCode);
    const formatted = formatter.input(rawValue);
    setNumber(formatted);
    onChange(`${phoneCountry.dial} ${formatted}`.trim());
  };

  const handleCountrySelect = (c: any) => {
    setPhoneCountry(c);
    setShowPhoneDropdown(false);
    // Keep the same formatted number but trigger change with new dial code
    onChange(`${c.dial} ${number}`.trim());
  };

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

  return (
    <div 
      ref={containerRef}
      className={`reg-input-bordered px-5 flex items-center transition w-full relative ${className} ${disabled ? 'pointer-events-none' : ''} ${error ? '!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]' : ''}`}
    >
      <div
        className={`relative flex items-center pr-2 shrink-0 h-full border-r border-slate-100 mr-2 ${!disabled ? 'cursor-pointer' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) setShowPhoneDropdown(!showPhoneDropdown);
        }}
      >
        <span className="text-black text-body text-secondary mr-2">{phoneCountry.dial}</span>
        {!disabled && (
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform duration-200 ${showPhoneDropdown ? 'rotate-180' : ''}`}>
            <path d="M1 1L5 5L9 1" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {showPhoneDropdown && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-[240px] bg-white rounded-3xl py-2 z-[100] border border-slate-200 shadow-xl overflow-y-auto max-h-[240px] custom-scrollbar animate-in fade-in duration-200">
          {ALL_COUNTRIES.map((c) => (
            <div
              key={c.code}
              onClick={(e) => { 
                e.stopPropagation(); 
                handleCountrySelect(c);
              }}
              className="px-5 py-2 hover:bg-slate-50 cursor-pointer transition flex justify-between items-center group"
            >
              <div className="flex flex-col">
                <span className="text-slate-900 text-body text-secondary group-hover:text-black font-semibold">{c.name}</span>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{c.code}</span>
              </div>
              <span className="text-slate-400 text-xs font-bold tracking-wide">{c.dial}</span>
            </div>
          ))}
        </div>
      )}

      <input
        type="tel"
        placeholder="Número de celular"
        value={number}
        disabled={disabled}
        onChange={(e) => handleNumberChange(e.target.value)}
        className="flex-1 bg-transparent px-2 outline-none text-black text-body text-secondary placeholder:text-slate-400 h-full"
        enterKeyHint="done"
        autoComplete="tel"
      />
    </div>
  );
}
