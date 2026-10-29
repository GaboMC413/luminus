"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { loginWithFacebook } from "@/lib/auth/facebookSdk";
import { Check } from "lucide-react";

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

  // Password validation rules
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber;

  const handleGoogleSignUp = () => {
    window.location.href = `/api/auth/cognito/start?provider=google&intent=signup&plan=${plan}&billing=${billing}`;
  };

  const handleFacebookSignUp = async () => {
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
        throw new Error(data.message || "Error al registrarse con Facebook.");
      }

      if (plan === "membership" && data.user?.tier !== "MECENAS") {
        router.push(`/unirme/pago?plan=${plan}&billing=${billing}`);
        return;
      }

      if (!data.isOnboarded) {
        router.push("/unirme/perfil");
        return;
      }

      router.push("/comunidad");
    } catch (err: any) {
      if (err.message && !err.message.includes("cancelado")) {
        setErrorMessage(err.message || "No se pudo conectar con Facebook.");
      }
    } finally {
      setLoading(false);
    }
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

      // Account created and authenticated via session cookie! Proceed without interruption.
      if (typeof window !== "undefined") {
        localStorage.setItem("luminus_user_email", email.trim().toLowerCase());
      }

      if (plan === "membership") {
        router.push(`/unirme/pago?billing=${billing}`);
      } else {
        router.push("/unirme/perfil");
      }
    } catch {
      setErrorMessage("Error de conexión al registrar. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

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
              Crea tu cuenta
            </h1>
          </header>

          <div className="w-full flex flex-col">
            {/* Social Sign Up Options */}
              <div className="flex flex-col gap-2">
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
              <div className="flex items-center gap-3 w-full my-3">
                <div className="h-px bg-zinc-200/80 flex-1" />
                <span className="text-xs text-slate-400 font-medium select-none">
                  o
                </span>
                <div className="h-px bg-zinc-200/80 flex-1" />
              </div>

                {/* Form */}
                <form onSubmit={handleCreateAccount} className="flex flex-col gap-3">
                  {/* Email Field */}
                  <InputField
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                      setEmailExists(false);
                    }}
                    placeholder="Correo electrónico"
                  />

                  {/* Password Field */}
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
                      placeholder="Contraseña (mínimo 8 caracteres)"
                    />

                    {/* Password Requirements Checklist */}
                    {password.length > 0 && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                        <span className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                          {hasMinLength ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={2.5} />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 ml-1" />
                          )}
                          8+ caracteres
                        </span>
                        <span className={`flex items-center gap-1.5 ${hasLetter ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                          {hasLetter ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={2.5} />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 ml-1" />
                          )}
                          Una letra
                        </span>
                        <span className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                          {hasNumber ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={2.5} />
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
                          href={`/iniciar-sesion?email=${encodeURIComponent(email)}`}
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
                  >
                    {loading ? "Creando cuenta..." : "Crear mi cuenta"}
                  </Button>
                </form>

                {/* Account Login Link directly below the button */}
                <p className="text-center text-xs sm:text-sm text-slate-500 font-medium mt-4 mb-0">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    href="/iniciar-sesion"
                    className="text-black font-semibold underline underline-offset-2 hover:text-slate-800"
                  >
                    Ingresa
                  </Link>
                </p>
              </div>
        </main>
      </div>

      {/* Footer with Patreon-style legal copy + Copyright */}
      <footer className="w-full max-w-[380px] mx-auto px-4 py-4 sm:py-6 flex flex-col items-center gap-2 text-center">
        <p className="text-[11px] text-slate-400 leading-relaxed m-0">
          Al unirte, estás creando una cuenta en LUMINUS y aceptando estar de acuerdo con nuestros{" "}
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
