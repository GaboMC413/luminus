import React, { useState, useEffect, useRef } from "react";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "./SectionHeader";
import { Pencil, Check } from "lucide-react";

export interface PasswordSectionProps {
  editingFieldId: string | null;
  setEditingFieldId: (id: string | null) => void;
  attentionCounter: number;
  setAttentionCounter: (val: number | ((prev: number) => number)) => void;
  showSuccess: (title: string, message: string) => void;
}

export function PasswordSection({
  editingFieldId,
  setEditingFieldId,
  attentionCounter,
  setAttentionCounter,
  showSuccess
}: PasswordSectionProps) {
  const isEditing = editingFieldId === "password";
  const isAnotherEditing = editingFieldId !== null && editingFieldId !== "password";

  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const lastAttentionRef = useRef(attentionCounter);

  useEffect(() => {
    if (isEditing && attentionCounter > lastAttentionRef.current) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 400);
      lastAttentionRef.current = attentionCounter;
      return () => clearTimeout(timer);
    }
    lastAttentionRef.current = attentionCounter;
  }, [attentionCounter, isEditing]);

  const handlePasswordSave = async () => {
    if (newPassword.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPasswordError("La contraseña debe incluir al menos una letra y un número.");
      return;
    }
    if (newPassword !== repeatPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "No pudimos guardar la contraseña.");
      }

      showSuccess("¡Contraseña guardada!", "Tu nueva contraseña ha sido guardada exitosamente.");
      setNewPassword("");
      setRepeatPassword("");
      setPasswordError("");
      setEditingFieldId(null);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "No pudimos guardar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (isAnotherEditing) {
      setAttentionCounter(prev => prev + 1);
      return;
    }
    setEditingFieldId("password");
  };

  const handleCancel = () => {
    setEditingFieldId(null);
    setNewPassword("");
    setRepeatPassword("");
    setPasswordError("");
  };

  return (
    <div className="w-full flex flex-col">
      <SectionHeader
        title="Contraseña"
        description="Crea una contraseña segura de al menos 8 caracteres con letras y números."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {!isEditing ? (
          <div className="flex flex-col gap-1.5 w-full max-w-lg relative">
            <label htmlFor="current_password_display" className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none">
              Contraseña actual
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <InputField
                  id="current_password_display"
                  value="••••••••••••"
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
                title="Editar contraseña"
                aria-label="Editar contraseña"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full max-w-lg relative">
            <div className="flex flex-col gap-1.5 w-full">
              <InputField
                id="new_password_input"
                label="Nueva contraseña"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError("");
                }}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                variant="bordered"
                autoFocus
              />
            </div>

            {/* Requirements Checklist */}
            <div className="flex flex-col gap-1.5 px-0.5">
              <div className="flex items-center gap-2 h-4">
                <p className={`text-xs font-medium transition-colors ${newPassword.length >= 8 ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  Mínimo 8 caracteres
                </p>
                {newPassword.length >= 8 && (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                )}
              </div>
              <div className="flex items-center gap-2 h-4">
                <p className={`text-xs font-medium transition-colors ${/[A-Za-z]/.test(newPassword) && /\d/.test(newPassword) ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  Incluir al menos una letra y un número
                </p>
                {/[A-Za-z]/.test(newPassword) && /\d/.test(newPassword) && (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <InputField
                id="repeat_password_input"
                label="Confirmar contraseña"
                type="password"
                placeholder="Vuelve a escribir la contraseña"
                value={repeatPassword}
                onChange={(e) => {
                  setRepeatPassword(e.target.value);
                  setPasswordError("");
                }}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                variant="bordered"
                error={passwordError}
              />
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
                onClick={handlePasswordSave}
                disabled={loading || newPassword.length < 8 || !repeatPassword}
                className={`w-auto transition-all duration-200 ${
                  shouldAnimate ? "scale-105" : "scale-100"
                }`}
              >
                {loading ? "Guardando..." : "Guardar contraseña"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
