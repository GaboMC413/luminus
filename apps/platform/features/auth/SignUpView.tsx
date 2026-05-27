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
    phoneCountry: { code: 'XX', dial: '+00', name: 'Seleccionar país', priority: false },
    birthdateString: "",
    avatarUrl: null as string | null,
    interests: [] as string[],
    otherInterests: "",
  });

  // Reset scroll on step change
  useEffect(() => {
    window.scrollTo(0, 0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [step]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSignUp = async () => {
    if (!email || !password || !repeatPassword) {
      setMessage({ text: "Por favor, completa todos los campos.", type: "error" });
      return;
    }
    if (password !== repeatPassword) {
      setMessage({ text: "Las contraseñas no coinciden.", type: "error" });
      return;
    }
    if (password.length < 12) {
      setMessage({ text: "La contrasena debe tener al menos 12 caracteres.", type: "error" });
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setMessage({ text: "La contrasena debe incluir al menos una letra y un numero.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage({ text: data.message ?? "No pudimos crear tu cuenta.", type: "error" });
        return;
      }

      setStep(2);
    } catch {
      setMessage({ text: "No pudimos conectar con el servidor.", type: "error" });
    } finally {
      setLoading(false);
    }

  };

  const isRegistration = step > 1;

  if (step === 1) {
    return (
      <div className="w-full min-h-dvh flex flex-col lg:flex-row font-sans overflow-y-auto lg:overflow-hidden lg:h-dvh bg-slate-50 text-slate-900">

        {/* 1. Left Branding/Marketing Pane (Desktop only - 42% width) */}
        <div className="hidden lg:flex lg:w-[42%] lg:w-[40%] xl:w-[45%] luminus-gradient flex-col justify-between p-12 lg:p-16 shrink-0 relative overflow-hidden border-r border-slate-200/10 animate-in slide-in-from-left duration-500">
          {/* Subtle overlay for enhanced visual depth */}
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full gap-8 justify-between">
            {/* Logo */}
            <Link href="/" className="w-fit cursor-pointer hover:opacity-80 transition-opacity">
              <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[24px]" />
            </Link>

            {/* Marketing Copy & Short Experience Cards */}
            <div className="flex flex-col gap-6 w-full my-auto">
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight tracking-[-0.03em] text-white">
                Regístrate en LUMINUS
              </h1>

              <div className="flex flex-col gap-6 w-full mt-2">
                {/* Bullet 1 */}
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/15 flex items-center justify-center mt-0.5 border border-white/10">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-white font-bold text-[16px]">Conexiones de bienestar</h3>
                    <p className="text-white/90 text-[16px]">Conecta con quienes compartes intereses, búsquedas y formas de vivir el bienestar.</p>
                  </div>
                </div>

                {/* Bullet 2 */}
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/15 flex items-center justify-center mt-0.5 border border-white/10">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-white font-bold text-[16px]">Expertos confiables</h3>
                    <p className="text-white/90 text-[16px]">Descubre profesionales que pueden acompañarte en distintas áreas de tu desarrollo.</p>
                  </div>
                </div>

                {/* Bullet 3 */}
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/15 flex items-center justify-center mt-0.5 border border-white/10">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-white font-bold text-[16px]">Recursos para crecer</h3>
                    <p className="text-white/90 text-[16px]">Accede a contenidos, conversaciones y experiencias diseñadas para acompañar tu proceso.</p>
                  </div>
                </div>

                {/* Bullet 4 */}
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/15 flex items-center justify-center mt-0.5 border border-white/10">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-white font-bold text-[16px]">Guía personalizada</h3>
                    <p className="text-white/90 text-[16px]">Encuentra orientación para avanzar con más claridad, equilibrio y dirección.</p>
                  </div>
                </div>

              </div>
            </div>
            {/* Sidebar Footer */}
            <p className="text-label !text-white/70 uppercase tracking-wider font-sans">
              LUMINUS LATAM © 2026
            </p>
          </div>
        </div>

        {/* 2. Right Form Pane - No shadows, no borders, plain elements on slate-50 */}
        <div className="flex-1 flex flex-col bg-slate-50 lg:min-h-0 lg:overflow-y-auto pt-14 lg:pt-0">

          {/* Mobile Header: Logo (only visible on mobile) */}
          <div className="fixed top-0 left-0 right-0 lg:hidden w-full h-14 luminus-gradient flex items-center justify-center shrink-0 z-50">
            <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
              <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[20px]" />
            </Link>
          </div>

          {/* Central Content Area (Plain, no card, no shadow, no border!) */}
          <div className="flex-1 flex items-center justify-center px-6 py-8 md:py-16">
            <div className="w-full max-w-[344px] md:max-w-[380px] flex flex-col gap-8">

              <div className="flex flex-col gap-1 w-full text-center md:text-left">
                <p className="text-black text-xl font-semibold leading-normal">
                  Crea tu cuenta con acceso completo sin costo por tres meses
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignUp();
                }}
                className="flex flex-col w-full gap-3.5"
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
                  className={`!bg-white border border-zinc-200/80 focus:border-slate-800 ${message.type === 'error' && !email ? '!ring-2 !ring-[#FF3D3D]' : ''}`}
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
                  className={`!bg-white border border-zinc-200/80 focus:border-slate-800 ${message.type === 'error' && (!password || password !== repeatPassword) ? '!ring-2 !ring-[#FF3D3D]' : ''}`}
                />

                {/* Password Requirements Checklist - Stacked Layout */}
                <div className="flex flex-col gap-1.5 px-5 sm:px-6 mb-2">
                  <div className="flex items-center justify-between sm:justify-start gap-1.5 h-6 sm:h-5">
                    <p className={`text-xs sm:text-sm font-normal tracking-tight ${password.length >= 12 ? 'text-green-600' : 'text-slate-500'}`}>
                      Mínimo 12 caracteres
                    </p>
                    {password.length >= 12 && (
                      <span className="text-green-600 text-sm sm:text-base font-bold">✓</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-start gap-1.5 h-6 sm:h-5">
                    <p className={`text-xs sm:text-sm font-normal tracking-tight ${/[A-Za-z]/.test(password) && /\d/.test(password) ? 'text-green-600' : 'text-slate-500'}`}>
                      Incluir al menos una letra y un número
                    </p>
                    {/[A-Za-z]/.test(password) && /\d/.test(password) && (
                      <span className="text-green-600 text-sm sm:text-base font-bold">✓</span>
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
                  className={`!bg-white border border-zinc-200/80 focus:border-slate-800 ${message.type === 'error' && (!repeatPassword || password !== repeatPassword) ? '!ring-2 !ring-[#FF3D3D]' : ''}`}
                />

                {message.text && (
                  <p className={`text-left px-5 sm:px-6 mt-2 text-xs sm:text-sm font-bold ${message.type === 'error' ? 'text-red-500' : 'text-green-600'} tracking-tight`}>
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
                  <p className="text-[11px] text-slate-400 text-center leading-tight">
                    Al registrarte en LUMINUS estás aceptando nuestros{" "}
                    <Link href="#" onClick={(e) => { e.preventDefault(); alert("Términos: Be kind y cultiva el bienestar."); }} className="underline font-medium hover:text-slate-800 cursor-pointer text-slate-500">
                      Términos y Condiciones
                    </Link>{" "}
                    y nuestra{" "}
                    <Link href="#" onClick={(e) => { e.preventDefault(); alert("Privacidad: Tus datos están 100% seguros con nosotros."); }} className="underline font-medium hover:text-slate-800 cursor-pointer text-slate-500">
                      Política de Privacidad
                    </Link>.
                  </p>
                </div>
              </form>

              <div className="flex flex-col items-center mt-2">
                <button
                  onClick={() => router.push("/auth/signin")}
                  className="text-slate-500 hover:text-slate-900 text-body-secondary cursor-pointer bg-transparent border-none outline-none"
                >
                  ¿Ya tienes cuenta? <span className="underline font-semibold text-slate-900">Ingresa</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer (Mobile only) */}
          <div className="lg:hidden w-full shrink-0 h-14 flex flex-col justify-center mt-auto">
            <p className="text-[10px] text-slate-400 text-center uppercase tracking-wide">LUMINUS LATAM © 2026</p>
          </div>

        </div>

      </div>
    );
  }

  // Registration Flow (Step 2+)
  return (
    <div className="w-full min-h-dvh lg:h-dvh bg-slate-50 flex flex-col lg:flex-row font-sans overflow-y-auto lg:overflow-hidden">

      {/* LATERAL SIDEBAR */}
      <div className="fixed top-0 left-0 right-0 lg:relative w-full h-14 lg:h-full lg:w-80 luminus-gradient shrink-0 flex lg:flex-col items-center justify-center lg:justify-start lg:pt-12 z-50 transition-all duration-500">
        <Link href="/" className="flex flex-col items-center w-full px-8 cursor-pointer hover:opacity-80 transition-opacity">
          <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[20px]" />
        </Link>

        {/* SIDEBAR FOOTER */}
        <div className="hidden lg:flex flex-col mt-auto w-full h-[64px] justify-center border-t border-white/10">
          <p className="text-[9px] text-white/90 text-center uppercase tracking-widest font-sans">
            Luminus Latam © 2026
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex flex-col lg:overflow-y-auto pt-14 lg:pt-0"
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
                data={profileData}
              />
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
