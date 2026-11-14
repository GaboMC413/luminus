"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export interface StepperNavProps {
  onBack?: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  showBack?: boolean;
  className?: string;
}

export function StepperNav({
  onBack,
  onNext,
  backLabel = "Volver",
  nextLabel = "Siguiente",
  disabled = false,
  loading = false,
  showBack = true,
  className = "",
}: StepperNavProps) {
  return (
    <div className={`flex justify-between items-center gap-3 mt-8 pt-4 border-t border-slate-100 ${className}`}>
      <div>
        {showBack && onBack ? (
          <Button
            type="button"
            variant="back"
            onClick={onBack}
            disabled={loading}
          >
            {backLabel}
          </Button>
        ) : null}
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={onNext}
        disabled={disabled || loading}
        className="px-6"
      >
        {loading ? "Cargando..." : nextLabel}
      </Button>
    </div>
  );
}

export default StepperNav;
