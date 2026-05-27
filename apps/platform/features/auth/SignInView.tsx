"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      setMessage({ text: "Por favor, completa todos los campos.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    // Simulate mock sign in verification (preserving state locally)
    setTimeout(() => {
      setLoading(false);

      // Let's do a mock validation
      if (password.length < 6) {
        setMessage({ text: "La contraseña es incorrecta", type: "error" });
      } else {
        localStorage.setItem("luminus_logged_in", "true");
        localStorage.setItem("luminus_user_email", email);
        router.push("/community");
      }
    }, 1000);
  };
  return (
    <div className="w-full min-h-dvh flex flex-col md:flex-row font-sans overflow-x-hidden md:overflow-hidden bg-slate-50 text-slate-900">

      {/* 1. Left Branding/Marketing Pane (Desktop only - 42% width) */}
      <div className="hidden md:flex md:w-[42%] lg:w-[40%] xl:w-[45%] luminus-gradient flex-col justify-between p-12 lg:p-16 shrink-0 relative overflow-hidden border-r border-slate-200/10 animate-in slide-in-from-left duration-500">
        {/* Subtle overlay for enhanced visual depth */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Logo */}
          <Link href="/" className="w-fit cursor-pointer hover:opacity-80 transition-opacity">
            <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[24px]" />
          </Link>

          {/* Marketing Copy */}
          <div className="flex flex-col gap-6 max-w-md my-auto">
            <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight tracking-[-0.03em]">
              Ingresa a LUMINUS
            </h1>
            <p className="text-xl text-white/90 leading-relaxed font-normal tracking-[-0.02em]">
              Un espacio para conectar con personas, expertos y recursos que te ayudan a avanzar con más claridad, bienestar y propósito.
            </p>
          </div>

          {/* Sidebar Footer */}
          <p className="text-label !text-white/70 uppercase tracking-wider font-sans">
            LUMINUS LATAM © 2026
          </p>
        </div>
      </div>

      {/* 2. Right Form Pane - No shadows, no borders, plain elements on slate-50 */}
      <div className="flex-1 flex flex-col bg-slate-50 justify-between min-h-dvh md:min-h-0 overflow-y-auto">

        {/* Mobile Header: Logo (only visible on mobile) */}
        <div className="md:hidden w-full h-14 luminus-gradient flex items-center justify-center shrink-0 z-10">
          <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
            <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[20px]" />
          </Link>
        </div>

        {/* Central Content Area (Plain, no card, no shadow, no border!) */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 md:py-16">
          <div className="w-full max-w-[344px] md:max-w-[380px] flex flex-col gap-8">

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
                  onClick={() => alert("Recuperación de contraseña (Funcionalidad del Frontend en desarrollo)")}
                  className="text-body-small text-slate-500 hover:text-slate-900 text-center leading-tight font-sans px-2 underline transition-all font-medium cursor-pointer"
                >
                  Recuperar contraseña
                </button>
              </div>
            </form>

            <div className="flex flex-col items-center mt-2">
              <button
                onClick={() => router.push("/auth/signup")}
                className="text-slate-500 hover:text-slate-900 text-body-small cursor-pointer bg-transparent border-none outline-none"
              >
                ¿Primera vez en LUMINUS? <span className="underline font-semibold text-slate-900">Regístrate gratis</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer (Mobile only) */}
        <div className="md:hidden w-full shrink-0 h-[64px] flex flex-col justify-center border-t border-slate-200 mt-auto bg-white">
          <p className="text-[9px] text-slate-400 text-center uppercase tracking-wide">LUMINUS LATAM © 2026</p>
        </div>

      </div>
    </div>
  );
}
