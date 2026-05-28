import React, { useState, useEffect, useRef } from "react";
import { InputField } from "@/components/ui/InputField";
import { SectionHeader } from "./SectionHeader";

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

  // Countdown timer effect
  useEffect(() => {
    if (!isEditing || step !== "code") return;

    setTimeLeft(120);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isEditing, step]);

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

  const handleSendCode = () => {
    if (!newEmail || !newEmail.includes("@")) {
      setEmailError("Por favor, ingresa un correo electrónico válido.");
      return;
    }
    setEmailError("");
    setStep("code");
    setCode("");
    setCodeError("");
  };

  const handleConfirm = () => {
    if (code.length < 6) {
      setCodeError("El código de verificación debe tener 6 dígitos.");
      return;
    }

    // Success flow
    setEmail(newEmail);
    localStorage.setItem("luminus_user_email", newEmail);
    showSuccess("¡Email actualizado!", "Tu dirección de correo ha sido actualizada exitosamente.");

    // Reset editing
    setEditingFieldId(null);
    setNewEmail("");
    setCode("");
    setEmailError("");
    setCodeError("");
  };

  const handleResendCode = () => {
    if (timeLeft > 0) return;

    // Reset timer
    setTimeLeft(120);
    setCode("");
    setCodeError("");
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
        description="Gestiona tu dirección de correo para notificaciones e inicio de sesión."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {!isEditing ? (
          <div className="flex flex-col gap-2 w-full max-w-lg relative">
            <label className="text-label ml-1">Email actual</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <InputField
                  value={email}
                  disabled
                  variant="bordered"
                  className="!bg-slate-50 !border-none text-slate-900"
                />
              </div>
              <button
                onClick={handleEditClick}
                className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all ${isAnotherEditing ? "text-slate-300 cursor-not-allowed" : "text-slate-400 hover:text-black hover:bg-slate-100"}`}
                title="Editar"
              >
                <span className="material-symbols-rounded text-[18px]">edit</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full max-w-lg relative">
            {/* Email actual read-only */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-label ml-1">Email actual</label>
              <InputField
                value={email}
                disabled
                variant="bordered"
                className="!bg-slate-50 !border-none text-slate-900"
              />
            </div>

            {/* Step 1: Input new email */}
            {step === "email" && (
              <>
                <div className="flex flex-col gap-2 w-full">
                  <label className="text-label ml-1">Nuevo email</label>
                  <InputField
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      setEmailError("");
                    }}
                    variant="bordered"
                    className="bg-white border-black text-black"
                    autoFocus
                  />
                  <p className="text-sm font-normal text-slate-500 mt-1">
                    Enviaremos un código a este correo para confirmar el cambio.
                  </p>
                  {emailError && (
                    <p className="text-[#FF3D3D] text-label font-bold mt-1 px-1">
                      {emailError}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 justify-end mt-1">
                  <button
                    onClick={handleCancel}
                    className={`px-3 h-8 text-button text-slate-500 hover:text-slate-900 transition-all duration-300 origin-center ${shouldAnimate ? "scale-110 text-slate-900" : "scale-100"}`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSendCode}
                    disabled={!newEmail || !newEmail.includes("@")}
                    className={`px-4 h-8 text-button font-bold bg-black text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 origin-center ${shouldAnimate ? "scale-110" : "scale-100"}`}
                  >
                    Enviar código
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Verification Code Entry */}
            {step === "code" && (
              <>
                <div className="flex flex-col gap-2 w-full">
                  <label className="text-label ml-1">Ingresar código</label>
                  <InputField
                    type="text"
                    placeholder="Introduce el código de 6 dígitos"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setCodeError("");
                    }}
                    variant="bordered"
                    className="bg-white border-black text-black"
                    autoFocus
                  />
                  <p className="text-sm font-normal text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                    <span>Hemos enviado el código a <strong className="font-semibold text-slate-700">{newEmail}</strong>.</span>
                    <button
                      disabled={timeLeft > 0}
                      onClick={handleResendCode}
                      className={`font-semibold transition-all text-sm ${timeLeft > 0
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-black hover:underline cursor-pointer"
                        }`}
                    >
                      Solicitar nuevo código
                    </button>
                    {timeLeft > 0 && (
                      <span className="font-base text-slate-300 tabular-nums">
                        ({formatTime(timeLeft)})
                      </span>
                    )}
                  </p>
                  {codeError && (
                    <p className="text-[#FF3D3D] text-label font-bold mt-1 px-1">
                      {codeError}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 justify-end mt-2">
                  <button
                    onClick={handleCancel}
                    className={`px-3 h-8 text-button text-slate-500 hover:text-slate-900 transition-all duration-300 origin-center ${shouldAnimate ? "scale-110 text-slate-900" : "scale-100"}`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={code.length < 6}
                    className={`px-4 h-8 text-button font-bold bg-black text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 origin-center ${shouldAnimate ? "scale-110" : "scale-100"}`}
                  >
                    Confirmar
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
