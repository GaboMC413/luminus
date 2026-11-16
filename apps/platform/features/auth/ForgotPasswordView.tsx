"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { TurnstileWidget } from "@/components/TurnstileWidget";

export default function ForgotPasswordView() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" | "" }>({
    text: "",
    type: "",
  });
  const [view, setView] = useState<"email" | "code" | "reset" | "success">("email");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const codeInputRef = useRef<HTMLInputElement>(null);

  // Countdown for resend code
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus code input when verification screen opens
  useEffect(() => {
    if (view === "code") {
      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 150);
    }
  }, [view]);

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
        body: JSON.stringify({ email: email.trim().toLowerCase(), turnstileToken }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage({
          text: data.message ?? "No pudimos enviar el correo de recuperación.",
          type: "error",
        });
        return;
      }

      setView("code");
      setCode("");
      setResendCooldown(60);
      setMessage({ text: "", type: "" });
    } catch {
      setMessage({ text: "No pudimos conectar con el servidor.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resending || resendCooldown > 0) return;
    setResending(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/api/auth/recover/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), turnstileToken }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage({
          text: data.message ?? "No pudimos reenviar el código.",
          type: "error",
        });
      } else {
        setMessage({ text: "Nuevo código enviado a tu correo.", type: "success" });
        setResendCooldown(60);
      }
    } catch {
      setMessage({ text: "Error de conexión al reenviar el código.", type: "error" });
    } finally {
      setResending(false);
    }
  };

  const handleVerifyCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length < 6) {
      setMessage({ text: "Ingresa el código completo de 6 dígitos.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/api/auth/recover/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage({
          text: data.message ?? "El código es incorrecto o ha expirado.",
          type: "error",
        });
        return;
      }

      setMessage({ text: "", type: "" });
      setView("reset");
    } catch {
      setMessage({ text: "No pudimos conectar con el servidor.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);

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
    if (!hasMinLength) {
      setMessage({ text: "La contraseña debe tener al menos 8 caracteres.", type: "error" });
      return;
    }
    if (!hasLetter) {
      setMessage({
        text: "La contraseña debe incluir al menos una letra.",
        type: "error",
      });
      return;
    }
    if (!hasNumber) {
      setMessage({
        text: "La contraseña debe incluir al menos un número.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/api/auth/recover/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          newPassword,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage({
          text: data.message ?? "Error al actualizar la contraseña.",
          type: "error",
        });
        return;
      }

      setMessage({ text: "", type: "" });
      setView("success");
    } catch {
      setMessage({ text: "No pudimos conectar con el servidor.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col justify-between font-sans selection:bg-slate-200">
      <div className="flex-1 flex flex-col items-center justify-start sm:justify-center px-4 py-8 sm:py-12">
        <main className="w-full max-w-[380px] mx-auto flex flex-col items-center animate-fade-in-up">
          {/* Header unit with persistent brand anchor */}
          <header className="flex flex-col items-center text-center gap-2 mb-5">
            <Link href="/" className="inline-flex items-center mb-1">
              <img src="/iso-logo-black.svg" alt="LUMINUS" className="h-[36px] w-[36px]" />
            </Link>
            <h1 className="text-2xl sm:text-[26px] font-bold font-jakarta text-slate-900 tracking-tight m-0">
              {view === "email" && "Recuperar contraseña"}
              {view === "code" && "Confirma tu correo"}
              {view === "reset" && "Crea tu nueva contraseña"}
              {view === "success" && "¡Contraseña restablecida!"}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-[320px] m-0">
              {view === "email" &&
                "Ingresa tu correo y te enviaremos un código para restablecer tu contraseña."}
              {view === "code" && (
                <>
                  Ingresa el código de 6 dígitos que enviamos a{" "}
                  <span className="font-semibold text-slate-900 block mt-0.5">{email}</span>
                </>
              )}
              {view === "reset" &&
                "Establece tu nueva contraseña para volver a acceder a tu cuenta."}
              {view === "success" &&
                "Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión con tus nuevas credenciales."}
            </p>
          </header>

          {/* Content Block */}
          <div className="w-full flex flex-col gap-4">

            {view === "email" && (
              <>
                <form onSubmit={handleResetPasswordRequest} className="flex flex-col gap-3">
                  <InputField
                    type="email"
                    required
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (message.type) setMessage({ text: "", type: "" });
                    }}
                    enterKeyHint="go"
                  />

                  {message.text && (
                    <div
                      className={`p-3 rounded-xl text-xs text-center border ${
                        message.type === "error"
                          ? "bg-red-50 border-red-100 text-red-600"
                          : "bg-emerald-50 border-emerald-100 text-emerald-700"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? "Enviando..." : "Continuar"}
                  </Button>

                  <TurnstileWidget
                    onSuccess={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken(null)}
                  />
                </form>

                <div className="flex justify-center">
                  <Link
                    href="/iniciar-sesion"
                    className="text-xs sm:text-sm text-slate-500 hover:text-slate-900 underline underline-offset-2 font-medium transition-colors"
                  >
                    Volver al inicio de sesión
                  </Link>
                </div>
              </>
            )}

            {view === "code" && (
              <>
                <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
                  <input
                    ref={codeInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="Código de 6 dígitos"
                    value={code}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setCode(val);
                      if (message.type) setMessage({ text: "", type: "" });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && code.length >= 6) {
                        e.preventDefault();
                        handleVerifyCode();
                      }
                    }}
                    className={`w-full h-12 px-4 text-center bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal ${
                      code
                        ? "font-mono text-xl tracking-[0.35em] font-bold text-slate-900"
                        : "font-sans text-sm tracking-normal"
                    }`}
                  />

                  {message.text && (
                    <div
                      className={`p-3 rounded-xl text-xs text-center border ${
                        message.type === "error"
                          ? "bg-red-50 border-red-100 text-red-600"
                          : "bg-emerald-50 border-emerald-100 text-emerald-700"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || code.length < 6}
                  >
                    {loading ? "Verificando..." : "Verificar y continuar"}
                  </Button>
                </form>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resending || resendCooldown > 0}
                    className="hover:text-slate-900 underline font-medium cursor-pointer bg-transparent border-none p-0 disabled:opacity-40 disabled:no-underline"
                  >
                    {resending
                      ? "Reenviando..."
                      : resendCooldown > 0
                      ? `Reenviar código (${resendCooldown}s)`
                      : "Reenviar código"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setView("email");
                      setMessage({ text: "", type: "" });
                    }}
                    className="hover:text-slate-900 underline font-medium cursor-pointer bg-transparent border-none p-0"
                  >
                    Cambiar correo
                  </button>
                </div>
              </>
            )}

            {view === "reset" && (
              <>
                <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <InputField
                      type="password"
                      required
                      placeholder="Nueva contraseña"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (message.type) setMessage({ text: "", type: "" });
                      }}
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      enterKeyHint="next"
                    />

                    {/* Inline Password Rules */}
                    <div className="flex items-center gap-3 flex-wrap pt-0.5">
                      <span
                        className={`text-[11px] flex items-center gap-1 transition-colors ${
                          hasMinLength ? "text-emerald-600 font-semibold" : "text-slate-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            hasMinLength ? "bg-emerald-600" : "bg-slate-300"
                          }`}
                        />
                        8+ caracteres
                      </span>
                      <span
                        className={`text-[11px] flex items-center gap-1 transition-colors ${
                          hasLetter ? "text-emerald-600 font-semibold" : "text-slate-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            hasLetter ? "bg-emerald-600" : "bg-slate-300"
                          }`}
                        />
                        Una letra
                      </span>
                      <span
                        className={`text-[11px] flex items-center gap-1 transition-colors ${
                          hasNumber ? "text-emerald-600 font-semibold" : "text-slate-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            hasNumber ? "bg-emerald-600" : "bg-slate-300"
                          }`}
                        />
                        Un número
                      </span>
                    </div>
                  </div>

                  <InputField
                    type="password"
                    required
                    placeholder="Repetir nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (message.type) setMessage({ text: "", type: "" });
                    }}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    enterKeyHint="go"
                  />

                  {message.text && (
                    <div
                      className={`p-3 rounded-xl text-xs text-center border ${
                        message.type === "error"
                          ? "bg-red-50 border-red-100 text-red-600"
                          : "bg-emerald-50 border-emerald-100 text-emerald-700"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? "Restableciendo..." : "Restablecer contraseña"}
                  </Button>
                </form>

                <div className="flex justify-center">
                  <Link
                    href="/iniciar-sesion"
                    className="text-xs sm:text-sm text-slate-500 hover:text-slate-900 underline underline-offset-2 font-medium transition-colors"
                  >
                    Volver al inicio de sesión
                  </Link>
                </div>
              </>
            )}

            {view === "success" && (
              <Button
                type="button"
                variant="primary"
                onClick={() => router.push("/iniciar-sesion")}
              >
                Iniciar sesión
              </Button>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-[380px] mx-auto px-4 py-4 sm:py-6 flex flex-col items-center gap-2 text-center">
        <p className="text-[11px] text-slate-400 leading-relaxed m-0">
          Al ingresar, aceptas estar de acuerdo con nuestros{" "}
          <Link
            href="https://luminuslatam.com/legal/terminos"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-600"
          >
            Términos y Condiciones
          </Link>{" "}
          así como con nuestra{" "}
          <Link
            href="https://luminuslatam.com/legal/privacidad"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-600"
          >
            Política de Privacidad
          </Link>
          .
        </p>
        <p className="text-xs text-slate-400 m-0">© 2026 LUMINUS Latam.</p>
      </footer>
    </div>
  );
}
