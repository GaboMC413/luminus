"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlatformFooter } from "@/components/ui/PlatformFooter";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
  );
}

export default function SignInView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "google_config" || params.get("error") === "cognito_config") {
      setMessage({
        text: "Google todavia no esta configurado en este entorno.",
        type: "error",
      });
    } else if (params.get("error") === "google" || params.get("error") === "cognito") {
      setMessage({
        text: "No pudimos iniciar sesion con Google. Intenta nuevamente.",
        type: "error",
      });
    } else if (params.get("error") === "account_disabled") {
      setMessage({
        text: "Tu cuenta no esta activa. Contacta al equipo de LUMINUS para revisarla.",
        type: "error",
      });
    }
  }, []);

  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/cognito/start?provider=google";
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setMessage({ text: "Por favor, completa todos los campos.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage({ text: data.message ?? "No pudimos iniciar sesion.", type: "error" });
        return;
      }

      router.push("/comunidad");
    } catch {
      setMessage({ text: "No pudimos conectar con el servidor.", type: "error" });
    } finally {
      setLoading(false);
    }

  };
  return (
    <div className="auth-fixed-page flex flex-col lg:flex-row font-sans bg-slate-50 text-slate-900">

      {/* 1. Left Branding/Marketing Pane (Desktop only - 42% width) */}
      <div className="hidden lg:flex lg:w-[40%] xl:w-[45%] luminus-gradient flex-col justify-between p-12 lg:p-16 shrink-0 relative overflow-hidden border-r border-slate-200/10 animate-in slide-in-from-left duration-500">
        {/* Subtle overlay for enhanced visual depth */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <Link href="/" className="w-fit cursor-pointer hover:opacity-80 transition-opacity">
            <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[24px]" />
          </Link>

          {/* Marketing Copy */}
          <div className="flex flex-col gap-6 max-w-md mt-20">
            <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight tracking-[-0.03em]">
              Ingresa a LUMINUS
            </h1>
            <p className="text-xl text-white/90 leading-relaxed font-normal tracking-[-0.02em]">
              Un espacio para conectar con personas, especialistas y recursos que te ayudan a avanzar con más claridad, bienestar y propósito.
            </p>
          </div>

          {/* Sidebar Footer */}
          <p className="text-label !text-white/70 uppercase tracking-wider font-sans mt-auto">
            LUMINUS LATAM © 2026
          </p>
        </div>
      </div>

      {/* 2. Right Form Pane - No shadows, no borders, plain elements on slate-50 */}
      <div className="flex-1 flex flex-col bg-slate-50 min-h-0 h-full overflow-hidden pt-14 lg:pt-0">

        {/* Mobile Header: Logo (only visible on mobile) */}
        <div className="fixed top-0 left-0 right-0 lg:hidden w-full h-14 luminus-gradient flex items-center justify-center shrink-0 z-50">
          <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
            <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[20px]" />
          </Link>
        </div>

        {/* Central Content Area (Plain, no card, no shadow, no border!) */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 md:py-16">
          <div className="w-full max-w-[344px] md:max-w-[380px] flex flex-col gap-6">

            {/* Title Section */}
            <div className="flex flex-col gap-1 w-full text-center md:text-left">
              <p className="text-black text-xl font-semibold leading-normal">
                Ingresar a tu cuenta
              </p>
            </div>

            {/* Form Actions */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSignIn();
              }}
              className="flex flex-col w-full"
            >
              <div className="flex flex-col gap-3.5">
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
                  enterKeyHint="next"
                />
                <InputField
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (message.type === 'error') setMessage({ text: "", type: "" });
                  }}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  variant="clean"
                  className={`!bg-white border border-zinc-200/80 focus:border-slate-800 ${message.type === 'error' && !password ? '!ring-2 !ring-[#FF3D3D]' : ''}`}
                  enterKeyHint="go"
                />
              </div>

              {message.text && (
                <p className={`text-left px-5 sm:px-6 mt-4 text-body-small font-bold ${message.type === 'error' ? 'text-red-500' : 'text-green-600'} tracking-[-0.03em]`}>
                  {message.text}
                </p>
              )}

              <div className="flex flex-col items-center gap-4 mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? "Cargando..." : "Ingresar"}
                </Button>

                <button
                  type="button"
                  onClick={() => router.push("/auth/recuperar-contrasena")}
                  className="text-body-small text-slate-500 hover:text-slate-900 text-center leading-tight font-sans px-2 underline transition-all font-medium cursor-pointer"
                >
                  Recuperar contraseña
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-zinc-200/80"></div>
              <span className="flex-shrink mx-4 text-[13px] font-medium text-slate-400 font-sans">o</span>
              <div className="flex-grow border-t border-zinc-200/80"></div>
            </div>

            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-2 hover:bg-zinc-50 border-zinc-200"
            >
              <GoogleIcon />
              <span>Ingresar con Google</span>
            </Button>

            <div className="flex flex-col items-center mt-2">
              <button
                onClick={() => router.push("/auth/registrarse")}
                className="text-slate-500 hover:text-slate-900 text-body-small cursor-pointer bg-transparent border-none outline-none"
              >
                ¿Primera vez en LUMINUS? <span className="underline font-semibold text-slate-900">Regístrate gratis</span>
              </button>
            </div>
          </div>
        </div>

        {/* Auth Page Footer */}
        <PlatformFooter className="bg-transparent border-t-0 py-4 shrink-0 lg:hidden" />


      </div>
    </div>
  );
}
