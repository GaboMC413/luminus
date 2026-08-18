"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlatformFooter } from "@/components/ui/PlatformFooter";

export default function ForgotPasswordView() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [view, setView] = useState<'email' | 'code' | 'reset' | 'success'>('email');
  const [timer, setTimer] = useState(180); // 3 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Timer logic for resending code
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (view === 'code' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [view, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResetPasswordRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setMessage({ text: "Por favor, ingresa tu correo electrónico.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/api/auth/recover/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage({ text: data.message ?? "No pudimos enviar el correo de recuperación.", type: "error" });
        return;
      }

      setView('code');
      setTimer(180); // Reset timer
      setCanResend(false);
      setMessage({
        text: "Si existe una cuenta con ese correo, enviaremos un código de recuperación.",
        type: "success"
      });
    } catch {
      setMessage({ text: "No pudimos conectar con el servidor.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setMessage({ text: "Por favor, ingresa el código.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/api/auth/recover/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage({ text: data.message ?? "El código es incorrecto o ha expirado.", type: "error" });
        return;
      }

      setView('reset');
    } catch {
      setMessage({ text: "No pudimos conectar con el servidor.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setMessage({ text: "Por favor, completa ambos campos.", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: "Las contraseñas no coinciden.", type: "error" });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ text: "La contraseña debe tener al menos 8 caracteres.", type: "error" });
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword)) {
      setMessage({ text: "La contraseña debe incluir letras mayúsculas y minúsculas.", type: "error" });
      return;
    }
    if (!/\d/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      setMessage({ text: "La contraseña debe incluir al menos un número y un símbolo.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/api/auth/recover/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage({ text: data.message ?? "Error al actualizar la contraseña.", type: "error" });
        return;
      }

      setView('success');
    } catch {
      setMessage({ text: "No pudimos conectar con el servidor.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-fixed-page flex flex-col lg:flex-row font-sans bg-slate-50 text-slate-900">
      
      {/* 1. Left Branding/Marketing Pane (Desktop only) */}
      <div className="hidden lg:flex lg:w-[40%] xl:w-[45%] luminus-gradient flex-col justify-between p-12 lg:p-16 shrink-0 relative overflow-hidden border-r border-slate-200/10 animate-in slide-in-from-left duration-500">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          <Link href="/" className="w-fit cursor-pointer hover:opacity-80 transition-opacity">
            <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[24px]" />
          </Link>

          <div className="flex flex-col gap-6 max-w-md mt-20 animate-in fade-in duration-700">
            <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight tracking-[-0.03em]">
              Recuperar contraseña
            </h1>
            <p className="text-xl text-white/90 leading-relaxed font-normal tracking-[-0.02em]">
              Un espacio para conectar con personas, especialistas y recursos que te ayudan a avanzar con más claridad, bienestar y propósito.
            </p>
          </div>

          <p className="text-label !text-white/70 uppercase tracking-wider font-sans mt-auto">
            LUMINUS LATAM © 2026
          </p>
        </div>
      </div>

      {/* 2. Right Form Pane */}
      <div className="flex-1 flex flex-col bg-slate-50 min-h-0 h-full overflow-hidden pt-14 lg:pt-0 animate-in fade-in duration-300">
        
        {/* Mobile Header: Logo */}
        <div className="fixed top-0 left-0 right-0 lg:hidden w-full h-14 luminus-gradient flex items-center justify-center shrink-0 z-50">
          <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
            <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[20px]" />
          </Link>
        </div>

        {/* Central Content Area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 md:py-16">
          <div className="w-full max-w-[344px] md:max-w-[380px] flex flex-col gap-8">
            
            {/* Title Section */}
            <div className="flex flex-col gap-1 w-full text-center md:text-left">
              <h2 className="text-black text-xl font-semibold leading-normal">
                {view === 'email' && 'Recuperar contraseña'}
                {view === 'code' && 'Confirma tu cuenta'}
                {view === 'reset' && 'Crea tu nueva contraseña'}
                {view === 'success' && '¡Contraseña restablecida!'}
              </h2>
              <p className="text-slate-500 text-body-small leading-relaxed">
                {view === 'email' && 'Ingresa tu correo y te enviaremos un código para restablecer tu contraseña.'}
                {view === 'code' && (
                  <>
                    Enviamos un código de 6 dígitos a <span className="font-semibold text-slate-800">{email}</span>.
                  </>
                )}
                {view === 'reset' && 'Establece tu nueva contraseña para volver a acceder a tu cuenta.'}
                {view === 'success' && 'Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión con tus nuevas credenciales.'}
              </p>
            </div>

            {/* Forms section */}
            {view !== 'success' ? (
              <form
                onSubmit={
                  view === 'email' ? handleResetPasswordRequest :
                  view === 'code' ? handleVerifyCode :
                  handleUpdatePassword
                }
                className="flex flex-col w-full"
              >
                <div className="flex flex-col gap-3.5">
                  {view === 'email' && (
                    <InputField
                      type="email"
                      placeholder="Correo electrónico"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (message.type === 'error') setMessage({ text: "", type: "" });
                      }}
                      variant="clean"
                      className={`!bg-white border border-zinc-200/80 focus:border-slate-800 ${message.type === 'error' && !email ? '!ring-2 !ring-[#FF3D3D]' : ''}`}
                      enterKeyHint="go"
                    />
                  )}

                  {view === 'code' && (
                    <InputField
                      type="text"
                      placeholder="Código de 6 dígitos"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        if (message.type === 'error') setMessage({ text: "", type: "" });
                      }}
                      variant="clean"
                      className={`!bg-white border border-zinc-200/80 focus:border-slate-800 ${message.type === 'error' && !code ? '!ring-2 !ring-[#FF3D3D]' : ''}`}
                      enterKeyHint="go"
                    />
                  )}

                  {view === 'reset' && (
                    <div className="flex flex-col gap-3.5">
                      <InputField
                        type="password"
                        placeholder="Nueva contraseña"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (message.type === 'error') setMessage({ text: "", type: "" });
                        }}
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                        variant="clean"
                        className={`!bg-white border border-zinc-200/80 focus:border-slate-800 ${message.type === 'error' && (!newPassword || newPassword.length < 12) ? '!ring-2 !ring-[#FF3D3D]' : ''}`}
                        enterKeyHint="next"
                      />

                      {/* Password Requirements Checklist - Sleek Stacked Layout */}
                      <div className="flex flex-col gap-1.5 px-0 mb-2">
                        <div className="flex items-center justify-between sm:justify-start gap-1.5 h-6 sm:h-5">
                          <p className={`text-xs sm:text-sm font-normal tracking-tight ${newPassword.length >= 8 ? 'text-green-600' : 'text-slate-500'}`}>
                            Mínimo 8 caracteres
                          </p>
                          {newPassword.length >= 8 && (
                            <span className="text-green-600 text-sm sm:text-base font-bold">✓</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between sm:justify-start gap-1.5 h-6 sm:h-5">
                          <p className={`text-xs sm:text-sm font-normal tracking-tight ${/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? 'text-green-600' : 'text-slate-500'}`}>
                            Mayúsculas y minúsculas
                          </p>
                          {/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) && (
                            <span className="text-green-600 text-sm sm:text-base font-bold">✓</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between sm:justify-start gap-1.5 h-6 sm:h-5">
                          <p className={`text-xs sm:text-sm font-normal tracking-tight ${/\d/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : 'text-slate-500'}`}>
                            Al menos un número y un símbolo
                          </p>
                          {/\d/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) && (
                            <span className="text-green-600 text-sm sm:text-base font-bold">✓</span>
                          )}
                        </div>
                      </div>

                      <InputField
                        type="password"
                        placeholder="Repetir nueva contraseña"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (message.type === 'error') setMessage({ text: "", type: "" });
                        }}
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                        variant="clean"
                        className={`!bg-white border border-zinc-200/80 focus:border-slate-800 ${message.type === 'error' && (!confirmPassword || newPassword !== confirmPassword) ? '!ring-2 !ring-[#FF3D3D]' : ''}`}
                        enterKeyHint="go"
                      />
                    </div>
                  )}
                </div>

                {message.text && (
                  <p className={`text-left px-0 mt-4 text-xs sm:text-sm font-bold tracking-tight ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                    {message.text}
                  </p>
                )}

                <div className="flex flex-col items-center gap-4 mt-6">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? "Cargando..." : view === 'reset' ? "Restablecer contraseña" : "Continuar"}
                  </Button>

                  {view === 'code' && (
                    <button
                      type="button"
                      onClick={() => handleResetPasswordRequest()}
                      disabled={!canResend || loading}
                      className="text-body-small text-slate-500 hover:text-slate-900 text-center leading-tight font-sans px-2 underline transition-all font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {canResend ? "Solicitar nuevo código" : `Solicitar nuevo código (${formatTime(timer)})`}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => router.push("/auth/iniciar-sesion")}
                    className="text-body-small text-slate-500 hover:text-slate-900 text-center leading-tight font-sans px-2 underline transition-all font-medium cursor-pointer bg-transparent border-none outline-none"
                  >
                    Volver al inicio de sesión
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center w-full gap-4 mt-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => router.push("/auth/iniciar-sesion")}
                >
                  Iniciar sesión
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Auth Page Footer */}
        <PlatformFooter className="bg-transparent border-t-0 py-4 shrink-0 lg:hidden" />


      </div>
    </div>
  );
}
