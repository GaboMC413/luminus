"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function PlanSelection({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectPlan = async (plan: 'Mensual' | 'Anual') => {
    setIsSaving(true);
    
    // Simulate local plan saving
    setTimeout(() => {
      setIsSaving(false);
      localStorage.setItem("luminus_profile_plan", plan);
      localStorage.setItem("luminus_onboarding_completed", "true");
      if (onNext) onNext();
    }, 800);
  };

  return (
    <div className="w-full h-full flex flex-col justify-start items-start gap-6 animate-in fade-in duration-300">

      {/* Title & Back Section */}
      <div className="w-full flex flex-col justify-start items-start gap-2">
        {onBack && <Button variant="back" onClick={onBack} />}
        <h1 className="text-page-title text-primary mt-2">Selecciona tu plan</h1>
        <p className="text-body text-secondary">Comienza hoy con 3 meses de acceso sin costo.</p>
      </div>

      {/* Cards container */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full mt-2">

        {/* Plan Mensual Card */}
        <div className="flex-1 p-6 bg-white border border-zinc-200 rounded-[32px] flex flex-col gap-8 transition-all hover:border-zinc-300">
          <div className="flex flex-col gap-3">
            <div className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.15em] font-sans mb-3">Plan Mensual</div>
            <div className="text-black text-[32px] font-bold leading-none font-sans">USD 5/mes</div>
            <div className="text-black text-[17px] font-bold font-sans">Primeros 3 meses gratis</div>
            <p className="text-black text-[15px] leading-relaxed font-sans">Una opción flexible para continuar con acceso completo a LUMINUS mes a mes.</p>
          </div>
          <div className="flex flex-col gap-8 mt-auto pt-8">
            <div className="flex flex-col gap-6">
              <Button variant="primary" onClick={() => handleSelectPlan('Mensual')} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Seleccionar plan mensual"}
              </Button>
              <p className="text-zinc-500 text-[11px] leading-normal font-medium font-sans">
                <span className="font-bold">No se solicitará ningún pago hasta que finalicen tus 3 meses de acceso sin costo.</span> Antes de que termine este período, te informaremos para que puedas decidir si deseas continuar con este plan.
              </p>
            </div>
          </div>
        </div>

        {/* Plan Anual Card */}
        <div className="flex-1 p-6 bg-white border border-zinc-200 rounded-[32px] flex flex-col gap-8 transition-all hover:border-zinc-300">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-3">
              <div className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.15em] font-sans">Plan Anual</div>
              <div className="px-2.5 py-1 bg-black rounded-full">
                <div className="text-white text-[10px] font-bold uppercase tracking-wider font-sans whitespace-nowrap">25% OFF - AHORRA USD 15</div>
              </div>
            </div>
            <div className="text-black text-[32px] font-bold leading-none font-sans">USD 45/año</div>
            <div className="text-black text-[17px] font-bold font-sans">Primeros 3 meses gratis</div>
            <p className="text-black text-[15px] leading-relaxed font-sans">La mejor alternativa para quienes buscan continuidad y un mejor valor anual.</p>
          </div>
          <div className="flex flex-col gap-8 mt-auto pt-8">
            <div className="flex flex-col gap-6">
              <Button variant="primary" onClick={() => handleSelectPlan('Anual')} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Seleccionar plan anual"}
              </Button>
              <p className="text-zinc-500 text-[11px] leading-normal font-medium font-sans">
                <span className="font-bold">No se solicitará ningún pago hasta que finalicen tus 3 meses de acceso sin costo.</span> Antes de que termine este período, te informaremos para que puedas decidir si deseas continuar con este plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
