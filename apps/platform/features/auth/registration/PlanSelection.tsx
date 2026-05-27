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
        <h1 className="text-page-title text-primary mt-2">Elige cómo continuar después de tus 3 meses de acceso total sin costo</h1>
        <p className="text-body text-secondary">Desde hoy tendrás acceso completo sin pagar y sin ingresar datos de tarjeta. Al finalizar el período inicial de 3 meses de acceso total sin costo, podrás continuar con el plan que elijas o mantener tu cuenta de forma gratuita con acceso limitado.</p>
      </div>

      {/* Cards container */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full mt-2">

        {/* Plan Mensual Card */}
        <div className="flex-1 p-6 bg-white border border-zinc-200 rounded-2xl flex flex-col gap-8 transition-all hover:border-zinc-300">
          <div className="flex flex-col gap-3">
            <div className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.15em] font-sans mb-3">Plan mensual</div>
            <div className="text-black text-[32px] font-bold leading-none font-sans">USD 5/mes</div>
            <div className="text-black text-[17px] font-bold font-sans">Primeros 3 meses sin costo</div>
            <p className="text-black text-[15px] leading-relaxed font-sans">Una opción flexible para continuar con acceso completo a LUMINUS mes a mes.</p>
          </div>
          <div className="flex flex-col gap-8 mt-auto pt-8">
            <div className="flex flex-col gap-6">
              <Button variant="primary" onClick={() => handleSelectPlan('Mensual')} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Continuar con plan mensual"}
              </Button>
              <p className="text-zinc-500 text-[11px] leading-normal font-medium font-sans">
                No se solicitará ningún pago ni dato de tarjeta hoy. Te avisaremos antes de que termine tu período sin costo para que puedas decidir si deseas continuar.
              </p>
            </div>
          </div>
        </div>

        {/* Plan Anual Card */}
        <div className="flex-1 p-6 bg-white border border-zinc-200 rounded-2xl flex flex-col gap-8 transition-all hover:border-zinc-300">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-3">
              <div className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.15em] font-sans">Plan anual</div>
              <div className="px-2.5 py-1 bg-black rounded-full">
                <div className="text-white text-[10px] font-bold uppercase tracking-wider font-sans whitespace-nowrap">25% OFF · Ahorras USD 15</div>
              </div>
            </div>
            <div className="text-black text-[32px] font-bold leading-none font-sans">USD 45/año</div>
            <div className="text-black text-[17px] font-bold font-sans">Primeros 3 meses sin costo</div>
            <p className="text-black text-[15px] leading-relaxed font-sans">La mejor alternativa para quienes buscan continuidad y un mejor valor anual.</p>
          </div>
          <div className="flex flex-col gap-8 mt-auto pt-8">
            <div className="flex flex-col gap-6">
              <Button variant="primary" onClick={() => handleSelectPlan('Anual')} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Continuar con plan anual"}
              </Button>
              <p className="text-zinc-500 text-[11px] leading-normal font-medium font-sans">
                No se solicitará ningún pago ni dato de tarjeta hoy. Te avisaremos antes de que termine tu período sin costo para que puedas decidir si deseas continuar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Explicación de por qué LUMINUS es de pago */}
      <div className="w-full mt-6 pt-6 border-t border-zinc-200/80 flex flex-col gap-2 font-sans text-left">
        <h4 className="text-slate-900 font-bold text-[15px] leading-snug">
          ¿Por qué LUMINUS es de pago?
        </h4>
        <p className="text-slate-500 text-[13px] sm:text-[14px] leading-relaxed font-normal">
          Porque una plataforma de bienestar debe estar diseñada para cuidar a las personas, no para depender de publicidad ni de la comercialización de datos personales. La suscripción nos permite sostener LUMINUS de forma ética, independiente y profesional.
        </p>
      </div>
    </div>
  );
}
