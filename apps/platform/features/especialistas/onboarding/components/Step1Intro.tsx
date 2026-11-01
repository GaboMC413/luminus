"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CalendarCheck,
  Building2,
  Users,
  BookOpen,
  Mic,
} from "lucide-react";
import { StepHeader } from "./molecules/StepHeader";
import { StepperNav } from "./molecules/StepperNav";

export const BENEFITS = [
  {
    icon: Briefcase,
    title: "Tener un perfil profesional en la plataforma.",
  },
  {
    icon: CalendarCheck,
    title: "Ofrecer sesiones de 15 minutos para primer contacto",
  },
  {
    icon: Building2,
    title: "Publicar tu espacio, consultorio, clínica o centro.",
  },
  {
    icon: Users,
    title: "Crear grupos temáticos sobre tu especialidad.",
  },
  {
    icon: BookOpen,
    title: "Publicar talleres, cursos y otras propuestas formativas.",
  },
  {
    icon: Mic,
    title: "Participar en entrevistas producidas por LUMINUS.",
  },
];

interface Step1IntroProps {
  termsAccepted: boolean;
  setTermsAccepted: (val: boolean) => void;
  errorField: string | null;
  setErrorField: (val: string | null) => void;
  onNext: () => void;
  onCancel?: () => void;
  cancelLabel?: string;
}

export function Step1Intro({
  termsAccepted,
  setTermsAccepted,
  errorField,
  setErrorField,
  onNext,
  onCancel,
  cancelLabel,
}: Step1IntroProps) {
  const router = useRouter();
  const termsCheckboxRef = useRef<HTMLInputElement>(null);

  const handleContinue = () => {
    if (!termsAccepted) {
      setErrorField("terms");
      termsCheckboxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      termsCheckboxRef.current?.focus();
      return;
    }
    setErrorField(null);
    onNext();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <StepHeader
        title="Forma parte de nuestra red de especialistas"
        subtitle="Una plataforma para conectar, compartir y hacer crecer tu propuesta profesional."
      />

      {/* Benefit Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-1">
        {BENEFITS.map((benefit, idx) => {
          const Icon = benefit.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200/90 px-3.5 py-3 flex items-center gap-3 transition-colors hover:border-slate-300 shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                <Icon className="w-4 h-4 text-slate-800" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-800 font-jakarta leading-snug">
                {benefit.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Consejo de Expertos Disclaimer */}
      <p className="text-xs sm:text-sm text-slate-500 font-sans leading-relaxed">
        LUMINUS reúne a especialistas con formación, experiencia y una práctica profesional responsable. Cada aplicación es evaluada por nuestro Consejo de Expertos, que revisa las credenciales, la trayectoria y la coherencia del perfil antes de aprobar su incorporación.
      </p>

      {/* Terms and conditions checkbox */}
      <div className="flex flex-col gap-1 mt-1 px-1">
        <div className="flex items-center gap-3">
          <input
            ref={termsCheckboxRef}
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              if (errorField === "terms") setErrorField(null);
            }}
            className="w-5 h-5 rounded border-slate-300 text-slate-900 accent-slate-900 focus:ring-slate-900 cursor-pointer shrink-0"
          />
          <label
            htmlFor="terms"
            className="text-xs sm:text-sm text-slate-600 font-normal leading-normal cursor-pointer select-none font-sans"
          >
            Acepto las{" "}
            <Link
              href="https://luminuslatam.com/legal/condiciones-especialistas"
              target="_blank"
              className="font-semibold text-slate-900 underline hover:text-black"
            >
              Condiciones de Uso y Políticas para Especialistas
            </Link>{" "}
            de la plataforma.
          </label>
        </div>
        {errorField === "terms" && !termsAccepted && (
          <p className="text-xs font-medium text-rose-600 mt-1 ml-8">
            Debes aceptar las condiciones para continuar
          </p>
        )}
      </div>

      <StepperNav
        onBack={() => {
          if (onCancel) {
            onCancel();
          } else {
            router.push("/especialistas");
          }
        }}
        backLabel={cancelLabel || "Volver"}
        onNext={handleContinue}
        nextLabel="Continuar"
        disabled={!termsAccepted}
      />
    </div>
  );
}

export default Step1Intro;
