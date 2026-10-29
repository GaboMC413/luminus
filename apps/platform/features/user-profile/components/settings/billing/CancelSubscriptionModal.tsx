"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextRenewalDate: string;
  onSuccess: () => void;
}

const CANCEL_REASONS = [
  "Costo elevado o presupuesto",
  "No utilizo la membresía con frecuencia",
  "Problemas técnicos o de uso",
  "Otro motivo",
];

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  nextRenewalDate,
  onSuccess,
}: CancelSubscriptionModalProps) {
  const [canceling, setCanceling] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCancel = async () => {
    setCanceling(true);
    setErrorMessage(null);
    try {
      const finalReason =
        selectedReason === "Otro motivo"
          ? customReason.trim() || "Otro motivo"
          : selectedReason;

      const res = await fetch("/api/membership/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: finalReason || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al cancelar la membresía.");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "No se pudo cancelar la membresía. Intenta de nuevo.");
    } finally {
      setCanceling(false);
    }
  };

  const handleClose = () => {
    if (canceling) return;
    setSelectedReason("");
    setCustomReason("");
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="¿Deseas cancelar tu membresía?"
      subtitle="Podrás continuar disfrutando de todos los beneficios de Mecenas hasta el final del período actual."
      maxWidth="480px"
    >
      <div className="flex flex-col gap-4 font-sans">
        {errorMessage && (
          <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* Transition details box */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-1 text-xs text-slate-600">
          <span className="text-slate-500 font-medium">Serás Mecenas hasta:</span>
          <span className="text-sm font-bold text-slate-900 font-jakarta">{nextRenewalDate}</span>
          <p className="pt-1 text-slate-500 m-0 leading-relaxed">
            A partir de esa fecha no se realizarán nuevos cobros automáticos a tu tarjeta y tu cuenta pasará automáticamente a Miembro Gratuito.
          </p>
        </div>

        {/* Feedback / Cancellation Reason */}
        <div className="flex flex-col gap-2 pt-0.5">
          <label className="text-xs font-semibold text-slate-700 font-jakarta">
            ¿Nos cuentas el motivo de tu cancelación? (Opcional)
          </label>
          <div className="flex flex-col gap-1.5">
            {CANCEL_REASONS.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                  selectedReason === reason
                    ? "border-slate-900 bg-slate-50/80 font-medium text-slate-900"
                    : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="cancel_reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="text-slate-900 focus:ring-slate-900 h-3.5 w-3.5 cursor-pointer"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          {selectedReason === "Otro motivo" && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Cuéntanos brevemente qué podemos mejorar..."
              aria-label="Detalla el motivo de tu cancelación"
              rows={2}
              className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none text-slate-900 placeholder:text-slate-400 resize-none font-sans"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleClose}
            disabled={canceling}
            className="w-auto"
          >
            Mantener membresía
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={handleCancel}
            disabled={canceling}
            className="w-auto"
          >
            {canceling ? "Cancelando..." : "Confirmar cancelación"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
