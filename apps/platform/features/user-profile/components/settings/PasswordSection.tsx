import React, { useState, useEffect, useRef } from "react";
import { InputField } from "@/components/ui/InputField";
import { SectionHeader } from "./SectionHeader";

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
    if (newPassword.length < 12) {
      setPasswordError("La contraseña debe tener al menos 12 caracteres.");
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

  return (
    <div className="w-full flex flex-col">
      <SectionHeader
        title="Contraseña"
        description="Desde aquí puedes cambiar tu contraseña."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {!isEditing ? (
          <div className="flex flex-col gap-2 w-full max-w-lg relative">
            <label className="text-label ml-1">Cambiar contraseña</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <InputField
                  value="••••••••"
                  disabled
                  variant="bordered"
                  className="!bg-slate-50 !border-none !text-slate-500"
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
            <div className="flex flex-col gap-2 w-full">
              <label className="text-label ml-1">Nueva contraseña</label>
              <InputField
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError("");
                }}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                variant="bordered"
                className="bg-white border-black text-black"
                autoFocus
              />
            </div>

            {/* Requirements Checklist */}
            <div className="flex flex-col gap-1.5 px-1 mb-1">
              <div className="flex items-center gap-2 h-5">
                <p className={`text-sm font-normal ${newPassword.length >= 12 ? '!text-green-600 font-semibold' : '!text-slate-500'}`}>
                  Mínimo 12 caracteres
                </p>
                {newPassword.length >= 12 && (
                  <span className="!text-green-600 text-sm font-bold">✓</span>
                )}
              </div>
              <div className="flex items-center gap-2 h-5">
                <p className={`text-sm font-normal ${/[A-Za-z]/.test(newPassword) && /\d/.test(newPassword) ? '!text-green-600 font-semibold' : '!text-slate-500'}`}>
                  Incluir al menos una letra y un número
                </p>
                {/[A-Za-z]/.test(newPassword) && /\d/.test(newPassword) && (
                  <span className="!text-green-600 text-sm font-bold">✓</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label className="text-label ml-1">Repetir nueva contraseña</label>
              <InputField
                type="password"
                placeholder="Repetir nueva contraseña"
                value={repeatPassword}
                onChange={(e) => {
                  setRepeatPassword(e.target.value);
                  setPasswordError("");
                }}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                variant="bordered"
                className="bg-white border-black text-black"
              />
            </div>

            {passwordError && (
              <p className="text-[#FF3D3D] text-label font-bold mt-1 px-1">
                {passwordError}
              </p>
            )}

            <div className="flex gap-2 justify-end mt-1">
              <button
                onClick={() => {
                  setEditingFieldId(null);
                  setNewPassword("");
                  setRepeatPassword("");
                  setPasswordError("");
                }}
                className={`px-3 h-8 text-button text-slate-500 hover:text-slate-900 transition-all duration-300 origin-center ${shouldAnimate ? "scale-110 text-slate-900" : "scale-100"}`}
              >
                Cancelar
              </button>
              <button
                onClick={handlePasswordSave}
                disabled={loading || !newPassword || !repeatPassword}
                className={`px-4 h-8 text-button font-bold bg-black text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 origin-center ${shouldAnimate ? "scale-110" : "scale-100"}`}
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
