"use client";

import React from "react";
import Link from "next/link";

interface OnboardingSidebarProps {
  step: number;
  maxVisitedStep?: number;
  onStepClick?: (stepNum: number) => void;
  isCheckingStatus?: boolean;
  hideStepper?: boolean;
}

export function OnboardingSidebar({
  step,
  maxVisitedStep = 1,
  onStepClick,
  isCheckingStatus = false,
  hideStepper = false,
}: OnboardingSidebarProps) {
  const stepsList = [
    { num: 1, label: "Información inicial" },
    { num: 2, label: "Perfil profesional" },
    { num: 3, label: "Sesiones introductorias" },
    { num: 4, label: "Espacios de atención" },
    { num: 5, label: "Cursos y talleres" },
  ];

  // Number of completed steps prior to or up to maxVisitedStep
  const completedCount = Math.max(0, Math.min(maxVisitedStep - 1, 5));
  const progressPercentage = Math.min((completedCount / 5) * 100, 100);
  const showStepper = !isCheckingStatus && !hideStepper && step <= 5;

  return (
    <div className="hidden lg:flex lg:sticky lg:top-[64px] lg:h-[calc(100vh-64px)] lg:w-80 xl:w-96 luminus-light-gradient border-r border-slate-200/80 shrink-0 flex-col items-center py-12 px-8 z-50 transition-all duration-500 overflow-hidden relative">
      {/* Soft background glows matching marketing hero */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-gradient-to-br from-pink-100/50 via-purple-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-tr from-blue-100/50 via-amber-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full">

        {/* Mobile Header Stepper (small screens) */}
        {showStepper && (
          <div className="flex lg:hidden flex-col gap-2 w-full mt-3 text-slate-900">
            <div className="flex justify-between items-center text-[12px] font-jakarta">
              <span className="font-bold uppercase tracking-wider text-slate-900">Aplicación como Especialista</span>
              <span className="text-slate-500 font-semibold">{completedCount} de 5 completados</span>
            </div>
            <div className="w-full bg-slate-100 border border-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-black h-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-[12px] font-bold text-center text-slate-900 mt-0.5">
              Paso {step}: {stepsList[step - 1]?.label}
            </div>
          </div>
        )}

        {/* Desktop Stepper progress */}
        {showStepper && (
          <div className="hidden lg:flex flex-col gap-6 w-full mt-6 text-slate-900">
            {/* Header */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[16px] font-bold font-jakarta text-slate-900">
                Aplicación como Especialista
              </span>
              <span className="text-[13px] text-slate-500 font-sans font-medium">
                {completedCount} de 5 pasos completados
              </span>
              <div className="w-full bg-slate-100 border border-slate-200/80 h-2 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-black h-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Nav List */}
            <div className="flex flex-col gap-2.5 mt-2 font-jakarta">
              {stepsList.map((s) => {
                const isActive = step === s.num;
                const isCompleted = s.num < step || (s.num <= maxVisitedStep && !isActive);
                const isAvailable = s.num <= maxVisitedStep;

                return (
                  <button
                    key={s.num}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => isAvailable && onStepClick?.(s.num)}
                    aria-label={`Ir al paso ${s.num}: ${s.label}`}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left outline-none focus-visible:ring-2 focus-visible:ring-slate-900 select-none ${
                      isActive
                        ? "bg-black text-white font-bold border border-black shadow-sm"
                        : isCompleted
                        ? "bg-slate-100 hover:bg-slate-200/70 text-slate-800 font-medium cursor-pointer border border-slate-200"
                        : "bg-transparent text-slate-400 font-normal cursor-not-allowed border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all ${
                        isActive
                          ? "bg-white text-black"
                          : isCompleted
                          ? "bg-slate-200 text-slate-900"
                          : "bg-transparent text-slate-400 border border-slate-300"
                      }`}
                    >
                      {isCompleted ? "✓" : s.num}
                    </div>

                    <span className="text-[13px] tracking-wide truncate">{s.label}</span>

                    {isActive && (
                      <span className="material-symbols-rounded text-[18px] text-white ml-auto shrink-0">
                        chevron_right
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
