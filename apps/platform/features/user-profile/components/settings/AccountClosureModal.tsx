"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Clock, RefreshCw, ArrowLeft } from "lucide-react";

interface AccountClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: string;
  selectedPlan?: string;
}

const CLOSURE_REASONS = [
  { id: "break", label: "Me estoy tomando una pausa o descanso" },
  { id: "lack_of_time", label: "Falta de tiempo para aprovechar la plataforma" },
  { id: "budget", label: "Motivos económicos o de presupuesto" },
  { id: "not_found", label: "No encontré lo que estaba buscando" },
  { id: "other", label: "Otro motivo" },
];

export function AccountClosureModal({
  isOpen,
  onClose,
  tier,
}: AccountClosureModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [membershipEndDate, setMembershipEndDate] = useState<string | null>(null);

  const isPaidUser = tier !== "FREE";

  useEffect(() => {
    if (isOpen && isPaidUser) {
      fetch("/api/membership/billing-details")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.subscription?.currentPeriodEnd) {
            const date = new Date(data.subscription.currentPeriodEnd * 1000);
            const formatted = date.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            setMembershipEndDate(formatted);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, isPaidUser]);

  const handleReset = () => {
    setStep(1);
    setSelectedReason("");
    setFeedback("");
    setErrorMessage(null);
    setIsSubmitting(false);
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      handleReset();
      onClose();
    }
  };

  const handleConfirmClosure = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const reasonLabel = CLOSURE_REASONS.find((r) => r.id === selectedReason)?.label || selectedReason;

    try {
      const response = await fetch("/api/account/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reason: reasonLabel,
          feedback: feedback.trim() || undefined,
        }),
      });

      if (response.ok) {
        handleReset();
        router.push("/auth/iniciar-sesion?account_closed=1");
      } else {
        const data = await response.json().catch(() => ({}));
        setErrorMessage(data.message || "No pudimos procesar el cierre de tu cuenta. Por favor intenta de nuevo.");
      }
    } catch {
      setErrorMessage("Error de conexión al cerrar la cuenta. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      maxWidth="500px"
      title={
        <span className="text-base font-bold text-slate-900 font-jakarta">
          Cerrar cuenta
        </span>
      }
      subtitle={
        step === 1
          ? "Gracias por haber sido parte de LUMINUS. Nos gustaría saber el motivo de esta decisión para seguir aprendiendo y mejorando lo que hacemos."
          : isPaidUser
          ? "Lo que sucederá con tu cuenta y tu suscripción."
          : "Lo que sucederá con tu cuenta."
      }
      footer={
        <div className="flex items-center justify-between w-full gap-3 pt-2">
          {step === 1 ? (
            <>
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="text-xs h-10 px-4 text-slate-700 hover:text-slate-900"
              >
                Prefiero quedarme
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(2)}
                disabled={!selectedReason}
                className="text-xs h-10 px-5 !bg-slate-900 hover:!bg-slate-800 text-white border-none shadow-sm disabled:opacity-50"
              >
                Continuar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="text-xs h-10 px-4 text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmClosure}
                disabled={isSubmitting}
                className="text-xs h-10 px-5 !bg-rose-600 hover:!bg-rose-700 text-white border-none shadow-sm"
              >
                {isSubmitting ? "Cerrando cuenta..." : "Cerrar mi cuenta"}
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4 py-1 font-sans text-sm">
        {errorMessage && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {step === 1 ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              {CLOSURE_REASONS.map((reason) => {
                const isSelected = selectedReason === reason.id;
                return (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setSelectedReason(reason.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all text-xs font-medium cursor-pointer ${
                      isSelected
                        ? "border-sky-500 bg-sky-50/50 text-sky-900 shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span>{reason.label}</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-sky-600 bg-sky-600"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <label htmlFor="closure-feedback" className="text-xs font-medium text-slate-600">
                ¿Hay algo adicional que desees contarnos? (Opcional)
              </label>
              <textarea
                id="closure-feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tus comentarios nos ayudan a crear una mejor comunidad..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 resize-none transition-all"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {isPaidUser ? (
              <>
                <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex flex-col gap-1 text-xs text-amber-900 leading-relaxed">
                  <span className="font-semibold text-amber-950">
                    Membresía activa y renovación detenida
                  </span>
                  <p className="m-0 text-amber-900/90">
                    Cancelaremos la renovación automática de tu suscripción para que <strong>nunca se te vuelva a cobrar</strong> ningún cargo futuro.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col gap-1.5 text-xs text-slate-700 leading-relaxed">
                  <div className="font-semibold text-slate-900">
                    Tu tiempo pagado está garantizado
                  </div>
                  <p className="m-0 text-slate-600">
                    Tu cuenta se cerrará a partir de este momento y no recibirás más correos ni avisos. Sin embargo, <strong>puedes volver a iniciar sesión cuando quieras mientras tu membresía esté vigente</strong> para reactivar tu cuenta con todos tus beneficios intactos.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col gap-1.5 text-xs text-slate-700 leading-relaxed">
                  <div className="font-semibold text-slate-900">
                    Periodo de gracia adicional de 90 días
                  </div>
                  <p className="m-0 text-slate-600">
                    Al finalizar tu periodo de membresía{membershipEndDate ? ` (${membershipEndDate})` : ""}, contarás con <strong>90 días de periodo de gracia adicional</strong> antes de que tu cuenta se elimine definitivamente.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <span>Periodo de gracia de 90 días</span>
                  </div>
                  <p className="m-0 text-slate-600">
                    Tu cuenta se cerrará de inmediato y tu perfil dejará de ser visible en la comunidad. Si en algún momento decides regresar, <strong>solo inicia sesión dentro de los próximos 90 días</strong> y recupera toda tu información al instante.
                  </p>
                  <p className="m-0 text-rose-600 font-medium text-[11px] pt-1 border-t border-slate-200/70">
                    Si no inicias sesión dentro de los 90 días, tu cuenta e información personal se eliminarán de forma definitiva e irreversible.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
