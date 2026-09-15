"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { PersonalData } from "./registration/PersonalData";
import { InterestSelection } from "./registration/InterestSelection";
import { PlanSelection } from "./registration/PlanSelection";
import { VerificationModal } from "./VerificationModal";
import { trackPlatformRegistration } from "@/lib/meta-pixel";
import Link from "next/link";
import { PlatformFooter } from "@/components/ui/PlatformFooter";
import { useRouter } from "next/navigation";
import { COUNTRIES as ALL_COUNTRIES } from "@/utils/countries";
import { getSafeRedirectUrl } from "@/lib/utils/url";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { trackRegistrationError } from "@/lib/registrationAuditTracker";

const formatName = (str?: string) => {
  if (!str) return "";
  return str
    .split(' ')
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

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

export default function SignUpView() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getRedirectTarget = () => {
    if (typeof window === "undefined") return "/comunidad";
    const params = new URLSearchParams(window.location.search);
    return getSafeRedirectUrl(params.get("redirect"));
  };

  // Navigation & Form State
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [existingAccountEmail, setExistingAccountEmail] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

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

    const params = new URLSearchParams(window.location.search);
    if (params.get("onboarding") === "1") {
      setStep(2);
    }
    if (params.get("error") === "google_config" || params.get("error") === "cognito_config") {
      setMessage({
        text: "Google todavía no está configurado en este entorno.",
        type: "error",
      });
    } else if (params.get("error") === "google" || params.get("error") === "cognito") {
      setMessage({
        text: "No pudimos completar el registro con Google. Intenta nuevamente.",
        type: "error",
      });
    }
    // Clear old profile test session keys on signup mount to ensure pristine state
    const profileKeys = [
      "luminus_profile_firstName",
      "luminus_profile_lastName",
      "luminus_profile_city",
      "luminus_profile_country",
      "luminus_profile_phone",
      "luminus_profile_gender",
      "luminus_profile_birthdate",
      "luminus_profile_avatar",
      "luminus_profile_interests",
      "luminus_profile_otherInterests",
      "luminus_profile_cover",
      "luminus_profile_bio",
      "luminus_profile_prompts",
      "luminus_profile_profession",
      "luminus_profile_plan",
      "luminus_onboarding_completed"
    ];
    profileKeys.forEach(key => localStorage.removeItem(key));
  }, []);

  // Autofill Google profile data on onboarding step (step 2)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isOnboarding = params.get("onboarding") === "1";

    if (isOnboarding || step === 2) {
      const fetchUserProfile = async () => {
        try {
          const res = await fetch("/api/profile", { cache: "no-store", credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            if (data && data.profile) {
              const p = data.profile;
              const detectedCountry = p.country || p.phone_number
                ? ALL_COUNTRIES.find(c =>
                    (p.country && c.name.toLowerCase() === p.country.toLowerCase()) ||
                    (p.phone_number && (p.phone_number.startsWith(c.dial) || p.phone_number.startsWith(c.code)))
                  )
                : null;

              setProfileData(prev => ({
                ...prev,
                firstName: prev.firstName || formatName(p.first_name) || "",
                lastName: prev.lastName || formatName(p.last_name) || "",
                avatarUrl: prev.avatarUrl || p.profile_picture_url || null,
                city: prev.city || p.city || "",
                country: prev.country || p.country || "",
                phone: prev.phone || p.phone_number || "",
                phoneCountry: prev.phoneCountry && prev.phoneCountry.code !== 'XX' 
                  ? prev.phoneCountry 
                  : (detectedCountry ? { ...detectedCountry, priority: !!detectedCountry.priority } : prev.phoneCountry),
                gender: prev.gender || p.gender || "",
                birthdateString: prev.birthdateString || p.birthdate || "",
              }));
              if (data.email) {
                setEmail(prev => prev || data.email);
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch profile for autofill:", err);
        }
      };
      fetchUserProfile();
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
      setMessage({ text: "La contrasena debe tener al menos 8 caracteres.", type: "error" });
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      setMessage({ text: "La contrasena debe incluir letras mayúsculas y minúsculas.", type: "error" });
      return;
    }
    if (!/\d/.test(password) || !/[^A-Za-z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/.test(password)) {
      setMessage({ text: "La contrasena debe incluir al menos un número y un símbolo.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, turnstileToken }),
      });
      const data = await response.json();

      if (response.status === 202 && data.code === "REQUIRES_VERIFICATION") {
        setVerifyEmail(email);
        setVerifyModalOpen(true);
        return;
      }

      if (response.status === 409) {
        setExistingAccountEmail(email);
        setMessage({ text: "", type: "" });
        return;
      }

      if (!response.ok) {
        setExistingAccountEmail(null);
        trackRegistrationError({
          step: "Paso 1 - Registro de Credenciales",
          action: "POST /api/auth/register",
          userEmail: email,
          statusCode: response.status,
          errorMessage: data.message ?? "Error en creación de cuenta",
        });
        setMessage({ text: data.message ?? "No pudimos crear tu cuenta.", type: "error" });
        return;
      }

      trackPlatformRegistration("initial");
      setStep(2);
    } catch (err: any) {
      trackRegistrationError({
        step: "Paso 1 - Registro de Credenciales",
        action: "POST /api/auth/register (Network/Exception)",
        userEmail: email,
        statusCode: "Client/Network Error",
        errorMessage: err?.message || "No pudimos conectar con el servidor",
      });
      setMessage({ text: "No pudimos conectar con el servidor.", type: "error" });
    } finally {
      setLoading(false);
    }

  };

  const handleGoogleSignUp = () => {
    const target = getRedirectTarget();
    const googleUrl = target !== "/comunidad"
      ? `/api/auth/cognito/start?provider=google&intent=signup&redirect=${encodeURIComponent(target)}`
      : "/api/auth/cognito/start?provider=google&intent=signup";
    window.location.href = googleUrl;
  };

  const isRegistration = step > 1;

  if (step === 1) {
    return (
      <div className="auth-fixed-page flex flex-col lg:flex-row font-sans bg-slate-50 text-slate-900">

        {/* 1. Left Branding/Marketing Pane (Desktop only - 42% width) */}
        <div className="hidden lg:flex lg:w-[40%] xl:w-[45%] luminus-light-gradient border-r border-slate-200 flex-col justify-between p-12 lg:p-16 shrink-0 relative overflow-hidden animate-in slide-in-from-left duration-500">
          <div className="relative z-10 flex flex-col h-full">
            {/* Logo */}
            <Link href="/" className="w-fit cursor-pointer hover:opacity-80 transition-opacity">
              <img src="/logo-luminus-black.svg" alt="Luminus" className="h-[24px]" />
            </Link>

            {/* Marketing Copy & Short Experience Cards */}
            <div className="flex flex-col gap-6 w-full mt-20">
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight tracking-[-0.03em] text-slate-900 font-jakarta">
                Regístrate en LUMINUS
              </h1>

              <div className="flex flex-col gap-6 w-full mt-2">
                {/* Bullet 1 */}
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-4.5 h-4.5 rounded-full bg-black flex items-center justify-center mt-0.5">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-slate-900 font-bold text-[16px] font-jakarta">Conexiones de bienestar</h3>
                    <p className="text-slate-600 text-[15px] leading-relaxed">Conecta con personas que comparten tus búsquedas e intereses.</p>
                  </div>
                </div>

                {/* Bullet 2 */}
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-4.5 h-4.5 rounded-full bg-black flex items-center justify-center mt-0.5">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-slate-900 font-bold text-[16px] font-jakarta">Especialistas confiables</h3>
                    <p className="text-slate-600 text-[15px] leading-relaxed">Descubre profesionales capacitados para acompañar tu proceso.</p>
                  </div>
                </div>

                {/* Bullet 3 */}
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-4.5 h-4.5 rounded-full bg-black flex items-center justify-center mt-0.5">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-slate-900 font-bold text-[16px] font-jakarta">Recursos para crecer</h3>
                    <p className="text-slate-600 text-[15px] leading-relaxed">Accede a contenidos, conversaciones y experiencias de valor.</p>
                  </div>
                </div>

                {/* Bullet 4 */}
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-4.5 h-4.5 rounded-full bg-black flex items-center justify-center mt-0.5">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-slate-900 font-bold text-[16px] font-jakarta">Guía personalizada</h3>
                    <p className="text-slate-600 text-[15px] leading-relaxed">Encuentra orientación para avanzar con mayor claridad y dirección.</p>
                  </div>
                </div>

              </div>
            </div>
            {/* Sidebar Footer */}
            <p className="text-label !text-slate-400 uppercase tracking-wider font-sans mt-auto">
              LUMINUS LATAM © 2026
            </p>
          </div>
        </div>

        {/* 2. Right Form Pane - No shadows, no borders, plain elements on slate-50 */}
        <div className="flex-1 flex flex-col bg-slate-50 min-h-0 h-full overflow-hidden pt-14 lg:pt-0">

          {/* Mobile Header: Logo (only visible on mobile) */}
          <div className="fixed top-0 left-0 right-0 lg:hidden w-full h-14 luminus-light-gradient-slate border-b-0 flex items-center justify-center shrink-0 z-50">
            <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
              <img src="/logo-luminus-black.svg" alt="Luminus" className="h-[20px]" />
            </Link>
          </div>

          {/* Central Content Area (Plain, no card, no shadow, no border!) */}
          <div className="flex-1 flex items-center justify-center px-6 py-8 md:py-16">
            <div className="w-full max-w-[344px] md:max-w-[380px] flex flex-col gap-6">

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
                <div className="flex flex-col gap-1.5 px-0 mb-2">
                  <div className="flex items-center justify-between sm:justify-start gap-1.5 h-6 sm:h-5">
                    <p className={`text-xs sm:text-sm font-normal tracking-tight ${password.length >= 8 ? 'text-green-600' : 'text-slate-500'}`}>
                      Mínimo 8 caracteres
                    </p>
                    {password.length >= 8 && (
                      <span className="text-green-600 text-sm sm:text-base font-bold">✓</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-start gap-1.5 h-6 sm:h-5">
                    <p className={`text-xs sm:text-sm font-normal tracking-tight ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-600' : 'text-slate-500'}`}>
                      Mayúsculas y minúsculas
                    </p>
                    {/[A-Z]/.test(password) && /[a-z]/.test(password) && (
                      <span className="text-green-600 text-sm sm:text-base font-bold">✓</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-start gap-1.5 h-6 sm:h-5">
                    <p className={`text-xs sm:text-sm font-normal tracking-tight ${/\d/.test(password) && /[^A-Za-z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/.test(password) ? 'text-green-600' : 'text-slate-500'}`}>
                      Al menos un número y un símbolo
                    </p>
                    {/\d/.test(password) && /[^A-Za-z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/.test(password) && (
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

                <TurnstileWidget
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                />

                {existingAccountEmail && (
                  <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-left my-2 space-y-2.5">
                    <div className="text-amber-950 font-bold text-sm">
                      ¡Hola de nuevo!
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed font-medium">
                      Ya tienes una cuenta registrada con <strong className="font-semibold">{existingAccountEmail}</strong>.
                    </p>
                    <Link
                      href={`/login?email=${encodeURIComponent(existingAccountEmail)}${getRedirectTarget() !== "/comunidad" ? `&redirect=${encodeURIComponent(getRedirectTarget())}` : ""}`}
                      className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Iniciar sesión
                    </Link>
                  </div>
                )}

                {message.text && (
                  <p className={`text-left px-0 mt-2 text-xs sm:text-sm font-bold ${message.type === 'error' ? 'text-red-500' : 'text-green-600'} tracking-tight`}>
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
                </div>
              </form>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-zinc-200/80"></div>
                <span className="flex-shrink mx-4 text-[13px] font-medium text-slate-400 font-sans">o</span>
                <div className="flex-grow border-t border-zinc-200/80"></div>
              </div>

              {/* Google Sign Up Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignUp}
                className="flex items-center justify-center gap-2 hover:bg-zinc-50 border-zinc-200"
              >
                <GoogleIcon />
                <span>Registrarse con Google</span>
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

              <div className="flex flex-col items-center mt-2">
                <button
                  onClick={() => {
                    const target = getRedirectTarget();
                    const signInUrl = target !== "/comunidad"
                      ? `/auth/iniciar-sesion?redirect=${encodeURIComponent(target)}`
                      : "/auth/iniciar-sesion";
                    router.push(signInUrl);
                  }}
                  className="text-slate-500 hover:text-slate-900 text-body-secondary cursor-pointer bg-transparent border-none outline-none"
                >
                  ¿Ya tienes cuenta? <span className="underline font-semibold text-slate-900">Ingresa</span>
                </button>
              </div>
            </div>
          </div>

          {/* Auth Page Footer */}
          <PlatformFooter className="bg-transparent border-t-0 py-4 shrink-0 lg:hidden" />

          {/* Verification Modal */}
          <VerificationModal
            isOpen={verifyModalOpen}
            email={verifyEmail}
            onClose={() => setVerifyModalOpen(false)}
            onSuccess={() => {
              setVerifyModalOpen(false);
              setStep(2);
            }}
          />
        </div>

      </div>
    );
  }

  // Registration Flow (Step 2+)
  return (
    <div className="auth-fixed-page bg-slate-50 flex flex-col lg:flex-row font-sans">

      {/* LATERAL SIDEBAR */}
      <div className="fixed top-0 left-0 right-0 lg:relative w-full h-14 lg:h-full lg:w-80 luminus-light-gradient-slate lg:luminus-light-gradient border-b-0 lg:border-r border-slate-200 shrink-0 flex lg:flex-col items-center justify-center lg:justify-start lg:pt-12 z-50 transition-all duration-500 overflow-hidden">
        <Link href="/" className="relative z-10 flex flex-col items-center w-full px-8 cursor-pointer hover:opacity-80 transition-opacity">
          <img src="/logo-luminus-black.svg" alt="Luminus" className="h-[20px]" />
        </Link>

        {/* SIDEBAR FOOTER */}
        <div className="relative z-10 hidden lg:flex flex-col mt-auto w-full h-[64px] justify-center border-t border-slate-100">
          <p className="text-[9px] text-slate-400 text-center uppercase tracking-widest font-sans">
            Luminus Latam © 2026
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex flex-col min-h-0 h-full overflow-y-auto pt-14 lg:pt-0"
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
                  router.push(getRedirectTarget());
                }}
                onBack={() => setStep(3)}
                data={profileData}
              />
            )}
          </div>
        </div>

        {/* Onboarding Page Footer */}
        <PlatformFooter className="bg-transparent border-t-0 py-4 shrink-0 lg:hidden" />
      </div>

    </div>
  );
}
