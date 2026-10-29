"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface SwitchPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInterval: "month" | "year";
  nextRenewalDate?: string;
  onSuccess: () => void;
}

export function SwitchPlanModal({
  isOpen,
  onClose,
  currentInterval,
  nextRenewalDate,
  onSuccess,
}: SwitchPlanModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSwitchingToAnnual = currentInterval === "month";
  const targetInterval = isSwitchingToAnnual ? "year" : "month";

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/membership/switch-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetInterval }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al cambiar el plan.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "No se pudo cambiar el plan. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSwitchingToAnnual ? "Mecenas Anual" : "Mecenas Mensual"}
      subtitle={
        isSwitchingToAnnual
          ? "Ahorra un 25% y mantén todos tus beneficios con un único pago anual."
          : "Cambia a facturación mensual sin perder tus beneficios."
      }
      maxWidth="440px"
    >
      <div className="flex flex-col gap-4 font-sans">
        {errorMessage && (
          <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* Clean summary card without divider lines */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 font-jakarta">
              {isSwitchingToAnnual ? "Mecenas Anual" : "Mecenas Mensual"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-extrabold text-slate-900 font-jakarta">
                {isSwitchingToAnnual ? "USD 45" : "USD 5"}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {isSwitchingToAnnual ? "/ año (USD 3.75/mes)" : "/ mes"}
              </span>
            </div>
          </div>

          {nextRenewalDate && (
            <p className="text-xs text-slate-500 m-0 leading-relaxed pt-1">
              Entra en vigencia el <strong className="text-slate-800">{nextRenewalDate}</strong> cuando tu plan actual finalice.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 !h-10 text-xs text-slate-600 hover:text-slate-900"
          >
            Volver
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 !h-10 text-xs font-semibold !bg-slate-900 hover:!bg-black text-white rounded-xl shadow-none"
          >
            {loading
              ? "Guardando..."
              : isSwitchingToAnnual
              ? "Cambiar a Anual"
              : "Cambiar a Mensual"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
