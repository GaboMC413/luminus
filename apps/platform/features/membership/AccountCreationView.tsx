"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
export default function AccountCreationView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") === "free" ? "free" : "membership";
  const billing = searchParams.get("billing") === "annual" ? "annual" : "monthly";

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailExists, setEmailExists] = useState(false);

  // Verification step state (Screen 2B)
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

  const codeInputRef = useRef<HTMLInputElement>(null);

  // Password validation rules
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber;

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
    if (isVerifying) {
      setVerificationCode("");
      setVerifyError(null);
      setVerifySuccess(null);
      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 150);
    }
  }, [isVerifying]);

  const handleGoogleSignUp = () => {
    window.location.href = `/api/auth/cognito/start?provider=google&intent=signup&plan=${plan}&billing=${billing}`;
  };

  const handleFacebookSignUp = () => {
    setErrorMessage("El registro con Facebook estará disponible próximamente. Por favor continúa con Google o ingresa tu correo.");
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setEmailExists(false);

    if (!email || !email.includes("@")) {
      setErrorMessage("Por favor ingresa un correo electrónico válido.");
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage("La contraseña debe cumplir con todos los requisitos de seguridad.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start_registration",
          email: email.trim().toLowerCase(),
          password,
          plan,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.code === "EMAIL_EXISTS" || response.status === 409) {
          setEmailExists(true);
          setErrorMessage("Ya existe una cuenta con este correo.");
        } else {
          setErrorMessage(data.message || "No pudimos crear la cuenta. Intenta nuevamente.");
        }
        return;
      }

      // Account created / verified; trigger 6-digit verification code screen
      setIsVerifying(true);
      setResendCooldown(60);
    } catch {
      setErrorMessage("Error de conexión al registrar. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (verificationCode.length < 6) {
      setVerifyError("Ingresa el código completo de 6 dígitos.");
      return;
    }

    setVerifying(true);
    setVerifyError(null);
    setVerifySuccess(null);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: verificationCode.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setVerifyError(data.message || "El código ingresado es incorrecto.");
        return;
      }

      setVerifySuccess("¡Correo verificado con éxito!");

      // Automatic login is now established via session cookie
      setTimeout(() => {
        if (plan === "membership") {
          router.push(`/membresia/pago?billing=${billing}`);
        } else {
          router.push("/perfil/completar");
        }
      }, 400);
    } catch {
      setVerifyError("Error al verificar el código. Intenta de nuevo.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resending || resendCooldown > 0) return;
    setResending(true);
    setVerifyError(null);
    setVerifySuccess(null);

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setVerifyError(data.message || "No pudimos reenviar el código.");
      } else {
        setVerifySuccess("Nuevo código enviado a tu correo.");
        setResendCooldown(60);
      }
    } catch {
      setVerifyError("Error de conexión al reenviar el código.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between font-sans selection:bg-slate-200">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-6 pt-8 pb-3 flex items-center justify-center">
        <Link href="/" className="inline-flex items-center">
          <img src="/logo-luminus-black.svg" alt="LUMINUS" className="h-[24px] w-auto" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-[430px] mx-auto px-4 pt-4 pb-8 flex flex-col items-center">
        {isVerifying ? (
          <>
            {/* Step 2B: Verification Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-[26px] font-bold font-jakarta text-slate-900 tracking-tight">
                Confirma tu correo
              </h1>
            </div>

            {/* Verification Card */}
            <div className="w-full bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-7 flex flex-col gap-5">
              <p className="text-sm text-slate-600 leading-relaxed text-center m-0">
                Ingresa el código de 6 dígitos que enviamos a{" "}
                <span className="font-semibold text-slate-900 block mt-0.5">{email}</span>
              </p>

              <form onSubmit={handleVerifyCode} className="flex flex-col gap-3.5">
                {/* 6-Digit Code Input: standardized font styles & dynamic mono on typing */}
                <input
                  ref={codeInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="Código de 6 dígitos"
                  value={verificationCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setVerificationCode(val);
                    setVerifyError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && verificationCode.length >= 6) {
                      e.preventDefault();
                      handleVerifyCode();
                    }
                  }}
                  className={`w-full h-12 px-4 text-center bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal ${
                    verificationCode
                      ? "font-mono text-xl tracking-[0.35em] font-bold text-slate-900"
                      : "font-sans text-sm tracking-normal"
                  }`}
                />

                {verifyError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 text-center">
                    {verifyError}
                  </div>
                )}

                {verifySuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 text-center">
                    {verifySuccess}
                  </div>
                )}

                {/* Submit button: standardized Button component */}
                <Button
                  type="submit"
                  variant="primary"
                  disabled={verifying || verificationCode.length < 6}
                >
                  {verifying ? "Verificando..." : "Verificar y continuar"}
                </Button>
              </form>

              {/* Action links */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
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
                    setIsVerifying(false);
                    setVerifyError(null);
                    setVerifySuccess(null);
                  }}
                  className="hover:text-slate-900 underline font-medium cursor-pointer bg-transparent border-none p-0"
                >
                  Cambiar correo
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Step 2A: Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-[26px] font-bold font-jakarta text-slate-900 tracking-tight">
                Crea tu cuenta
              </h1>
            </div>

            {/* Step 2A: Card */}
            <div className="w-full bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-7 flex flex-col gap-6">
              {/* Social Sign Up Options */}
              <div className="flex flex-col gap-2.5">
                {/* Google Button */}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGoogleSignUp}
                  className="gap-3"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Continuar con Google
                </Button>

                {/* Facebook Button */}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleFacebookSignUp}
                  className="gap-3"
                >
                  <svg className="w-4 h-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continuar con Facebook
                </Button>
              </div>

              {/* Separator */}
              <div className="flex items-center gap-3 w-full">
                <div className="h-px bg-zinc-200/80 flex-1" />
                <span className="text-xs text-slate-400 font-medium select-none">
                  o
                </span>
                <div className="h-px bg-zinc-200/80 flex-1" />
              </div>

              {/* Form */}
              <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
                {/* Email Field */}
                <InputField
                  label="Correo electrónico"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(null);
                    setEmailExists(false);
                  }}
                  placeholder="tu@correo.com"
                />

                {/* Password Field */}
                <div className="flex flex-col gap-1.5">
                  <InputField
                    label="Contraseña"
                    type="password"
                    required
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Mínimo 8 caracteres"
                  />

                  {/* Password Requirements Checklist */}
                  {password.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px]">
                      <span className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                        {hasMinLength ? (
                          <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 ml-1" />
                        )}
                        8+ caracteres
                      </span>
                      <span className={`flex items-center gap-1.5 ${hasLetter ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                        {hasLetter ? (
                          <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 ml-1" />
                        )}
                        Una letra
                      </span>
                      <span className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                        {hasNumber ? (
                          <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 ml-1" />
                        )}
                        Un número
                      </span>
                    </div>
                  )}
                </div>

                {/* Error Message & Existing Account Prompt */}
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex flex-col gap-1">
                    <span>{errorMessage}</span>
                    {emailExists && (
                      <Link
                        href={`/auth/iniciar-sesion?email=${encodeURIComponent(email)}`}
                        className="font-semibold text-red-700 underline underline-offset-2 hover:text-red-900"
                      >
                        Ya existe una cuenta con este correo. Iniciar sesión.
                      </Link>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="mt-1"
                >
                  {loading ? "Creando cuenta..." : "Crear mi cuenta"}
                </Button>
              </form>

              {/* Legal Notice */}
              <p className="text-[11px] text-slate-400 text-center leading-relaxed m-0">
                Al registrarte aceptas nuestros{" "}
                <Link
                  href="https://luminuslatam.com/legal/terminos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-slate-600"
                >
                  Términos y Condiciones
                </Link>{" "}
                y{" "}
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
            </div>

            {/* Account Login Link below out of the card div */}
            <p className="mt-6 text-center text-xs sm:text-sm text-slate-500 font-medium">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/auth/iniciar-sesion"
                className="text-black font-semibold underline underline-offset-2 hover:text-slate-800"
              >
                Ingresa
              </Link>
            </p>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto px-6 py-8 flex items-center justify-center text-xs text-slate-400">
        <p className="m-0">© 2026 LUMINUS Latam.</p>
      </footer>
    </div>
  );
}
