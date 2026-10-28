"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export const BENEFITS = [
  {
    icon: "business_center",
    title: "Tener un perfil profesional en la plataforma.",
  },
  {
    icon: "calendar_check",
    title: "Ofrecer sesiones de 15 minutos para primer contacto",
  },
  {
    icon: "chair",
    title: "Publicar tu espacio, consultorio, clínica o centro.",
  },
  {
    icon: "groups",
    title: "Crear grupos temáticos sobre tu especialidad.",
  },
  {
    icon: "books_movies_and_music",
    title: "Publicar talleres, cursos y otras propuestas formativas.",
  },
  {
    icon: "mic",
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
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="flex flex-col gap-2.5">
        <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 font-jakarta leading-tight">
          Forma parte de nuestra red de especialistas
        </h1>
        <p className="text-body-secondary leading-relaxed">
          Una plataforma para conectar, compartir y hacer crecer tu propuesta profesional.
        </p>
      </div>

      {/* Benefit Cards - Punto medio: Cards limpias sin cajas extra de íconos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-1">
        {BENEFITS.map((benefit, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200/80 px-3.5 py-2.5 sm:py-3 flex items-center gap-3 transition-colors hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <span
              className="material-symbols-rounded material-icon-filled text-slate-800 text-[20px] shrink-0"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}
            >
              {benefit.icon}
            </span>
            <span className="text-[13px] sm:text-[13.5px] font-medium text-slate-800 font-jakarta leading-snug">
              {benefit.title}
            </span>
          </div>
        ))}
      </div>

      {/* Consejo de Expertos Disclaimer */}
      <p className="text-[13px] md:text-[13.5px] text-slate-500 font-sans leading-relaxed">
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
            className="w-5 h-5 rounded border-zinc-300 accent-emerald-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
          />
          <label
            htmlFor="terms"
            className="text-[13px] text-slate-600 font-normal leading-normal cursor-pointer select-none"
          >
            Acepto las{" "}
            <Link
              href="https://luminuslatam.com/legal/condiciones-especialistas"
              target="_blank"
              className="font-semibold text-black underline hover:text-zinc-800"
            >
              Condiciones de Uso y Políticas para Especialistas
            </Link>{" "}
            de la plataforma.
          </label>
        </div>
        {errorField === "terms" && !termsAccepted && (
          <p className="text-[#FF3D3D] text-[12px] font-bold ml-8">
            Debes aceptar las condiciones para continuar
          </p>
        )}
      </div>

      <div className="flex justify-between items-center gap-3 mt-6 pt-2">
        <Button
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else {
              router.push("/especialistas");
            }
          }}
          variant="back"
        >
          {cancelLabel || "Volver"}
        </Button>
        <Button
          onClick={handleContinue}
          variant="primary"
          disabled={!termsAccepted}
          className={`!w-auto px-6 gap-2 ${
            !termsAccepted
              ? "!bg-slate-200 !text-slate-400 !cursor-not-allowed hover:!bg-slate-200 hover:!text-slate-400 shadow-none border-transparent"
              : ""
          }`}
        >
          Continuar
          <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
        </Button>
      </div>
    </div>
  );
}
