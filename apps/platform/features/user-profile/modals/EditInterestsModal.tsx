"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { InputField } from "@/components/ui/InputField";
import { INTEREST_CATEGORIES, MAX_USER_INTERESTS } from "@/utils/constants";
import {
  getCategoryTextClass,
  renderCategoryIconByKey,
} from "@/components/ui/InterestPill";

interface EditInterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interests: string[], otherInterests: string) => void;
  initialInterests: string[];
  initialOtherInterests: string;
}

export function EditInterestsModal({
  isOpen,
  onClose,
  onSave,
  initialInterests,
  initialOtherInterests,
}: EditInterestsModalProps) {
  const [selected, setSelected] = useState<string[]>(initialInterests);
  const [other, setOther] = useState(initialOtherInterests);
  const [categories, setCategories] = useState<any[]>(INTEREST_CATEGORIES);

  useEffect(() => {
    if (isOpen) {
      setSelected(initialInterests);
      setOther(initialOtherInterests);

      fetch(`/api/categories?_t=${Date.now()}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data?.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, initialInterests, initialOtherInterests]);

  const limitReached = selected.length >= MAX_USER_INTERESTS;

  const getCategoryColor = (itemName: string) => {
    const target = itemName.toLowerCase().trim();
    const match =
      categories.find((c) =>
        Array.isArray(c.items) && c.items.some((i: string) => i.toLowerCase().trim() === target)
      ) ||
      INTEREST_CATEGORIES.find((c) =>
        c.items.some((i) => i.toLowerCase().trim() === target)
      );
    return match?.color || "#0F172A";
  };

  const toggleInterest = (interest: string) => {
    setSelected((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      }
      if (prev.length >= MAX_USER_INTERESTS) {
        return prev;
      }
      return [...prev, interest];
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar intereses"
      maxWidth="720px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="w-full md:flex-1">
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onSave(selected, other);
              onClose();
            }}
            className="w-full md:flex-1"
          >
            Guardar cambios
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5 md:gap-8">
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap gap-1.5 flex-1">
            {selected.length === 0 ? (
              <span className="text-xs text-slate-400 font-sans italic leading-7">
                Selecciona hasta {MAX_USER_INTERESTS} temas
              </span>
            ) : (
              selected.map((item) => {
                const catColor = getCategoryColor(item);
                return (
                  <button
                    key={`selected-${item}`}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    style={{
                      backgroundColor: catColor,
                      borderColor: catColor,
                      color: "#FFFFFF",
                    }}
                    className="h-7 px-2.5 text-xs leading-none rounded-full transition-all font-sans border font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5 hover:opacity-90"
                  >
                    <span>{item}</span>
                    <X className="w-3 h-3 shrink-0" />
                  </button>
                );
              })
            )}
          </div>
          <span
            className={`text-xs font-semibold tabular-nums select-none shrink-0 leading-7 ${
              limitReached ? "text-slate-900 font-bold" : "text-slate-400"
            }`}
          >
            {selected.length}/{MAX_USER_INTERESTS}
          </span>
        </div>

        {categories.map((category) => {
          const categoryTitle = category.title || category.name;
          const textClass = getCategoryTextClass(categoryTitle, categories);
          const customColor = category.color || undefined;

          return (
            <div key={categoryTitle} className="flex flex-col gap-3">
              <h3
                style={customColor ? { color: customColor } : undefined}
                className={`flex items-center gap-2 text-title-section font-bold ${textClass}`}
              >
                {renderCategoryIconByKey(category.icon, categoryTitle, "w-4 h-4 shrink-0")}
                <span>{categoryTitle}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.items.map((item: string) => {
                  const isSelected = selected.includes(item);
                  const isDisabled = !isSelected && limitReached;
                  return (
                    <button
                      key={item}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => toggleInterest(item)}
                      style={
                        isSelected && customColor
                          ? {
                              backgroundColor: customColor,
                              borderColor: customColor,
                              color: "#FFFFFF",
                            }
                          : undefined
                      }
                      className={`h-8.5 px-3.5 rounded-full text-xs font-medium font-sans transition-all duration-150 border ${
                        isSelected
                          ? customColor
                            ? "font-semibold cursor-pointer hover:opacity-90"
                            : "bg-slate-900 border-slate-900 text-white cursor-pointer"
                          : isDisabled
                          ? "bg-white border-slate-200 text-slate-400 opacity-50 cursor-not-allowed"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 cursor-pointer"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="flex flex-col gap-2.5 w-full mt-1">
          <h3 className="flex items-center gap-2 text-title-section text-slate-700 font-bold">
            <Sparkles className="w-4 h-4 text-slate-400 shrink-0" />
            <span>¿Algo más que te interese?</span>
          </h3>
          <InputField
            type="text"
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder="Escribe otros temas aquí..."
          />
        </div>
      </div>
    </Modal>
  );
}
