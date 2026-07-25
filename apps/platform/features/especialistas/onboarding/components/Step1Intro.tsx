"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export const BENEFITS = [
  {
    icon: "business_center",
    title: "Presenta tu perfil profesional",
    description: "Haz visible tu experiencia, especialidad y enfoque de trabajo.",
  },
  {
    icon: "calendar_check",
    title: "Agenda sesiones introductorias",
    description: "Coordina encuentros breves para un primer acercamiento.",
  },
  {
    icon: "groups",
    title: "Crea grupos temáticos",
    description: "Abre espacios para compartir experiencias y recursos.",
  },
  {
    icon: "chair",
    title: "Suma tu espacio a la red",
    description: "Publica tu consultorio, clínica o espacio de bienestar.",
  },
  {
    icon: "books_movies_and_music",
    title: "Ofrece cursos y capacitaciones",
    description: "Acerca tus propuestas formativas a la comunidad.",
  },
  {
    icon: "mic",
    title: "Participa en entrevistas",
    description: "Comparte tu mirada profesional y amplía tu visibilidad.",
  },
];

interface Step1IntroProps {
  termsAccepted: boolean;
  setTermsAccepted: (val: boolean) => void;
  errorField: string | null;
  setErrorField: (val: string | null) => void;
  onNext: () => void;
}

export function Step1Intro({
  termsAccepted,
  setTermsAccepted,
  errorField,
  setErrorField,
  onNext,
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
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="flex flex-col gap-3 md:gap-3.5">
        <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 font-jakarta leading-tight">
          Forma parte de nuestra red de especialistas
        </h1>
        <p className="text-body-secondary leading-relaxed">
          Una plataforma para conectar, compartir y hacer crecer tu propuesta profesional.
        </p>
      </div>

      {/* Benefit Cards (2x3 Grid Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
        {BENEFITS.map((benefit, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-4 md:p-5 border border-zinc-200/60 flex flex-col gap-2"
          >
            <span className="material-symbols-rounded text-slate-700 text-[24px] shrink-0">
              {benefit.icon}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-[14px] md:text-[15px] font-bold text-slate-900 font-jakarta leading-snug">
                {benefit.title}
              </h3>
              <p className="text-[13px] text-slate-500 font-sans leading-relaxed">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Consejo de Expertos Disclaimer */}
      <p className="text-[13px] md:text-[14px] text-slate-500 font-sans leading-relaxed mt-1">
        LUMINUS reúne a especialistas con formación, experiencia y una práctica profesional responsable. Cada aplicación es evaluada por nuestro Consejo de Expertos, que revisa las credenciales, la trayectoria y la coherencia del perfil antes de aprobar su incorporación.
      </p>

      {/* Terms and conditions checkbox */}
      <div className="flex flex-col gap-1 mt-2 px-1">
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
            className="w-5 h-5 rounded border-zinc-300 accent-emerald-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
          />
          <label
            htmlFor="terms"
            className="text-[13px] text-slate-600 font-normal leading-normal cursor-pointer select-none"
          >
            Acepto las{" "}
            <Link
              href="https://dev.luminuslatam.com/legal/condiciones-especialistas"
              target="_blank"
              className="font-semibold text-black underline hover:text-zinc-800"
            >
              Condiciones de Uso y Políticas para Especialistas
            </Link>{" "}
            de la plataforma.
          </label>
        </div>
        {errorField === "terms" && (
          <p className="text-[#FF3D3D] text-[12px] font-bold ml-8">
            Debes aceptar las condiciones para continuar
          </p>
        )}
      </div>

      <div className="flex justify-between items-center gap-3 mt-6 pt-2">
        <Button onClick={() => router.push("/especialistas")} variant="back">
          Volver a Especialistas
        </Button>
        <Button onClick={handleContinue} variant="primary" className="!w-auto px-6 gap-2">
          Continuar
          <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
        </Button>
      </div>
    </div>
  );
}
