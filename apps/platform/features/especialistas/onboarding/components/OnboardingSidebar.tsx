"use client";

import React from "react";
import Link from "next/link";

interface OnboardingSidebarProps {
  step: number;
  maxVisitedStep?: number;
  onStepClick?: (stepNum: number) => void;
  isCheckingStatus?: boolean;
  hideStepper?: boolean;
  stepsList?: { num: number; label: string }[];
  title?: string;
  showLogo?: boolean;
  hasNavbar?: boolean;
}

const DEFAULT_STEPS = [
  { num: 1, label: "Información inicial" },
  { num: 2, label: "Perfil profesional" },
  { num: 3, label: "Sesiones introductorias" },
  { num: 4, label: "Espacios de atención" },
  { num: 5, label: "Cursos y talleres" },
];

export function OnboardingSidebar({
  step,
  maxVisitedStep = 1,
  onStepClick,
  isCheckingStatus = false,
  hideStepper = false,
  stepsList = DEFAULT_STEPS,
  title = "Aplicación como Especialista",
  showLogo = false,
  hasNavbar = true,
}: OnboardingSidebarProps) {
  const totalSteps = stepsList.length;
  // Number of completed steps prior to or up to maxVisitedStep
  const completedCount = Math.max(0, Math.min(maxVisitedStep - 1, totalSteps));
  const progressPercentage = Math.min((completedCount / totalSteps) * 100, 100);
  const showStepper = !isCheckingStatus && !hideStepper && step <= totalSteps;

  return (
    <div
      className={`hidden lg:flex lg:sticky ${
        hasNavbar ? "lg:top-[64px] lg:h-[calc(100vh-64px)]" : "lg:top-0 lg:h-screen"
      } lg:w-80 xl:w-96 luminus-light-gradient border-r border-slate-200 shrink-0 flex-col items-start py-10 px-8 z-50 transition-all duration-500 overflow-hidden relative`}
    >
      <div className="relative z-10 flex flex-col items-start w-full h-full">
        {/* Desktop Logo */}
        {showLogo && (
          <Link href="/" className="w-fit mb-8 cursor-pointer hover:opacity-80 transition-opacity shrink-0">
            <img src="/logo-luminus-black.svg" alt="Luminus" className="h-[24px]" />
          </Link>
        )}

        {/* Mobile Header Stepper (small screens) */}
        {showStepper && (
          <div className="flex lg:hidden flex-col gap-2 w-full mt-3 text-slate-900">
            <div className="flex justify-between items-center text-[12px] font-jakarta">
              <span className="font-bold uppercase tracking-wider text-slate-900">{title}</span>
              <span className="text-slate-500 font-semibold">{completedCount} de {totalSteps} completados</span>
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
                {title}
              </span>
              <span className="text-[13px] text-slate-500 font-sans font-medium">
                {completedCount} de {totalSteps} pasos completados
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

        {showLogo && (
          <p className="hidden lg:block text-label !text-slate-400 uppercase tracking-wider font-sans mt-auto pt-6">
            LUMINUS LATAM © 2026
          </p>
        )}
      </div>
    </div>
  );
}
