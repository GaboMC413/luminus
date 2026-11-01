"use client";

import React, { useState } from "react";
import { Check, X, Plus } from "lucide-react";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";

export interface TagSelectorProps {
  label?: string;
  helperText?: string;
  tags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
  allowCustom?: boolean;
  customTags?: string[];
  onAddCustom?: (tag: string) => void;
  onRemoveCustom?: (tag: string) => void;
  error?: string;
  className?: string;
}

export function TagSelector({
  label,
  helperText,
  tags = [],
  selectedTags = [],
  onToggle,
  allowCustom = false,
  customTags = [],
  onAddCustom,
  onRemoveCustom,
  error,
  className = "",
}: TagSelectorProps) {
  const [customInput, setCustomInput] = useState("");

  const handleAdd = () => {
    const trimmed = customInput.trim();
    if (trimmed && onAddCustom) {
      onAddCustom(trimmed);
      setCustomInput("");
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none">
          {label}
        </label>
      )}
      {helperText && (
        <p className="text-xs text-slate-500 font-sans -mt-0.5 leading-relaxed">
          {helperText}
        </p>
      )}

      {/* Tags Grid / Flex */}
      <div className="flex flex-wrap gap-2 pt-0.5">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
              className={`h-9 px-4 rounded-full text-xs font-medium transition-colors border cursor-pointer select-none flex items-center gap-1.5 font-sans ${
                isSelected
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{tag}</span>
              {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
            </button>
          );
        })}
      </div>

      {/* Custom Tag Input & Badges */}
      {allowCustom && selectedTags.includes("Otro") && (
        <div className="flex flex-col gap-2.5 mt-2 animate-in fade-in duration-200">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <InputField
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                placeholder="Agregar otra área de acompañamiento"
              />
            </div>
            <Button
              type="button"
              onClick={handleAdd}
              variant="secondary"
              size="md"
              className="shrink-0 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar</span>
            </Button>
          </div>

          {customTags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {customTags.map((cTag) => (
                <span
                  key={cTag}
                  className="flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-medium bg-slate-900 text-white shadow-sm"
                >
                  <span>{cTag}</span>
                  <Check className="w-3 h-3 shrink-0 text-white" />
                  {onRemoveCustom && (
                    <button
                      type="button"
                      onClick={() => onRemoveCustom(cTag)}
                      className="hover:text-rose-300 transition-colors cursor-pointer bg-transparent border-none text-white ml-0.5 p-0.5 flex items-center justify-center"
                      aria-label={`Eliminar ${cTag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-rose-600 mt-0.5 px-0.5">
          {error}
        </p>
      )}
    </div>
  );
}

export default TagSelector;
