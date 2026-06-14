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
  disabledOpacity?: boolean;
  autoFocus?: boolean;
  preventScrollOnOpen?: boolean;
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
  disabledOpacity = true,
  autoFocus,
  preventScrollOnOpen = false
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
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
  const instanceIdRef = useRef(Math.random().toString(36).substring(2, 9));

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleOtherSelectOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.id !== instanceIdRef.current) {
        setIsOpen(false);
      }
    };
    window.addEventListener('luminus-select-open', handleOtherSelectOpen);
    return () => window.removeEventListener('luminus-select-open', handleOtherSelectOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const currentIdx = options.findIndex((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        return val === value;
      });
      setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0);

      if (!preventScrollOnOpen) {
        // Smooth scroll the select box higher in the viewport on mobile/devices when opened
        setTimeout(() => {
          containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [isOpen, value, options, preventScrollOnOpen]);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.querySelector('.reg-input-clean, .reg-input-bordered')?.getBoundingClientRect();
      if (rect) {
        const preferredMaxHeight = 260;
        const spaceBelow = window.innerHeight - rect.bottom - 24; // 24px safe margin from viewport bottom
        const spaceAbove = rect.top - 24; // 24px safe margin from viewport top

        let top: number | undefined = undefined;
        let bottom: number | undefined = undefined;
        let maxHeight = preferredMaxHeight;

        // If there's not enough space below, and more space above, open above
        if (spaceBelow < preferredMaxHeight && spaceAbove > spaceBelow) {
          bottom = window.innerHeight - rect.top + 4;
          maxHeight = Math.min(preferredMaxHeight, spaceAbove);
        } else {
          top = rect.bottom + 4;
          maxHeight = Math.min(preferredMaxHeight, spaceBelow);
        }

        // Fallback safety to guarantee dropdown is scrollable even in tight viewports
        maxHeight = Math.max(maxHeight, 100);

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
    if (isOpen) {
      updateCoords();
      const handleScroll = (event: Event) => {
        if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
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
      className="bg-white rounded-[12px] outline outline-1 outline-zinc-200 overflow-y-auto overscroll-contain pr-1 animate-in fade-in duration-200"
    >
      {options.map((option, index) => {
        const optLabel = typeof option === 'string' ? option : option.label;
        const optValue = typeof option === 'string' ? option : option.value;
        const isSelected = value === optValue;
        const isHighlighted = highlightedIndex === index;

        return (
          <div
            key={optValue}
            onClick={() => {
              onSelect(optValue);
              setIsOpen(false);
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
            className={`
              px-4 py-2 cursor-pointer transition-colors text-body truncate w-full block
              ${isSelected ? 'font-semibold text-black' : ''}
              ${isHighlighted ? 'bg-slate-100 text-black' : 'text-slate-600 hover:bg-slate-50'}
            `}
          >
            {optLabel}
          </div>
        );
      })}
    </div>
  );

  return (
    <div 
      className={`flex flex-col gap-2 relative w-full ${className}`} 
      ref={containerRef}
      style={{ scrollMarginTop: '100px' }}
    >
      {label && <label className="text-label ml-1">{label}</label>}

      <div
        ref={ref}
        tabIndex={disabled ? -1 : 0}
        autoFocus={autoFocus}
        onClick={() => {
          if (!disabled) {
            const nextOpen = !isOpen;
            setIsOpen(nextOpen);
            if (nextOpen) {
              window.dispatchEvent(new CustomEvent('luminus-select-open', { detail: { id: instanceIdRef.current } }));
            }
          }
        }}
        onKeyDown={(e) => {
          if (disabled) return;

          // 1. QUICK CHAR MATCHING (e.g. typing 'm' -> Masculino)
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const char = e.key.toLowerCase();
            const foundIdx = options.findIndex((opt) => {
              const labelText = typeof opt === 'string' ? opt : opt.label;
              return labelText.toLowerCase().startsWith(char);
            });
            if (foundIdx !== -1) {
              e.preventDefault();
              const matchedOption = options[foundIdx];
              const val = typeof matchedOption === 'string' ? matchedOption : matchedOption.value;
              onSelect(val);
              setHighlightedIndex(foundIdx);
            }
            return;
          }

          // 2. STANDARD ACCESSIBLE KEY NAVIGATION
          switch (e.key) {
            case 'Enter':
            case ' ':
              e.preventDefault();
              if (isOpen) {
                if (highlightedIndex >= 0 && highlightedIndex < options.length) {
                  const selectedOption = options[highlightedIndex];
                  const val = typeof selectedOption === 'string' ? selectedOption : selectedOption.value;
                  onSelect(val);
                }
                setIsOpen(false);
              } else {
                setIsOpen(true);
              }
              break;
            case 'ArrowDown':
              e.preventDefault();
              if (!isOpen) {
                setIsOpen(true);
              } else {
                setHighlightedIndex((prev) => (prev + 1) % options.length);
              }
              break;
            case 'ArrowUp':
              e.preventDefault();
              if (!isOpen) {
                setIsOpen(true);
              } else {
                setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
              }
              break;
            case 'Escape':
              e.preventDefault();
              setIsOpen(false);
              break;
            case 'Tab':
              // Close on Tab to let browser move focus smoothly
              setIsOpen(false);
              break;
          }
        }}
        className={`
          ${variantClass} px-4 flex items-center cursor-pointer transition-all duration-300 group outline-none w-full min-w-0
          ${error ? '!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]' : 'focus:border-black focus:ring-1 focus:ring-black'}
          ${isOpen ? 'border-black' : ''}
          ${disabled ? `${disabledOpacity ? 'opacity-50' : ''} cursor-not-allowed` : ''}
        `}
      >
        <span className={`${!value ? '!text-slate-400' : 'text-zinc-900'} text-[13px] md:text-base font-normal truncate select-none min-w-0 flex-1`}>
          {currentOptionLabel || placeholder}
        </span>
        {!disabled && (
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            className={`ml-auto shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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
