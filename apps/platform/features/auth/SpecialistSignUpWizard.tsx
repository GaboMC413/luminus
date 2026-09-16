"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { VerificationModal } from "@/features/auth/VerificationModal";
import { PersonalData } from "@/features/auth/registration/PersonalData";
import { Step1Intro } from "@/features/especialistas/onboarding/components/Step1Intro";
import { Step2Profile } from "@/features/especialistas/onboarding/components/Step2Profile";
import { Step3Sessions } from "@/features/especialistas/onboarding/components/Step3Sessions";
import { Step4Spaces } from "@/features/especialistas/onboarding/components/Step4Spaces";
import { Step5Courses } from "@/features/especialistas/onboarding/components/Step5Courses";
import { OnboardingSuccessModal } from "@/features/especialistas/onboarding/components/OnboardingSuccessModal";
import { OnboardingSidebar } from "@/features/especialistas/onboarding/components/OnboardingSidebar";
import { COUNTRIES, Country } from "@/utils/countries";
import { SocialLink, CourseItem } from "@/features/especialistas/onboarding/types";
import { uploadResume } from "@/lib/uploadResume";
import { trackPlatformRegistration } from "@/lib/meta-pixel";
import { trackRegistrationError } from "@/lib/registrationAuditTracker";

const specialtyOptions = [
  "Crecimiento personal",
  "Bienestar emocional",
  "Salud integral",
  "Movimiento físico",
  "Nutrición",
  "Espiritualidad",
  "Vínculos",
  "Terapias complementarias",
];

const STEPS_NAV = [
  { num: 1, label: "Programa de especialistas" },
  { num: 2, label: "Crear cuenta" },
  { num: 3, label: "Datos personales" },
  { num: 4, label: "Perfil profesional" },
  { num: 5, label: "Sesiones introductorias" },
  { num: 6, label: "Espacios de atención" },
  { num: 7, label: "Cursos y talleres" },
];

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

