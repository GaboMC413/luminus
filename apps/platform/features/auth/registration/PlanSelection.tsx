"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { trackRegistrationError } from '@/lib/registrationAuditTracker';

export function PlanSelection({
  onNext,
  onBack,
  data,
}: {
  onNext?: () => void;
  onBack?: () => void;
  data?: Record<string, unknown>;
}) {
  const [isSaving, setIsSaving] = useState(false);

  const handleStartTrial = async () => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/onboarding/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          selectedPlan: "Trial",
          isOnboarded: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save onboarding profile.");
      }

      setIsSaving(false);
      localStorage.setItem("luminus_profile_plan", "Trial");
      localStorage.setItem("luminus_onboarding_completed", "true");
      if (onNext) onNext();
    } catch (err: any) {
      setIsSaving(false);
      trackRegistrationError({
        step: "Paso 4 - Selección de Plan / Finalización Onboarding",
        action: "POST /api/onboarding/profile",
        userName: `${data?.firstName || ""} ${data?.lastName || ""}`.trim(),
        errorMessage: err?.message || "Falló el guardado del perfil de onboarding.",
      });
      alert("No pudimos iniciar tu prueba. Intenta nuevamente.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-start items-start gap-6 animate-in fade-in duration-300">

      {/* Title & Back Section */}
      <div className="w-full flex flex-col justify-start items-start gap-2">
        {onBack && <Button variant="back" onClick={onBack} />}
        <h1 className="text-page-title text-primary mt-2">
          Tu acceso completo comienza hoy
        </h1>
        <p className="text-body text-secondary">
          Queremos que vivas la experiencia completa desde el primer día. Disfruta 3 meses de LUMINUS sin costo, sin datos de tarjeta, sin compromiso.
        </p>
      </div>

      {/* Value Proposition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full mt-2">
        {/* Card 1 */}
        <div className="p-5 bg-white border border-zinc-200/80 rounded-2xl flex flex-col gap-3 shadow-none">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-800 shrink-0">
            <span className="material-symbols-rounded text-[24px]">group</span>
          </div>
          <h3 className="text-[15px] font-bold text-slate-900 leading-tight">
            Conecta con personas como tú
          </h3>
          <p className="text-slate-500 text-[13px] leading-relaxed font-normal">
            Encuentra una comunidad que comparte intereses, búsquedas y caminos de bienestar.
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-5 bg-white border border-zinc-200/80 rounded-2xl flex flex-col gap-3 shadow-none">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-800 shrink-0">
            <span className="material-symbols-rounded text-[24px]">forum</span>
          </div>
          <h3 className="text-[15px] font-bold text-slate-900 leading-tight">
            Construye tu red privada
          </h3>
          <p className="text-slate-500 text-[13px] leading-relaxed font-normal">
            Envía mensajes, crea conexiones y mantén conversaciones en un espacio cuidado.
          </p>
        </div>

        {/* Card 3 */}
        <div className="p-5 bg-white border border-zinc-200/80 rounded-2xl flex flex-col gap-3 shadow-none">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-800 shrink-0">
            <span className="material-symbols-rounded text-[24px]">signpost</span>
          </div>
          <h3 className="text-[15px] font-bold text-slate-900 leading-tight">
            Explora bienestar guiado
          </h3>
          <p className="text-slate-500 text-[13px] leading-relaxed font-normal">
            Descubre especialistas, contenidos y herramientas para acompañar tu proceso.
          </p>
        </div>
      </div>

      {/* Pricing Transition Text */}
      <p className="text-slate-500 text-[13px] sm:text-[14px] leading-relaxed font-normal text-left mt-2 w-full">
        Cuando terminen tus 3 meses, tú decides cómo continuar. Puedes seguir con acceso gratuito limitado o mantener la experiencia completa con una suscripción desde 5 USD mensuales.
      </p>

      {/* Button & Next Actions */}
      <div className="w-full flex flex-col gap-3 mt-4">
        <Button variant="primary" className="w-full py-3 h-12 text-sm font-bold gap-2 group" onClick={handleStartTrial} disabled={isSaving}>
          {isSaving ? (
            "Ingresando..."
          ) : (
            <>
              Ir a LUMINUS
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </Button>
        <p className="text-zinc-400 text-[11px] leading-normal font-medium font-sans text-center">
          No se realizará ningún cobro hoy. Te avisaremos con anticipación antes de que venza tu período de prueba.
        </p>
      </div>

      {/* Why is LUMINUS paid disclaimer */}
      <div className="w-full mt-4 pt-6 border-t border-zinc-200/80 flex flex-col gap-2 font-sans text-left">
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
