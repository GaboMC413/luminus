"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SelectInputProps {
  label?: string;
  value: string;
  options: string[] | { label: string; value: string }[];
  onSelect: (value: string) => void;
  placeholder?: string;
  variant?: 'clean' | 'bordered';
  className?: string;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const SelectInput = React.forwardRef<HTMLDivElement, SelectInputProps>(({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Selecciona',
  variant = 'bordered',
  className = '',
  error = false,
  disabled = false,
  autoFocus
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.querySelector('.reg-input-clean, .reg-input-bordered')?.getBoundingClientRect();
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
    if (isOpen) {
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
  }, [isOpen]);

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

  const variantClass = variant === 'clean' ? 'reg-input-clean' : 'reg-input-bordered';

  const currentOptionLabel = typeof options[0] === 'string'
    ? value
    : (options as { label: string; value: string }[]).find(opt => opt.value === value)?.label;

  const dropdownContent = coords && (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        width: coords.width,
        zIndex: 10000,
      }}
      className="bg-white rounded-[12px] outline outline-1 outline-zinc-200 overflow-y-auto max-h-[240px] custom-scrollbar animate-in fade-in duration-200"
    >
      {options.map((option) => {
        const optLabel = typeof option === 'string' ? option : option.label;
        const optValue = typeof option === 'string' ? option : option.value;
        const isSelected = value === optValue;

        return (
          <div
            key={optValue}
            onClick={() => {
              onSelect(optValue);
              setIsOpen(false);
            }}
            className={`
              px-6 py-2.5 cursor-pointer transition-colors text-body text-secondary
              ${isSelected ? 'bg-slate-50 font-semibold text-black' : 'hover:bg-slate-50 text-slate-600'}
            `}
          >
            {optLabel}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`flex flex-col gap-2 relative w-full ${className}`} ref={containerRef}>
      {label && <label className="text-label ml-1">{label}</label>}

      <div
        ref={ref}
        tabIndex={0}
        autoFocus={autoFocus}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`
          ${variantClass} px-5 flex items-center cursor-pointer transition-all duration-300 group
          ${error ? '!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]' : ''}
          ${isOpen ? 'border-black' : ''}
        `}
      >
        <span className={`${!value ? 'text-slate-400' : 'text-black'} text-body text-secondary truncate`}>
          {currentOptionLabel || placeholder}
        </span>
        {!disabled && (
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            className={`ml-auto transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="M1 1L5 5L9 1" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {isOpen && mounted && coords && createPortal(dropdownContent, document.body)}
    </div>
  );
});

SelectInput.displayName = 'SelectInput';
export default SelectInput;
