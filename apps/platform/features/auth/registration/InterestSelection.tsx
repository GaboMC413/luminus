"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { INTEREST_CATEGORIES } from '@/utils/constants';

export function InterestSelection({
  onNext,
  onBack,
  data,
  onUpdate
}: {
  onNext?: () => void;
  onBack?: () => void;
  data: any;
  onUpdate: (data: any) => void;
}) {
  const { interests: selectedInterests = [], otherInterests = '' } = data;

  const setSelectedInterests = (val: string[]) => onUpdate({ interests: val });
  const setOtherInterests = (val: string) => onUpdate({ otherInterests: val });

  const [isSaving, setIsSaving] = useState(false);
  const [showError, setShowError] = useState(false);

  const toggleInterest = (item: string) => {
    if (showError) setShowError(false);
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter((i: string) => i !== item));
    } else {
      setSelectedInterests([...selectedInterests, item]);
    }
  };

  const handleContinue = () => {
    if (selectedInterests.length === 0) {
      setShowError(true);
      const container = document.querySelector('.overflow-y-auto');
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);

    // Simulate local saving
    setTimeout(() => {
      setIsSaving(false);
      localStorage.setItem("luminus_profile_interests", JSON.stringify(selectedInterests));
      localStorage.setItem("luminus_profile_otherInterests", otherInterests);
      if (onNext) onNext();
    }, 800);
  };

  return (
    <div className="w-full flex flex-col justify-start items-start gap-8 animate-in fade-in duration-300">

      {/* Title & Back Section */}
      <div className="w-full flex flex-col justify-start items-start gap-2">
        {onBack && <Button variant="back" onClick={onBack} />}
        <h1 className="text-page-title text-primary mt-2">Intereses</h1>
        <p className="text-body text-secondary">Elige los temas que más te interesan para personalizar tu experiencia.</p>
        {showError && <p className="text-red-600 text-[11px] font-bold">Selecciona al menos un interés</p>}
      </div>

      {/* Categories Area */}
      <div className="flex flex-col gap-8 w-full pr-2">
        {INTEREST_CATEGORIES.map((category) => (
          <div key={category.title} className="flex flex-col gap-4">
            <h3 className="flex items-center gap-2 text-[16px] md:text-[17px] font-bold font-sans" style={{ color: category.color }}>
              {category.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.items.map((item) => {
                const isSelected = selectedInterests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`h-9 px-4 rounded-full text-[12px] md:text-[14px] font-medium transition-all duration-200 border cursor-pointer ${isSelected
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

        <div className="flex flex-col gap-4 w-full mt-4">
          <h3 className="flex items-center gap-2 text-slate-400 text-[17px] font-bold font-sans">
            ¿Algo más que te interese?
          </h3>
          <input
            type="text"
            value={otherInterests}
            onChange={(e) => setOtherInterests(e.target.value)}
            placeholder="Escribe otros temas aquí..."
            className="reg-input-bordered"
          />
        </div>
      </div>

      <div className="w-full flex flex-col items-end gap-3 shrink-0 mt-4">
        <Button
          variant="primary"
          className="w-full"
          disabled={isSaving}
          onClick={handleContinue}
        >
          {isSaving ? 'Guardando...' : 'Continuar →'}
        </Button>
        {showError && <p className="text-[#FF3D3D] text-[12px] font-bold pr-4">Por favor, selecciona al menos un interés.</p>}
      </div>
    </div>
  );
}
