"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { PersonalData } from "./registration/PersonalData";
import { InterestSelection } from "./registration/InterestSelection";
import { PlanSelection } from "./registration/PlanSelection";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpView() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Navigation & Form State
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);

  // Profile Data State (Preserved across steps)
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    city: "",
    country: "",
    phone: "",
    phoneCountry: { code: 'AR', dial: '+54', name: 'Argentina', priority: true },
    birthdateString: "",
    avatarUrl: null as string | null,
    interests: [] as string[],
    otherInterests: "",
  });

  // Reset scroll on step change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [step]);

  const handleSignUp = async () => {
    if (!email || !password || !repeatPassword) {
      setMessage({ text: "Por favor, completa todos los campos.", type: "error" });
      return;
    }
    if (password !== repeatPassword) {
      setMessage({ text: "Las contraseñas no coinciden.", type: "error" });
      return;
    }
    if (password.length < 8) {
      setMessage({ text: "La contraseña debe tener al menos 8 caracteres.", type: "error" });
      return;
    }
    if (!/\d/.test(password)) {
      setMessage({ text: "La contraseña debe incluir al menos un número.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    // Simulate mock sign up action
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("luminus_registered_email", email);
      localStorage.setItem("luminus_registered_password", password);
      
      // Move directly to Step 2: PersonalData!
      setStep(2);
    }, 800);
  };

  const isRegistration = step > 1;

  if (step === 1) {
    return (
      <div className="w-full min-h-dvh luminus-gradient flex flex-col font-sans overflow-x-hidden bg-black">
        
        {/* 1. Top Logo */}
        <Link href="/" className="w-full shrink-0 flex justify-center pt-10 md:pt-12 cursor-pointer hover:opacity-80 transition-opacity">
          <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[20px]" />
        </Link>

        {/* 2. Form Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-full max-w-[380px] flex flex-col gap-8 md:gap-6 py-2">
            <div className="flex flex-col gap-4 md:gap-3 w-full text-center">
              <h1 className="text-page-title text-primary !text-white">Regístrate Gratis</h1>
              <div className="flex flex-col gap-2">
                <h2 className="text-[16px] font-bold text-white leading-tight tracking-[-0.03em]">Acceso completo por 3 meses</h2>
                <p className="text-[16px] font-normal leading-relaxed text-white tracking-[-0.03em]">Conoce a la comunidad, descubre expertos y conversa con quien quieras sin ningún costo.</p>
              </div>
            </div>

            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                handleSignUp(); 
              }} 
              className="flex flex-col w-full gap-3"
            >
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
                className={`!bg-white ${message.type === 'error' && (!password || password !== repeatPassword) ? '!ring-2 !ring-[#FF3D3D]' : ''}`}
              />

              {/* Password Requirements Checklist - Stacked Layout */}
              <div className="flex flex-col gap-1.5 px-5 sm:px-6 mb-2">
                <div className="flex items-center justify-between sm:justify-start gap-1.5 h-6 sm:h-5">
                  <p className={`text-[12px] sm:text-[13px] font-normal drop-shadow-sm tracking-[-0.03em] ${password.length >= 8 ? 'text-green-300' : 'text-white/70'}`}>
                    Mínimo 8 caracteres
                  </p>
                  {password.length >= 8 && (
                    <span className="text-green-300 text-[14px] sm:text-[16px] font-bold">✓</span>
                  )}
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-1.5 h-6 sm:h-5">
                  <p className={`text-[12px] sm:text-[13px] font-normal drop-shadow-sm tracking-[-0.03em] ${/\d/.test(password) ? 'text-green-300' : 'text-white/70'}`}>
                    Incluir al menos un número
                  </p>
                  {/\d/.test(password) && (
                    <span className="text-green-300 text-[14px] sm:text-[16px] font-bold">✓</span>
                  )}
                </div>
              </div>

              <InputField
                type="password"
                placeholder="Repetir contraseña"
                value={repeatPassword}
                onChange={(e) => {
                  setRepeatPassword(e.target.value);
                  if (message.type === 'error') setMessage({ text: "", type: "" });
                }} 
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                variant="clean"
                className={`!bg-white ${message.type === 'error' && (!repeatPassword || password !== repeatPassword) ? '!ring-2 !ring-[#FF3D3D]' : ''}`}
              />

              {message.text && (
                <p className={`text-left px-5 sm:px-6 mt-2 text-[13px] font-bold drop-shadow-sm ${message.type === 'error' ? 'text-white' : 'text-green-300'} tracking-[-0.03em]`}>
                  {message.text}
                </p>
              )}

              <div className="flex flex-col gap-4 mt-2">
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loading}
                >
                  {loading ? "Cargando..." : "Regístrate en LUMINUS"}
                </Button>
                <p className="text-[11px] text-white text-center leading-tight">
                  Al registrarte en LUMINUS estás aceptando nuestros{" "}
                  <Link href="#" onClick={(e) => { e.preventDefault(); alert("Términos: Be kind y cultiva el bienestar."); }} className="underline font-medium hover:text-white cursor-pointer">
                    Términos y Condiciones
                  </Link>{" "}
                  y nuestra{" "}
                  <Link href="#" onClick={(e) => { e.preventDefault(); alert("Privacidad: Tus datos están 100% seguros con nosotros."); }} className="underline font-medium hover:text-white cursor-pointer">
                    Política de Privacidad
                  </Link>.
                </p>
              </div>
            </form>
            
            <div className="flex flex-col items-center mt-6">
              <button 
                onClick={() => router.push("/auth/signin")} 
                className="text-white text-[14px] underline opacity-90 hover:opacity-100 cursor-pointer bg-transparent border-none outline-none"
              >
                ¿Ya tienes cuenta? Ingresa
              </button>
            </div>
          </div>
        </div>

        {/* 3. Footer */}
        <div className="w-full shrink-0 h-[64px] flex flex-col justify-center border-t border-white/10 mt-auto">
          <p className="text-[9px] text-white text-center uppercase tracking-wide">LUMINUS LATAM © 2026</p>
        </div>

      </div>
    );
  }

  // Registration Flow (Step 2+)
  return (
    <div className="w-full h-dvh bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">

      {/* LATERAL SIDEBAR */}
      <div className="w-full h-14 md:h-full md:w-80 luminus-gradient shrink-0 flex md:flex-col items-center justify-center md:justify-start md:pt-12 z-10 transition-all duration-500">
        <Link href="/" className="flex flex-col items-center w-full px-8 cursor-pointer hover:opacity-80 transition-opacity">
          <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[20px]" />
        </Link>

        {/* SIDEBAR FOOTER */}
        <div className="hidden md:flex flex-col mt-auto w-full h-[64px] justify-center border-t border-white/10">
          <p className="text-[9px] text-white/90 text-center uppercase tracking-widest font-sans">
            Luminus Latam © 2026
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex flex-col overflow-y-auto"
      >
        <div className="flex-1 flex flex-col items-center pt-8 md:pt-12 pb-10 md:pb-20 px-6 md:px-12">
          {/* Constrain width to 665px */}
          <div className="w-full max-w-[344px] md:max-w-[665px] flex flex-col">
            {step === 2 ? (
              <PersonalData
                onNext={() => setStep(3)}
                data={profileData}
                onUpdate={(newData) => setProfileData(prev => ({ ...prev, ...newData }))}
              />
            ) : step === 3 ? (
              <InterestSelection
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
                data={profileData}
                onUpdate={(newData) => setProfileData(prev => ({ ...prev, ...newData }))}
              />
            ) : (
              <PlanSelection 
                onNext={() => {
                  alert("¡Bienvenido a LUMINUS! Onboarding completado con éxito.");
                  router.push('/');
                }} 
                onBack={() => setStep(3)} 
              />
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