export default function SpecialistSignUpWizard() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Wizard state:
  // 1: Step1Intro (Programa)
  // 2: Credentials (Email/Password/Google)
  // 3: PersonalData
  // 4: Step2Profile (Perfil Profesional)
  // 5: Step3Sessions (Sesiones)
  // 6: Step4Spaces (Espacios)
  // 7: Step5Courses (Cursos)
  // 8: Success (OnboardingSuccessModal)
  const [step, setStep] = useState(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorField, setErrorField] = useState<string | null>(null);

  // Credentials State (Step 2)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authMessage, setAuthMessage] = useState({ text: "", type: "" });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [existingAccountEmail, setExistingAccountEmail] = useState<string | null>(null);

  // Step 1: Terms
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step 3: Personal Data State
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    city: "",
    country: "",
    phone: "",
    phoneCountry: { code: "XX", dial: "+00", name: "Seleccionar país", priority: false },
    birthdateString: "",
    avatarUrl: null as string | null,
    interests: [] as string[],
    otherInterests: "",
  });

  // Step 4: Profile State
  const [specialty, setSpecialty] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [institution, setInstitution] = useState("");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([{ platform: "", url: "" }]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Step 5: Sessions State
  const [sessionsChoice, setSessionsChoice] = useState<"yes" | "no" | null>(null);
  const [sessionsEnabled, setSessionsEnabled] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timeZone, setTimeZone] = useState("");

  // Step 6: Spaces State
  const [clinicChoice, setClinicChoice] = useState<"yes" | "no" | null>(null);
  const [clinicEnabled, setClinicEnabled] = useState(false);
  const [spaceType, setSpaceType] = useState("");
  const [customSpaceType, setCustomSpaceType] = useState("");
  const [spaceCategories, setSpaceCategories] = useState<string[]>([]);
  const [spaceServices, setSpaceServices] = useState<any[]>([]);
  const [clinicName, setClinicName] = useState("");
  const [clinicDescription, setClinicDescription] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [googlePlaceId, setGooglePlaceId] = useState<string | null>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string | null>(null);
  const [clinicPhone, setClinicPhone] = useState("");
  const [clinicWebsite, setClinicWebsite] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<Country>(COUNTRIES[0]);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>("");
  const [suggestedPhotos, setSuggestedPhotos] = useState<string[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [photoAttribution, setPhotoAttribution] = useState<string>("");

  // Step 7: Courses State
  const [coursesChoice, setCoursesChoice] = useState<"yes" | "no" | null>(null);
  const [coursesEnabled, setCoursesEnabled] = useState(false);
  const [courses, setCourses] = useState<CourseItem[]>([]);

  // Check existing session or Google callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isOnboarding = params.get("onboarding") === "1" || params.get("step") === "personal";

    if (params.get("error")) {
      setStep(2);
      setAuthMessage({
        text: "No pudimos completar el registro con Google. Intenta nuevamente.",
        type: "error",
      });
    }

    const checkSession = async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store", credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data && data.email) {
            setEmail(data.email);
            if (data.profile) {
              const p = data.profile;
              setProfileData((prev) => ({
                ...prev,
                firstName: prev.firstName || p.first_name || p.firstName || "",
                lastName: prev.lastName || p.last_name || p.lastName || "",
                avatarUrl: prev.avatarUrl || p.profile_picture_url || p.avatarUrl || null,
                city: prev.city || p.city || "",
                country: prev.country || p.country || "",
                phone: prev.phone || p.phone_number || "",
                gender: prev.gender || p.gender || "",
                birthdateString: prev.birthdateString || p.birthdate || "",
              }));
            }
            if (isOnboarding) {
              setTermsAccepted(true);
              setStep(3); // Go to PersonalData if returned from Google OAuth
              setMaxVisitedStep((prev) => Math.max(prev, 3));
            }
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
    };
    checkSession();
  }, []);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const goToStep = (targetStep: number) => {
    setStep(targetStep);
    setMaxVisitedStep((prev) => Math.max(prev, targetStep));
  };

  // Handle Credentials Signup (Step 2)
  const handleCredentialsSignUp = async () => {
    if (!email || !password || !repeatPassword) {
      setAuthMessage({ text: "Por favor, completa todos los campos.", type: "error" });
      return;
    }
    if (password !== repeatPassword) {
      setAuthMessage({ text: "Las contraseñas no coinciden.", type: "error" });
      return;
    }
    if (password.length < 8) {
      setAuthMessage({ text: "La contraseña debe tener al menos 8 caracteres.", type: "error" });
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      setAuthMessage({ text: "La contraseña debe incluir letras mayúsculas y minúsculas.", type: "error" });
      return;
    }
    if (!/\d/.test(password) || !/[^A-Za-z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/.test(password)) {
      setAuthMessage({ text: "La contraseña debe incluir al menos un número y un símbolo.", type: "error" });
      return;
    }

    setLoading(true);
    setAuthMessage({ text: "", type: "" });

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
        setAuthMessage({ text: "", type: "" });
        return;
      }

      if (!response.ok) {
        setExistingAccountEmail(null);
        trackRegistrationError({
          step: "Registro Especialista - Credenciales",
          action: "POST /api/auth/register",
          userEmail: email,
          statusCode: response.status,
          errorMessage: data.message ?? "Error en creación de cuenta",
        });
        setAuthMessage({ text: data.message ?? "No pudimos crear tu cuenta.", type: "error" });
        return;
      }

      trackPlatformRegistration("specialist");
      goToStep(3); // Advance directly to PersonalData
    } catch (err: any) {
      setAuthMessage({ text: "No pudimos conectar con el servidor.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    const redirectUrl = "/auth/registrarse/especialista?step=personal";
    window.location.href = `/api/auth/cognito/start?provider=google&intent=signup&redirect=${encodeURIComponent(redirectUrl)}`;
  };

  // Handle Personal Data Submission (Step 3) -> Saves to /api/onboarding/profile and advances directly to Step 4 (Step2Profile)
  const handlePersonalDataNext = async () => {
    try {
      await fetch("/api/onboarding/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...profileData,
          isOnboarded: true,
        }),
      });
    } catch (err) {
      console.error("Error saving personal data:", err);
    }
    // Advance to Step 4 (Perfil Profesional), skipping interests & payment
    goToStep(4);
  };

  // Final Application Submission (Step 7)
  const handleSubmit = async () => {
    setLoading(true);
    try {
      let uploadedResume: Awaited<ReturnType<typeof uploadResume>> | null = null;
      if (resumeFile) {
        try {
          uploadedResume = await uploadResume(resumeFile);
        } catch (uploadErr: any) {
          console.error("Resume upload failed:", uploadErr);
          alert(uploadErr.message || "Error al subir el currículum. Por favor intenta de nuevo.");
          setLoading(false);
          return;
        }
      }

      const linkedinObj = socialLinks.find((l) => l.platform?.toLowerCase() === "linkedin");
      const instagramObj = socialLinks.find((l) => l.platform?.toLowerCase() === "instagram");
      const websiteObj = socialLinks.find(
        (l) => l.platform?.toLowerCase() === "website" || l.platform?.toLowerCase() === "web"
      );

      const payload = {
        specialty,
        title,
        bio,
        institution: institution || null,
        selectedAreas: selectedAreas || [],
        clinicData: clinicChoice === "yes" ? {
          spaceType: spaceType === "Otro" ? (customSpaceType.trim() || "Otro") : (spaceType || null),
          customSpaceType: spaceType === "Otro" ? customSpaceType.trim() : null,
          spaceCategories: spaceCategories || [],
          spaceServices: spaceServices || [],
          clinicName: clinicName || null,
          clinicDescription: clinicDescription || null,
          clinicAddress: clinicAddress || null,
          clinicCity: city || null,
          clinicCountry: country || null,
          clinicLat: lat || null,
          clinicLng: lng || null,
          googlePlaceId: googlePlaceId || null,
          googleMapsUrl: googleMapsUrl || null,
          clinicPhone: clinicPhone.trim() ? `${phoneCountry.dial} ${clinicPhone.trim()}` : null,
          clinicWebsite: clinicWebsite || null,
          clinicCoverUrl: selectedPhotoUrl || null,
        } : null,
        sessionsData: sessionsChoice === "yes" ? {
          enabled: sessionsEnabled,
          selectedDays: selectedDays || [],
          startTime: startTime || null,
          endTime: endTime || null,
          timeZone: timeZone || null,
        } : null,
        resumeKey: uploadedResume?.key || null,
        resumeFileName: uploadedResume?.fileName || null,
        resumeContentType: uploadedResume?.contentType || null,
        resumeSize: uploadedResume?.contentLength || null,
        linkedinUrl: linkedinObj?.url || null,
        instagramUrl: instagramObj?.url || null,
        websiteUrl: websiteObj?.url || null,
        courses:
          coursesChoice === "yes"
            ? courses.map((c) => ({
              name: c.name,
              type: c.type || null,
              description: c.description,
              modality: c.modality || null,
              url: c.url,
              coverUrl: c.coverUrl || null,
              institution: c.institution || null,
            }))
            : [],
      };

      const response = await fetch("/api/especialistas/postulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.message || "Error al enviar la aplicación.");
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("luminus_onboarding_completed", "true");
      }
      goToStep(8); // Go to thank you / success screen
    } catch (err) {
      console.error("Failed to submit application:", err);
      alert("Error de conexión al enviar la aplicación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow w-full bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-800 min-h-screen">
      {/* Mobile Header: Logo (only visible on mobile, no border, no line) */}
      <div className="fixed top-0 left-0 right-0 lg:hidden w-full h-14 bg-slate-50 flex items-center justify-center shrink-0 z-50 border-none shadow-none">
        <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
          <img src="/logo-luminus-black.svg" alt="Luminus" className="h-[20px]" />
        </Link>
      </div>

      {/* 1. Left Sidebar */}
      <OnboardingSidebar
        step={step === 8 ? 7 : step}
        maxVisitedStep={maxVisitedStep}
        onStepClick={(targetStep) => goToStep(targetStep)}
        stepsList={STEPS_NAV}
        title="Registro de Especialistas"
        hideStepper={step === 8}
        showLogo={true}
        hasNavbar={false}
      />

      {/* 2. Main Wizard Pane */}
      <div className="flex-grow flex flex-col pt-14 lg:pt-0 min-h-0 overflow-y-auto" ref={scrollContainerRef}>
        <div
          className="flex-grow flex flex-col items-center justify-center py-6 md:py-10 px-4 md:px-8"
        >
          <div className="w-full max-w-[580px] flex flex-col my-auto">
            {/* Paso 1: Información del programa & Términos */}
            {step === 1 && (
              <Step1Intro
                termsAccepted={termsAccepted}
                setTermsAccepted={setTermsAccepted}
                errorField={errorField}
                setErrorField={setErrorField}
                onNext={() => goToStep(2)}
                onCancel={() => router.push("/auth/registrarse")}
                cancelLabel="Volver"
              />
            )}

            {/* Paso 2: Credenciales (Email/Password o Google) */}
            {step === 2 && (
              <div className="w-full max-w-[380px] mx-auto flex flex-col gap-4 animate-in fade-in duration-300 py-2">
                <div className="flex flex-col text-center md:text-left">
                  <h1 className="text-2xl font-bold font-jakarta text-slate-900">
                    Crea tu cuenta
                  </h1>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCredentialsSignUp();
                  }}
                  className="flex flex-col w-full gap-3.5 mt-1"
                >
                  <InputField
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (authMessage.type === "error") setAuthMessage({ text: "", type: "" });
                    }}
                    variant="clean"
                    className="!bg-white border border-zinc-200/80 focus:border-slate-800"
                  />

                  <InputField
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (authMessage.type === "error") setAuthMessage({ text: "", type: "" });
                    }}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    variant="clean"
                    className="!bg-white border border-zinc-200/80 focus:border-slate-800"
                  />

                  {/* Password Checklist - Ultra Compact */}
                  <div className="flex flex-col gap-0.5 px-0.5 my-0.5">
                    <div className="flex items-center gap-1.5 h-4">
                      <span className={`text-[10px] ${password.length >= 8 ? "text-green-600 font-bold" : "text-slate-400"}`}>
                        {password.length >= 8 ? "✓" : "•"}
                      </span>
                      <span className={`text-[11px] tracking-tight ${password.length >= 8 ? "text-green-700 font-medium" : "text-slate-500"}`}>
                        Mínimo 8 caracteres
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 h-4">
                      <span className={`text-[10px] ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? "text-green-600 font-bold" : "text-slate-400"}`}>
                        {/[A-Z]/.test(password) && /[a-z]/.test(password) ? "✓" : "•"}
                      </span>
                      <span className={`text-[11px] tracking-tight ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? "text-green-700 font-medium" : "text-slate-500"}`}>
                        Mayúsculas y minúsculas
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 h-4">
                      <span className={`text-[10px] ${/\d/.test(password) && /[^A-Za-z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/.test(password) ? "text-green-600 font-bold" : "text-slate-400"}`}>
                        {/\d/.test(password) && /[^A-Za-z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/.test(password) ? "✓" : "•"}
                      </span>
                      <span className={`text-[11px] tracking-tight ${/\d/.test(password) && /[^A-Za-z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/.test(password) ? "text-green-700 font-medium" : "text-slate-500"}`}>
                        Al menos un número y un símbolo
                      </span>
                    </div>
                  </div>

                  <InputField
                    type="password"
                    placeholder="Repetir contraseña"
                    value={repeatPassword}
                    onChange={(e) => {
                      setRepeatPassword(e.target.value);
                      if (authMessage.type === "error") setAuthMessage({ text: "", type: "" });
                    }}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    variant="clean"
                    className="!bg-white border border-zinc-200/80 focus:border-slate-800"
                  />

                  <TurnstileWidget
                    onSuccess={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken(null)}
                  />

                  {existingAccountEmail && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left my-2 space-y-2">
                      <div className="text-amber-950 font-bold text-sm">¡Hola de nuevo!</div>
                      <p className="text-xs text-amber-900 leading-relaxed font-medium">
                        Ya tienes una cuenta registrada con <strong>{existingAccountEmail}</strong>.
                      </p>
                      <Link
                        href={`/auth/iniciar-sesion?email=${encodeURIComponent(existingAccountEmail)}&redirect=/especialistas/onboarding`}
                        className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Iniciar sesión
                      </Link>
                    </div>
                  )}

                  {authMessage.text && (
                    <p className={`text-xs font-bold ${authMessage.type === "error" ? "text-red-500" : "text-green-600"}`}>
                      {authMessage.text}
                    </p>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full mt-2"
                  >
                    {loading ? "Creando cuenta..." : "Continuar"}
                  </Button>
                </form>

                {/* Google Sign Up Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignUp}
                  className="w-full flex items-center justify-center gap-2 hover:bg-zinc-50 border-zinc-200"
                >
                  <GoogleIcon />
                  <span>Registrarse con Google</span>
                </Button>

                {/* Existing user note */}
                <p className="text-[13px] md:text-[14px] text-slate-600 text-center leading-relaxed mt-2 px-1">
                  Si ya te registraste antes en LUMINUS, debes sumarte a la red de especialsitas con tu cuenta{" "}
                  <Link
                    href="/especialistas/onboarding"
                    className="underline font-semibold text-slate-900 hover:text-black"
                  >
                    usando este link
                  </Link>.
                </p>

                {/* Back button at the very bottom */}
                <div className="flex items-center justify-start w-full mt-3 pt-2">
                  <Button
                    type="button"
                    variant="back"
                    onClick={() => goToStep(1)}
                  >
                    Volver
                  </Button>
                </div>
              </div>
            )}

            {/* Paso 3: Datos Personales (PersonalData) */}
            {step === 3 && (
              <PersonalData
                data={profileData}
                onUpdate={(newData) => setProfileData((prev) => ({ ...prev, ...newData }))}
                onNext={handlePersonalDataNext}
              />
            )}

            {/* Paso 4: Perfil Profesional (Step2Profile) */}
            {step === 4 && (
              <Step2Profile
                specialty={specialty}
                setSpecialty={setSpecialty}
                specialtyOptions={specialtyOptions}
                selectedAreas={selectedAreas}
                setSelectedAreas={setSelectedAreas}
                title={title}
                setTitle={setTitle}
                institution={institution}
                setInstitution={setInstitution}
                bio={bio}
                setBio={setBio}
                socialLinks={socialLinks}
                setSocialLinks={setSocialLinks}
                resumeFile={resumeFile}
                setResumeFile={setResumeFile}
                errorField={errorField}
                setErrorField={setErrorField}
                onNext={() => goToStep(5)}
                onBack={() => goToStep(3)}
              />
            )}

            {/* Paso 5: Sesiones (Step3Sessions) */}
            {step === 5 && (
              <Step3Sessions
                sessionsChoice={sessionsChoice}
                setSessionsChoice={setSessionsChoice}
                setSessionsEnabled={setSessionsEnabled}
                selectedDays={selectedDays}
                setSelectedDays={setSelectedDays}
                startTime={startTime}
                setStartTime={setStartTime}
                endTime={endTime}
                setEndTime={setEndTime}
                timeZone={timeZone}
                setTimeZone={setTimeZone}
                errorField={errorField}
                setErrorField={setErrorField}
                onNext={() => goToStep(6)}
                onBack={() => goToStep(4)}
              />
            )}

            {/* Paso 6: Espacios / Consultorios (Step4Spaces) */}
            {step === 6 && (
              <Step4Spaces
                clinicChoice={clinicChoice}
                setClinicChoice={setClinicChoice}
                setClinicEnabled={setClinicEnabled}
                spaceType={spaceType}
                setSpaceType={setSpaceType}
                customSpaceType={customSpaceType}
                setCustomSpaceType={setCustomSpaceType}
                spaceCategories={spaceCategories}
                setSpaceCategories={setSpaceCategories}
                spaceServices={spaceServices}
                setSpaceServices={setSpaceServices}
                clinicName={clinicName}
                setClinicName={setClinicName}
                clinicDescription={clinicDescription}
                setClinicDescription={setClinicDescription}
                clinicAddress={clinicAddress}
                setClinicAddress={setClinicAddress}
                city={city}
                setCity={setCity}
                country={country}
                setCountry={setCountry}
                lat={lat}
                setLat={setLat}
                lng={lng}
                setLng={setLng}
                googlePlaceId={googlePlaceId}
                setGooglePlaceId={setGooglePlaceId}
                googleMapsUrl={googleMapsUrl}
                setGoogleMapsUrl={setGoogleMapsUrl}
                clinicPhone={clinicPhone}
                setClinicPhone={setClinicPhone}
                clinicWebsite={clinicWebsite}
                setClinicWebsite={setClinicWebsite}
                phoneCountry={phoneCountry}
                setPhoneCountry={setPhoneCountry}
                selectedPhotoUrl={selectedPhotoUrl}
                setSelectedPhotoUrl={setSelectedPhotoUrl}
                suggestedPhotos={suggestedPhotos}
                setSuggestedPhotos={setSuggestedPhotos}
                activePhotoIndex={activePhotoIndex}
                setActivePhotoIndex={setActivePhotoIndex}
                photoAttribution={photoAttribution}
                setPhotoAttribution={setPhotoAttribution}
                errorField={errorField}
                setErrorField={setErrorField}
                onNext={() => goToStep(7)}
                onBack={() => goToStep(5)}
              />
            )}

            {/* Paso 7: Cursos y Talleres (Step5Courses) */}
            {step === 7 && (
              <Step5Courses
                coursesChoice={coursesChoice}
                setCoursesChoice={setCoursesChoice}
                setCoursesEnabled={setCoursesEnabled}
                courses={courses}
                setCourses={setCourses}
                loading={loading}
                errorField={errorField}
                setErrorField={setErrorField}
                onSubmit={handleSubmit}
                onBack={() => goToStep(6)}
              />
            )}

            {/* Paso 8: Confirmación & Éxito (OnboardingSuccessModal) */}
            {step === 8 && (
              <OnboardingSuccessModal
                buttonText="Descubrir la plataforma"
                redirectUrl="/comunidad"
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal de verificación por código si aplica */}
      <VerificationModal
        isOpen={verifyModalOpen}
        email={verifyEmail}
        onClose={() => setVerifyModalOpen(false)}
        onSuccess={() => {
          setVerifyModalOpen(false);
          goToStep(3); // Go to PersonalData
        }}
      />
    </div>
  );
}
