"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { Modal } from "@/components/ui/Modal";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { getSafeRedirectUrl } from "@/lib/utils/url";
import { loginWithFacebook } from "@/lib/auth/facebookSdk";

export default function SignInView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Inline verification step state (matches Step 2B of /unirme)
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

  const codeInputRef = useRef<HTMLInputElement>(null);

  const getRedirectTarget = () => {
    if (typeof window === "undefined") return "/comunidad";
    const params = new URLSearchParams(window.location.search);
    return getSafeRedirectUrl(params.get("redirect"));
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam.trim());
    }

    if (params.get("error") === "google_config" || params.get("error") === "cognito_config") {
      setErrorMessage("Google todavía no está configurado en este entorno.");
    } else if (params.get("error") === "google" || params.get("error") === "cognito") {
      setErrorMessage("No pudimos iniciar sesión con Google. Intenta nuevamente.");
    } else if (params.get("error") === "account_disabled") {
      setErrorMessage("Tu cuenta no está activa. Contacta al equipo de LUMINUS para revisarla.");
    } else if (params.get("reactivate_oauth") === "1") {
      setReactivateModalOpen(true);
    }
  }, []);

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

  const handleGoogleSignIn = () => {
    const target = getRedirectTarget();
    const googleUrl =
      target !== "/comunidad"
        ? `/api/auth/cognito/start?provider=google&intent=signin&redirect=${encodeURIComponent(target)}`
        : "/api/auth/cognito/start?provider=google&intent=signin";
    window.location.href = googleUrl;
  };

  const handleFacebookSignIn = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const { accessToken } = await loginWithFacebook();
      const res = await fetch("/api/auth/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Error al iniciar sesión con Facebook.");
      }
      if (!data.isOnboarded) {
        router.push("/unirme/perfil");
        return;
      }
      router.push(getRedirectTarget());
    } catch (err: any) {
      if (err.message && !err.message.includes("cancelado")) {
        setErrorMessage(err.message || "No se pudo iniciar sesión con Facebook.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (reactivate = false) => {
    if (!email || !password) {
      setErrorMessage("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, reactivate, turnstileToken }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.code === "REQUIRES_REACTIVATION") {
          setReactivateModalOpen(true);
          return;
        }
        if (data.code === "REQUIRES_VERIFICATION") {
          setIsVerifying(true);
          setResendCooldown(60);
          return;
        }
        setErrorMessage(data.message ?? "No pudimos iniciar sesión.");
        return;
      }

      if (data.user?.onboardingStatus === "PENDING") {
        router.push("/unirme/perfil");
        return;
      }

      router.push(getRedirectTarget());
    } catch {
      setErrorMessage("No pudimos conectar con el servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    setReactivateModalOpen(false);

    const params = new URLSearchParams(window.location.search);
    if (params.get("reactivate_oauth") === "1") {
      setLoading(true);
      try {
        const response = await fetch("/api/auth/reactivate-oauth", { method: "POST" });
        if (response.ok) {
          router.push(getRedirectTarget());
        } else {
          setErrorMessage("No pudimos reactivar tu cuenta de Google. Intenta nuevamente.");
        }
      } catch {
        setErrorMessage("No pudimos conectar con el servidor.");
      } finally {
        setLoading(false);
      }
      return;
    }

    handleSignIn(true);
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

      setTimeout(() => {
        if (data.user?.onboardingStatus === "PENDING" || data.onboardingStatus === "PENDING") {
          router.push("/unirme/perfil");
          return;
        }

        router.push(getRedirectTarget());
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

  const target = getRedirectTarget();
  const signUpUrl =
    target !== "/comunidad"
      ? `/unirme?redirect=${encodeURIComponent(target)}`
      : "/unirme";

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col justify-between font-sans selection:bg-slate-200">
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-10 pb-8 sm:py-12">
        <main className="w-full max-w-[380px] mx-auto flex flex-col items-center my-auto animate-fade-in-up">
          {/* Header unit with persistent brand anchor */}
          <header className="flex flex-col items-center text-center gap-2 mb-6 sm:mb-8">
            <Link href="/" className="inline-flex items-center mb-1">
              <img src="/iso-logo-black.svg" alt="LUMINUS" className="h-[36px] w-[36px]" />
            </Link>
            <h1 className="text-2xl sm:text-[26px] font-bold font-jakarta text-slate-900 tracking-tight m-0">
              {isVerifying ? "Confirma tu correo" : "Ingresa a tu cuenta"}
            </h1>
            {isVerifying && (
              <p className="text-sm text-slate-600 leading-relaxed max-w-[320px] m-0">
                Ingresa el código de 6 dígitos que enviamos a{" "}
                <span className="font-semibold text-slate-900 block mt-0.5">{email}</span>
              </p>
            )}
          </header>

          {isVerifying ? (
            <div className="w-full flex flex-col gap-4">
              <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
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

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={verifying || verificationCode.length < 6}
                  >
                    {verifying ? "Verificando..." : "Verificar y continuar"}
                  </Button>
                </form>

                {/* Action links */}
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
          ) : (
            <div className="w-full flex flex-col">
              {/* Social Sign In Options */}
              <div className="flex flex-col gap-2">
                {/* Google Button */}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGoogleSignIn}
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
                  onClick={handleFacebookSignIn}
                  className="gap-3"
                >
                  <svg className="w-4 h-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continuar con Facebook
                </Button>
              </div>

              {/* Separator */}
              <div className="flex items-center gap-3 w-full my-3">
                <div className="h-px bg-zinc-200/80 flex-1" />
                <span className="text-xs text-slate-400 font-medium select-none">
                  o
                </span>
                <div className="h-px bg-zinc-200/80 flex-1" />
              </div>

                {/* Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSignIn();
                  }}
                  className="flex flex-col gap-3"
                >
                  {/* Email Field */}
                  <InputField
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Correo electrónico"
                    enterKeyHint="next"
                  />

                  {/* Password Field with Forgot Password Link below */}
                  <div className="flex flex-col gap-2">
                    <InputField
                      type="password"
                      required
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="Contraseña"
                      enterKeyHint="go"
                    />
                    <div className="flex items-center">
                      <Link
                        href="/recuperar-contrasena"
                        className="text-xs font-medium text-slate-500 hover:text-slate-900 underline underline-offset-2 transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                      {errorMessage}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? "Ingresando..." : "Ingresar"}
                  </Button>

                  <TurnstileWidget
                    onSuccess={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken(null)}
                  />
                </form>

                {/* Sign Up Link directly below button */}
                <p className="text-center text-xs sm:text-sm text-slate-500 font-medium mt-4 mb-0">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    href={signUpUrl}
                    className="text-black font-semibold underline underline-offset-2 hover:text-slate-800"
                  >
                    Únete
                  </Link>
                </p>
              </div>
          )}
        </main>
      </div>

      {/* Reactivate Modal */}
      <Modal
        isOpen={reactivateModalOpen}
        onClose={() => setReactivateModalOpen(false)}
        title="Reactivar cuenta"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setReactivateModalOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleReactivate}
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Reactivando..." : "Reactivar mi cuenta"}
            </Button>
          </>
        }
      >
        <p className="text-slate-600 text-[15px] font-sans">
          Esta cuenta fue eliminada previamente. ¿Deseas reactivarla y recuperar tu perfil?
        </p>
      </Modal>

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
