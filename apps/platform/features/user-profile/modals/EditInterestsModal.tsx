"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { INTEREST_CATEGORIES } from "@/utils/constants";

interface EditInterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interests: string[], otherInterests: string) => void;
  initialInterests: string[];
  initialOtherInterests: string;
}

export function EditInterestsModal({ isOpen, onClose, onSave, initialInterests, initialOtherInterests }: EditInterestsModalProps) {
  const [selected, setSelected] = useState<string[]>(initialInterests);
  const [other, setOther] = useState(initialOtherInterests);

  useEffect(() => {
    if (isOpen) {
      setSelected(initialInterests);
      setOther(initialOtherInterests);
    }
  }, [isOpen, initialInterests, initialOtherInterests]);

  const toggleInterest = (interest: string) => {
    setSelected(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Mis Intereses"
      maxWidth="720px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="w-full md:flex-1 !h-11 !text-[13px] !font-normal !rounded-[10px] md:!rounded-[12px]">
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              onSave(selected, other);
              onClose();
            }} 
            className="w-full md:flex-1 !h-11 !text-[13px] !font-normal !bg-black !text-white hover:!bg-slate-800 !rounded-[10px] md:!rounded-[12px]"
          >
            Guardar cambios
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5 md:gap-8">
        {INTEREST_CATEGORIES.map((category) => (
          <div key={category.title} className="flex flex-col gap-2.5 md:gap-4">
            <h3 className="flex items-center gap-1.5 md:gap-2 text-[13px] md:text-[15px] font-bold" style={{ color: category.color }}>
              <span className="material-symbols-outlined text-[18px] md:text-[20px]" style={(category as any).iconFilled ? { fontVariationSettings: "'FILL' 1" } : undefined}>{category.icon}</span>
              {category.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.items.map((item) => {
                const isSelected = selected.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`h-8 md:h-9 px-3.5 md:px-4 rounded-full text-[12px] md:text-[13px] font-medium transition-all duration-200 border cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-2.5 md:gap-4 w-full mt-2">
          <h3 className="flex items-center gap-1.5 md:gap-2 text-slate-400 text-[13px] md:text-[15px] font-bold">
            <span className="material-symbols-outlined text-[18px] md:text-[20px]">asterisk</span>
            ¿Algo más que te interese?
          </h3>
          <input
            type="text"
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder="Escribe otros temas aquí..."
            className="reg-input-bordered !h-10 md:!h-12 !text-[13px] md:!text-[14px]"
          />
        </div>
      </div>
    </Modal>
  );
}
