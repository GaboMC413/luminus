"use client";

import React from "react";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";

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
  const completedCount = Math.max(0, Math.min(maxVisitedStep - 1, totalSteps));
  const progressPercentage = Math.min((completedCount / totalSteps) * 100, 100);
  const showStepper = !isCheckingStatus && !hideStepper && step <= totalSteps;

  return (
    <div
      className={`hidden lg:flex lg:sticky ${
        hasNavbar ? "lg:top-[64px] lg:h-[calc(100vh-64px)]" : "lg:top-0 lg:h-screen"
      } lg:w-80 xl:w-96 bg-white border-r border-slate-200/90 shrink-0 flex-col items-start py-10 px-8 z-40 transition-all duration-300 overflow-hidden relative`}
    >
      <div className="relative z-10 flex flex-col items-start w-full h-full">
        {/* Desktop Logo */}
        {showLogo && (
          <Link href="/" className="w-fit mb-8 cursor-pointer hover:opacity-80 transition-opacity shrink-0">
            <img src="/logo-luminus-black.svg" alt="Luminus" className="h-[24px]" />
          </Link>
        )}

        {/* Stepper progress */}
        {showStepper && (
          <div className="flex flex-col gap-6 w-full text-slate-900">
            {/* Header */}
            <div className="flex flex-col gap-1.5">
              <span className="text-base font-bold font-jakarta text-slate-900">
                {title}
              </span>
              <span className="text-xs text-slate-500 font-sans font-medium">
                {completedCount} de {totalSteps} pasos completados
              </span>
              <div className="w-full bg-slate-100 border border-slate-200/80 h-2 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-slate-900 h-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Nav List */}
            <div className="flex flex-col gap-2 font-jakarta">
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
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left outline-none focus-visible:ring-2 focus-visible:ring-slate-900 select-none ${
                      isActive
                        ? "bg-slate-900 text-white font-bold shadow-sm"
                        : isCompleted
                        ? "bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium cursor-pointer border border-slate-200/60"
                        : "bg-transparent text-slate-400 font-normal cursor-not-allowed border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        isActive
                          ? "bg-white text-slate-900"
                          : isCompleted
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-transparent text-slate-400 border border-slate-200"
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : s.num}
                    </div>

                    <span className="text-xs sm:text-sm font-medium tracking-normal truncate">{s.label}</span>

                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-white ml-auto shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showLogo && (
          <p className="text-xs font-semibold text-slate-400 font-jakarta mt-auto pt-6">
            LUMINUS LATAM © 2026
          </p>
        )}
      </div>
    </div>
  );
}

export default OnboardingSidebar;
