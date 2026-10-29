import React, { useState, useEffect, useRef } from "react";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "./SectionHeader";
import { Pencil } from "lucide-react";

export interface EmailSectionProps {
  email: string;
  setEmail: (email: string) => void;
  editingFieldId: string | null;
  setEditingFieldId: (id: string | null) => void;
  attentionCounter: number;
  setAttentionCounter: (val: number | ((prev: number) => number)) => void;
  showSuccess: (title: string, message: string) => void;
}

export function EmailSection({
  email,
  setEmail,
  editingFieldId,
  setEditingFieldId,
  attentionCounter,
  setAttentionCounter,
  showSuccess
}: EmailSectionProps) {
  const isEditing = editingFieldId === "email";
  const isAnotherEditing = editingFieldId !== null && editingFieldId !== "email";

  const [step, setStep] = useState<"email" | "code">("email");
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");

  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const [loading, setLoading] = useState(false);

  const [shouldAnimate, setShouldAnimate] = useState(false);
  const lastAttentionRef = useRef(attentionCounter);

  // Attention request trigger animation
  useEffect(() => {
    if (isEditing && attentionCounter > lastAttentionRef.current) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 400);
      lastAttentionRef.current = attentionCounter;
      return () => clearTimeout(timer);
    }
    lastAttentionRef.current = attentionCounter;
  }, [attentionCounter, isEditing]);

  // Countdown timer for resending code
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "code" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleEditClick = () => {
    if (isAnotherEditing) {
      setAttentionCounter(prev => prev + 1);
      return;
    }
    setEditingFieldId("email");
    setStep("email");
    setNewEmail("");
    setCode("");
    setEmailError("");
    setCodeError("");
  };

  const handleSendCode = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      setEmailError("Ingresa un correo electrónico válido.");
      return;
    }
    if (newEmail.trim().toLowerCase() === email.trim().toLowerCase()) {
      setEmailError("El nuevo correo debe ser diferente al actual.");
      return;
    }

    try {
      setLoading(true);
      setEmailError("");
      const response = await fetch("/api/account/email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: newEmail }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "No pudimos enviar el código.");
      }

      setStep("code");
      setCode("");
      setCodeError("");
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : "No pudimos enviar el código.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (code.length < 6) {
      setCodeError("El código de verificación debe tener 6 dígitos.");
      return;
    }

    try {
      setLoading(true);
      setCodeError("");
      const response = await fetch("/api/account/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: newEmail, code }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "No pudimos confirmar el código.");
      }

      setEmail(data.email || newEmail);
      localStorage.setItem("luminus_user_email", data.email || newEmail);
      showSuccess("¡Email actualizado!", "Tu dirección de correo ha sido actualizada exitosamente.");

      setEditingFieldId(null);
      setNewEmail("");
      setCode("");
      setEmailError("");
      setCodeError("");
    } catch (error) {
      setCodeError(error instanceof Error ? error.message : "No pudimos confirmar el código.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0) return;

    await handleSendCode();
    setTimeLeft(120);
  };

  const handleCancel = () => {
    setEditingFieldId(null);
    setNewEmail("");
    setCode("");
    setEmailError("");
    setCodeError("");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col">
      <SectionHeader
        title="Correo electrónico"
        description="Tu dirección principal para iniciar sesión y recibir notificaciones."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {!isEditing ? (
          <div className="flex flex-col gap-1.5 w-full max-w-lg relative">
            <label htmlFor="current_email" className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none">
              Correo actual
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <InputField
                  id="current_email"
                  value={email}
                  disabled
                  variant="bordered"
                />
              </div>
              <button
                onClick={handleEditClick}
                className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                  isAnotherEditing
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                }`}
                title="Editar correo electrónico"
                aria-label="Editar correo electrónico"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full max-w-lg relative">
            {/* Email actual read-only */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="active_email" className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none">
                Correo actual
              </label>
              <InputField
                id="active_email"
                value={email}
                disabled
                variant="bordered"
              />
            </div>

            {/* Step 1: Input new email */}
            {step === "email" && (
              <>
                <div className="flex flex-col gap-1 w-full">
                  <InputField
                    id="new_email"
                    label="Nuevo correo electrónico"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      setEmailError("");
                    }}
                    error={emailError}
                    variant="bordered"
                    autoFocus
                  />
                  <p className="text-xs text-slate-500 mt-1 leading-normal">
                    Enviaremos un código a este correo para confirmar el cambio.
                  </p>
                </div>

                <div className="flex gap-2 justify-end mt-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className={`w-auto font-medium text-slate-600 hover:text-slate-900 transition-all duration-200 ${
                      shouldAnimate ? "scale-105" : "scale-100"
                    }`}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSendCode}
                    disabled={loading || !newEmail || !newEmail.includes("@")}
                    className={`w-auto transition-all duration-200 ${
                      shouldAnimate ? "scale-105" : "scale-100"
                    }`}
                  >
                    {loading ? "Enviando..." : "Enviar código"}
                  </Button>
                </div>
              </>
            )}

            {/* Step 2: Verification Code Entry */}
            {step === "code" && (
              <>
                <div className="flex flex-col gap-1 w-full">
                  <InputField
                    id="verification_code"
                    label="Código de verificación"
                    type="text"
                    placeholder="Introduce el código de 6 dígitos"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setCodeError("");
                    }}
                    error={codeError}
                    variant="bordered"
                    autoFocus
                  />
                  <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5 leading-normal">
                    <span>Hemos enviado el código a <strong className="font-semibold text-slate-700">{newEmail}</strong>.</span>
                    <button
                      type="button"
                      disabled={timeLeft > 0}
                      onClick={handleResendCode}
                      className={`font-semibold transition-all text-xs ${timeLeft > 0
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-slate-900 hover:underline cursor-pointer"
                        }`}
                    >
                      Solicitar nuevo código
                    </button>
                    {timeLeft > 0 && (
                      <span className="text-slate-400 tabular-nums font-mono text-xs">
                        ({formatTime(timeLeft)})
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex gap-2 justify-end mt-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className={`w-auto font-medium text-slate-600 hover:text-slate-900 transition-all duration-200 ${
                      shouldAnimate ? "scale-105" : "scale-100"
                    }`}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleConfirm}
                    disabled={loading || code.length < 6}
                    className={`w-auto transition-all duration-200 ${
                      shouldAnimate ? "scale-105" : "scale-100"
                    }`}
                  >
                    {loading ? "Confirmando..." : "Confirmar"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
