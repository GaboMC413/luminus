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
    <div className="w-full min-h-dvh luminus-gradient flex flex-col font-sans overflow-x-hidden bg-black">
      
      {/* 1. Top Logo Section (Centered) */}
      <Link href="/" className="w-full shrink-0 flex justify-center pt-10 md:pt-12 cursor-pointer hover:opacity-80 transition-opacity">
        <img
          src="/logo-luminus-white.svg"
          alt="Luminus"
          className="h-[20px]"
        />
      </Link>

      {/* 2. Central Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 md:py-2">
        <div className="w-full max-w-[380px] flex flex-col gap-8 md:gap-8">

          {/* Title Section */}
          <div className="flex flex-col gap-3 md:gap-2 w-full text-center">
            <h1 className="text-page-title text-primary !text-white leading-tight">
              Ingresa a LUMINUS
            </h1>
          </div>

          {/* Form Actions */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn();
            }}
            className="flex flex-col w-full"
          >
            <div className="flex flex-col gap-3">
               <InputField
                 type="email"
                 placeholder="Correo electrónico"
                 value={email}
                 onChange={(e) => {
                   setEmail(e.target.value);
                   if (message.type === 'error') setMessage({ text: "", type: "" });
                 }}
                 variant="clean"
                 className={`!bg-white ${message.type === 'error' && !email ? '!ring-2 !ring-[#FF3D3D]' : ''}`}
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
                 className={`!bg-white ${message.type === 'error' && !password ? '!ring-2 !ring-[#FF3D3D]' : ''}`}
                 enterKeyHint="go"
               />
            </div>

            {message.text && (
              <p className={`text-left px-5 sm:px-6 mt-4 text-[13px] font-bold drop-shadow-sm ${message.type === 'error' ? 'text-white' : 'text-green-300'} tracking-[-0.03em]`}>
                {message.text}
              </p>
            )}

            <div className="flex flex-col items-center gap-4 mt-4">
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
                className="text-[13px] text-white text-center leading-tight font-sans px-2 underline hover:opacity-100 transition-all font-medium cursor-pointer"
              >
                Recuperar contraseña
              </button>
            </div>
          </form>
            
          <div className="flex flex-col items-center mt-12 md:mt-8">
            <button 
              onClick={() => router.push("/auth/signup")}
              className="text-white text-[14px] underline hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none outline-none"
            >
              ¿Primera vez en LUMINUS? Regístrate gratis
            </button>
          </div>
        </div>
      </div>

      {/* 3. Footer Section - Full Width at bottom (64px) */}
      <div className="w-full shrink-0 h-[64px] flex flex-col justify-center border-t border-white/10 mt-auto">
        <p className="text-[9px] text-white text-center uppercase tracking-wide">LUMINUS LATAM © 2026</p>
      </div>

    </div>
  );
}
