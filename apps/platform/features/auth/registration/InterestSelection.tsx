"use client";

import React, { useState, useEffect } from 'react';
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
  const [categories, setCategories] = useState(INTEREST_CATEGORIES);

  useEffect(() => {
    const shuffle = <T,>(array: T[]): T[] => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data?.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(shuffle(data.categories));
        } else {
          setCategories(shuffle(INTEREST_CATEGORIES));
        }
      })
      .catch(() => {
        setCategories(shuffle(INTEREST_CATEGORIES));
      });
  }, []);

  const toggleInterest = (item: string) => {
    if (showError) setShowError(false);
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter((i: string) => i !== item));
    } else {
      setSelectedInterests([...selectedInterests, item]);
    }
  };

  const handleContinue = async () => {
    if (selectedInterests.length === 0) {
      setShowError(true);
      const container = document.querySelector('.overflow-y-auto');
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/onboarding/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          interests: selectedInterests,
          otherInterests,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save interests.");
      }

      setIsSaving(false);
      localStorage.setItem("luminus_profile_interests", JSON.stringify(selectedInterests));
      localStorage.setItem("luminus_profile_otherInterests", otherInterests);
      if (onNext) onNext();
    } catch {
      setIsSaving(false);
      alert("No pudimos guardar tus intereses. Intenta nuevamente.");
    }
  };

  return (
    <div className="w-full flex flex-col justify-start items-start gap-8 animate-in fade-in duration-300">

      {/* Title & Back Section */}
      <div className="w-full flex flex-col justify-start items-start gap-2">
        {onBack && <Button variant="back" onClick={onBack} />}
        <h1 className="text-page-title text-primary mt-2">Intereses</h1>
        <p className="text-body text-secondary">Elige los temas que más te interesan para personalizar tu experiencia.</p>
        {showError && <p className="text-[#FF3D3D] text-[11px] font-bold">Selecciona al menos un interés</p>}
      </div>

      {/* Categories Area */}
      <div className="flex flex-col gap-8 w-full pr-2">
        {categories.map((category) => (
          <div key={category.title} className="flex flex-col gap-4">
            <h3 className="flex items-center gap-2 text-[16px] md:text-[17px] font-bold font-sans animate-in fade-in duration-300" style={{ color: category.color }}>
              <span className="material-symbols-outlined select-none text-[20px]" style={(category as any).iconFilled ? { fontVariationSettings: "'FILL' 1" } : undefined}>{category.icon}</span>
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
            <span className="material-symbols-outlined select-none text-[20px]">asterisk</span>
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
