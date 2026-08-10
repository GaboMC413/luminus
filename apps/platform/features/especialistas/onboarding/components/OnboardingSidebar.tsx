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
    <div className="hidden lg:flex lg:sticky lg:top-[64px] lg:h-[calc(100vh-64px)] lg:w-80 xl:w-96 luminus-gradient shrink-0 flex-col items-center py-12 px-8 z-50 transition-all duration-500">
      <div className="flex flex-col items-center w-full">


        {/* Mobile Header Stepper (small screens) */}
        {showStepper && (
          <div className="flex lg:hidden flex-col gap-2 w-full mt-3 text-white">
            <div className="flex justify-between items-center text-[12px] font-jakarta">
              <span className="font-bold uppercase tracking-wider text-white/80">Aplicación como Especialista</span>
              <span className="text-white/70 font-semibold">{completedCount} de 5 completados</span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-[12px] font-bold text-center text-white mt-0.5">
              Paso {step}: {stepsList[step - 1]?.label}
            </div>
          </div>
        )}

        {/* Desktop Stepper progress */}
        {showStepper && (
          <div className="hidden lg:flex flex-col gap-6 w-full mt-14 text-white/90">
            {/* Header */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[14px] font-bold font-jakarta text-white">
                Aplicación como Especialista
              </span>
              <span className="text-[12px] text-white/70 font-sans font-medium">
                {completedCount} de 5 pasos completados
              </span>
              <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-white h-full transition-all duration-500"
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
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left outline-none focus-visible:ring-2 focus-visible:ring-white select-none ${
                      isActive
                        ? "bg-white text-slate-900 font-bold border border-white"
                        : isCompleted
                        ? "bg-white/10 hover:bg-white/20 text-white font-medium cursor-pointer border border-white/15"
                        : "bg-transparent text-white/40 font-normal cursor-not-allowed border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all ${
                        isActive
                          ? "bg-slate-900 text-white"
                          : isCompleted
                          ? "bg-white/25 text-white"
                          : "bg-transparent text-white/40 border border-white/20"
                      }`}
                    >
                      {isCompleted ? "✓" : s.num}
                    </div>

                    <span className="text-[13px] tracking-wide truncate">{s.label}</span>

                    {isActive && (
                      <span className="material-symbols-rounded text-[18px] text-slate-900 ml-auto shrink-0">
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
