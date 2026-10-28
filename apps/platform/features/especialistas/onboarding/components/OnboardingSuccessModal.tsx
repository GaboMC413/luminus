"use client";

import React from "react";
import { useRouter } from "next/navigation";
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
    <div className="flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-300 py-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[26px] md:text-[30px] font-bold text-slate-900 font-jakarta leading-tight">
          Aplicación enviada
        </h1>
        <p className="text-[15px] font-semibold text-slate-700 font-jakarta">
          Gracias por aplicar como Especialista en LUMINUS.
        </p>
      </div>

      <div className="text-[14px] text-slate-600 leading-relaxed font-sans max-w-[480px] flex flex-col gap-4 mt-1">
        <p>
          Recibimos tu información y nuestro Consejo de Expertos revisará tu perfil. Mientras tanto, te invitamos a recorrer la plataforma y descubrir los contenidos, espacios y propuestas que forman parte de la red.
        </p>

        <p className="text-[13px] text-slate-500 font-medium">
          Te avisaremos por correo cuando tu perfil sea validado.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 mt-4 w-full sm:w-auto">
        <Button
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.href = redirectUrl || "/comunidad";
            } else {
              router.push(redirectUrl || "/comunidad");
            }
          }}
          variant="primary"
          className="w-full sm:!w-auto px-8 !h-12 bg-slate-900 text-white hover:bg-black font-bold font-jakarta text-[13px] tracking-wide !rounded-xl cursor-pointer"
        >
          {buttonText || "Descubrir la plataforma"}
        </Button>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-[13px] text-slate-500 hover:text-slate-900 font-semibold font-jakarta hover:underline transition bg-transparent border-none cursor-pointer py-1"
        >
          Ir al inicio
        </button>
      </div>
    </div>
  );
}
