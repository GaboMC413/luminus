"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { INTEREST_CATEGORIES } from "@/utils/constants";
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

  const toggleInterest = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
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
        {categories.map((category) => {
          const categoryTitle = category.title || category.name;
          const textClass = getCategoryTextClass(categoryTitle, categories);
          const customColor = category.color || undefined;

          return (
            <div key={categoryTitle} className="flex flex-col gap-2.5 md:gap-4">
              <h3
                style={customColor ? { color: customColor } : undefined}
                className={`flex items-center gap-1.5 md:gap-2 text-[13px] md:text-[15px] font-bold ${textClass}`}
              >
                {renderCategoryIconByKey(category.icon, categoryTitle, "w-4 h-4 shrink-0")}
                <span>{categoryTitle}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.items.map((item: string) => {
                  const isSelected = selected.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`h-8 md:h-9 px-3.5 md:px-4 rounded-full text-[12px] md:text-[13px] font-medium transition-all duration-200 border cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 border-slate-900 text-white"
                          : "bg-white border-slate-200 text-slate-900 hover:border-slate-300"
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

        <div className="flex flex-col gap-2.5 md:gap-4 w-full mt-2">
          <h3 className="flex items-center gap-1.5 md:gap-2 text-slate-700 text-[13px] md:text-[15px] font-bold">
            <Sparkles className="w-4 h-4 text-slate-400 shrink-0" />
            <span>¿Algo más que te interese?</span>
          </h3>
          <input
            type="text"
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder="Escribe otros temas aquí..."
            className="input-text-field"
          />
        </div>
      </div>
    </Modal>
  );
}
