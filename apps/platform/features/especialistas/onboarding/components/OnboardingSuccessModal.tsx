"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface OnboardingSuccessModalProps {
  buttonText?: string;
  redirectUrl?: string;
}

export function OnboardingSuccessModal({
  buttonText,
  redirectUrl,
}: OnboardingSuccessModalProps = {}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-300 py-6">
      <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center">
        <CheckCircle2 className="w-9 h-9 text-emerald-600" />
      </div>

      <div className="flex flex-col gap-1.5 -mt-2">
        <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 font-jakarta leading-tight tracking-tight">
          Aplicación enviada
        </h1>
        <p className="text-sm font-semibold text-slate-700 font-jakarta">
          Gracias por aplicar como Especialista en LUMINUS.
        </p>
      </div>

      <div className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans max-w-[460px] flex flex-col gap-3">
        <p>
          Recibimos tu información y nuestro Consejo de Expertos revisará tu perfil. Mientras tanto, te invitamos a recorrer la plataforma y descubrir los contenidos, espacios y propuestas que forman parte de la red.
        </p>
        <p className="text-xs text-slate-500 font-medium font-sans">
          Te avisaremos por correo cuando tu perfil sea validado.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 mt-4 w-full sm:w-auto">
        <Button
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.href = redirectUrl || "/inicio";
            } else {
              router.push(redirectUrl || "/inicio");
            }
          }}
          variant="primary"
          size="lg"
          className="w-full sm:!w-auto px-8"
        >
          {buttonText || "Descubrir la plataforma"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
        >
          Ir al inicio
        </Button>
      </div>
    </div>
  );
}

export default OnboardingSuccessModal;
