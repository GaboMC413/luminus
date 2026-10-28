"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

interface SelectInputProps {
  label?: string;
  value: string;
  options: string[] | { label: string; value: string; description?: string }[];
  onSelect: (value: string) => void;
  placeholder?: string;
  variant?: "clean" | "bordered";
  size?: "sm" | "md";
  className?: string;
  error?: boolean;
  disabled?: boolean;
  disabledOpacity?: boolean;
  autoFocus?: boolean;
  preventScrollOnOpen?: boolean;
  searchable?: boolean;
}

export const SelectInput = React.forwardRef<HTMLDivElement, SelectInputProps>(
  (
    {
      label,
      value,
      options,
      onSelect,
      placeholder = "Selecciona",
      variant = "bordered",
      size = "md",
      className = "",
      error = false,
      disabled = false,
      disabledOpacity = true,
      autoFocus,
      preventScrollOnOpen = true,
      searchable = false,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [coords, setCoords] = useState<{
      top?: number;
      bottom?: number;
      left: number;
      width: number;
      maxHeight: number;
    } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const instanceIdRef = useRef(Math.random().toString(36).substring(2, 9));

    React.useImperativeHandle(ref, () => triggerRef.current as HTMLDivElement);

    useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);

    const currentOptionLabel = useMemo(() => {
      if (!value) return "";
      if (typeof options[0] === "string") {
        return value;
      }
      const found = (options as { label: string; value: string }[]).find((opt) => opt.value === value);
      return found ? found.label : value;
    }, [value, options]);

    // Keep searchTerm in sync when closed
    useEffect(() => {
      if (!isOpen) {
        setSearchTerm(currentOptionLabel);
      }
    }, [isOpen, currentOptionLabel]);

    // Listen to global open broadcasts to close when another dropdown opens
    useEffect(() => {
      const handleOtherSelectOpen = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail?.id !== instanceIdRef.current) {
          setIsOpen(false);
        }
      };
      window.addEventListener("luminus-select-open", handleOtherSelectOpen);
      return () => window.removeEventListener("luminus-select-open", handleOtherSelectOpen);
    }, []);

    // Filter options when searchable
    const filteredOptions = useMemo(() => {
      if (!searchable || !isOpen || !searchTerm.trim()) {
        return options;
      }
      const query = searchTerm.toLowerCase().trim();
      return options.filter((opt) => {
        const optLabel = (typeof opt === "string" ? opt : opt.label).toLowerCase();
        const optVal = (typeof opt === "string" ? opt : opt.value).toLowerCase();
        return optLabel.includes(query) || optVal.includes(query);
      });
    }, [options, searchable, isOpen, searchTerm]);

    useEffect(() => {
      if (isOpen) {
        const currentIdx = filteredOptions.findIndex((opt) => {
          const val = typeof opt === "string" ? opt : opt.value;
          return val === value;
        });
        setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0);

        if (!preventScrollOnOpen && typeof window !== "undefined" && window.innerWidth < 768) {
          setTimeout(() => {
            containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
        }
      }
    }, [isOpen, value, filteredOptions, preventScrollOnOpen]);

    const updateCoords = () => {
      const el = triggerRef.current || containerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect) {
          const preferredMaxHeight = 260;
          const spaceBelow = window.innerHeight - rect.bottom - 16;
          const spaceAbove = rect.top - 16;

          let top: number | undefined = rect.bottom + 4;
          let bottom: number | undefined = undefined;
          let maxHeight = preferredMaxHeight;

          if (spaceBelow < 120 && spaceAbove > spaceBelow) {
            top = undefined;
            bottom = window.innerHeight - rect.top + 4;
            maxHeight = Math.min(preferredMaxHeight, spaceAbove);
          } else {
            maxHeight = Math.min(preferredMaxHeight, spaceBelow);
          }

          maxHeight = Math.max(maxHeight, 100);

          setCoords({
            top,
            bottom,
            left: rect.left,
            width: rect.width,
            maxHeight,
          });
        }
      }
    };

    React.useLayoutEffect(() => {
      if (isOpen) {
        updateCoords();
        const openedAt = Date.now();
        const handleScroll = (event: Event) => {
          if (Date.now() - openedAt < 500) {
            return;
          }
          if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
            return;
          }
          setIsOpen(false);
        };
        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", updateCoords);
        return () => {
          window.removeEventListener("scroll", handleScroll, true);
          window.removeEventListener("resize", updateCoords);
        };
      } else {
        setCoords(null);
      }
    }, [isOpen]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        const target = event.target as Node;
        if (
          containerRef.current &&
          !containerRef.current.contains(target) &&
          triggerRef.current &&
          !triggerRef.current.contains(target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }, []);

    const variantClass =
      variant === "clean"
        ? "reg-input-clean"
        : "w-full h-11 px-3.5 text-xs sm:text-sm bg-white border border-zinc-200/90 rounded-xl focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors text-slate-800 font-sans";

    const handleSelectOption = (optValue: string) => {
      onSelect(optValue);
      setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setSearchTerm(text);
      if (!isOpen) setIsOpen(true);

      // Auto-match if exact match or single character number matching
      const clean = text.trim().toLowerCase();
      const match = options.find((opt) => {
        const optVal = (typeof opt === "string" ? opt : opt.value).toLowerCase();
        const optLbl = (typeof opt === "string" ? opt : opt.label).toLowerCase();
        return (
          optVal === clean ||
          optLbl === clean ||
          (clean.length === 1 && optVal === `0${clean}`) ||
          (clean.length <= 2 && /^\d+$/.test(clean) && parseInt(optVal, 10) === parseInt(clean, 10))
        );
      });

      if (match) {
        const valToSet = typeof match === "string" ? match : match.value;
        onSelect(valToSet);
      }
    };

    const handleInputBlur = () => {
      // Snap to best match on blur if typed
      if (searchable && searchTerm) {
        const clean = searchTerm.trim().toLowerCase();
        const match = options.find((opt) => {
          const optVal = (typeof opt === "string" ? opt : opt.value).toLowerCase();
          const optLbl = (typeof opt === "string" ? opt : opt.label).toLowerCase();
          return (
            optVal.startsWith(clean) ||
            optLbl.startsWith(clean) ||
            (clean.length <= 2 && /^\d+$/.test(clean) && parseInt(optVal, 10) === parseInt(clean, 10))
          );
        });
        if (match) {
          const valToSet = typeof match === "string" ? match : match.value;
          onSelect(valToSet);
          setSearchTerm(typeof match === "string" ? match : match.label);
        } else {
          setSearchTerm(currentOptionLabel);
        }
      }
    };

    const dropdownContent = coords && (
      <div
        ref={dropdownRef}
        data-select-portal="true"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: coords.top !== undefined ? `${coords.top}px` : "auto",
          bottom: coords.bottom !== undefined ? `${coords.bottom}px` : "auto",
          left: `${coords.left}px`,
          width: `${coords.width}px`,
          maxHeight: `${coords.maxHeight}px`,
          zIndex: 10000,
        }}
        className="bg-white rounded-xl border border-zinc-200/90 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.08)] overflow-y-auto overflow-x-hidden overscroll-contain animate-in fade-in duration-150"
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => {
            const optLabel = typeof option === "string" ? option : option.label;
            const optValue = typeof option === "string" ? option : option.value;
            const optDescription = typeof option === "string" ? undefined : (option as any).description;
            const isSelected = value === optValue;
            const isHighlighted = highlightedIndex === index;

            return (
              <div
                key={optValue}
                onClick={() => handleSelectOption(optValue)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`
                  ${size === "sm" ? "px-3 py-2 text-xs" : "px-3.5 py-2.5"} cursor-pointer transition-colors w-full block
                  ${isSelected ? "bg-slate-100 text-black font-semibold" : "text-slate-700 hover:bg-slate-50"}
                  ${isHighlighted && !isSelected ? "bg-slate-50 text-slate-900" : ""}
                `}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span
                    className={`${size === "sm" ? "text-xs" : "text-xs sm:text-[13px]"} ${
                      isSelected ? "font-bold text-slate-900" : "font-normal text-slate-900"
                    } font-sans truncate`}
                  >
                    {optLabel}
                  </span>
                  {optDescription && (
                    <span
                      className={`${
                        size === "sm" ? "text-[10px]" : "text-[11px] md:text-[12px]"
                      } text-slate-500 font-sans leading-snug whitespace-normal`}
                    >
                      {optDescription}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-3.5 py-3 text-xs text-slate-400 text-center font-sans">
            Sin resultados
          </div>
        )}
      </div>
    );

    return (
      <div
        className={`flex flex-col ${label ? "gap-1.5" : ""} relative w-full ${className}`}
        ref={containerRef}
        style={{ scrollMarginTop: "100px" }}
      >
        {label && (
          <label className="text-xs font-semibold text-slate-700 font-jakarta">{label}</label>
        )}

        <div
          ref={triggerRef}
          tabIndex={disabled ? -1 : 0}
          onClick={(e) => {
            if (disabled) return;
            const nextOpen = !isOpen;
            setIsOpen(nextOpen);
            if (nextOpen) {
              window.dispatchEvent(
                new CustomEvent("luminus-select-open", { detail: { id: instanceIdRef.current } })
              );
              if (searchable && inputRef.current) {
                inputRef.current.focus();
                inputRef.current.select();
              }
            }
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            switch (e.key) {
              case "Enter":
              case " ":
                if (!searchable) {
                  e.preventDefault();
                  if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    const opt = filteredOptions[highlightedIndex];
                    handleSelectOption(typeof opt === "string" ? opt : opt.value);
                  } else {
                    setIsOpen(!isOpen);
                  }
                }
                break;
              case "ArrowDown":
                e.preventDefault();
                if (!isOpen) {
                  setIsOpen(true);
                } else {
                  setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
                }
                break;
              case "ArrowUp":
                e.preventDefault();
                if (!isOpen) {
                  setIsOpen(true);
                } else {
                  setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
                }
                break;
              case "Escape":
                e.preventDefault();
                setIsOpen(false);
                break;
              case "Tab":
                setIsOpen(false);
                break;
            }
          }}
          className={`
            ${variantClass} ${size === "sm" ? "!h-9 !px-3 !rounded-xl" : "px-3.5"} flex items-center cursor-pointer transition-colors group outline-none w-full min-w-0
            ${error ? "!border-[#FF3D3D]" : ""}
            ${isOpen ? "border-slate-800 ring-1 ring-slate-800" : ""}
            ${disabled ? `${disabledOpacity ? "opacity-50" : ""} cursor-not-allowed` : ""}
          `}
        >
          {searchable ? (
            <input
              ref={inputRef}
              type="text"
              disabled={disabled}
              value={isOpen ? searchTerm : currentOptionLabel}
              placeholder={placeholder}
              onChange={handleInputChange}
              onFocus={() => {
                if (!isOpen) {
                  setIsOpen(true);
                  window.dispatchEvent(
                    new CustomEvent("luminus-select-open", { detail: { id: instanceIdRef.current } })
                  );
                }
              }}
              onBlur={handleInputBlur}
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-sans cursor-pointer truncate p-0 select-text"
            />
          ) : (
            <span
              className={`${!value ? "!text-slate-400" : "text-slate-900"} ${
                size === "sm" ? "!text-xs" : "text-xs sm:text-sm"
              } font-normal truncate select-none min-w-0 flex-1 font-sans`}
            >
              {currentOptionLabel || placeholder}
            </span>
          )}

          {!disabled && (
            <svg
              width={size === "sm" ? "8" : "10"}
              height={size === "sm" ? "5" : "6"}
              viewBox="0 0 10 6"
              fill="none"
              className={`ml-1.5 shrink-0 transition-transform duration-300 pointer-events-none ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              <path
                d="M1 1L5 5L9 1"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {isOpen && mounted && coords && createPortal(dropdownContent, document.body)}
      </div>
    );
  }
);

SelectInput.displayName = "SelectInput";
export default SelectInput;
