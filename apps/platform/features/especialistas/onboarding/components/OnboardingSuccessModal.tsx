"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function OnboardingSuccessModal() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-300 py-4">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600">
        <span className="material-symbols-outlined text-[36px] select-none">
          verified_user
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-[26px] md:text-[30px] font-bold text-slate-900 font-jakarta leading-tight">
          Aplicación enviada
        </h1>
        <p className="text-[15px] font-semibold text-slate-700 font-jakarta">
          Gracias por aplicar como especialista en LUMINUS.
        </p>
      </div>

      <div className="text-[14px] text-slate-600 leading-relaxed font-sans max-w-[480px] flex flex-col gap-4 mt-1">
        <p>
          Recibimos correctamente tu información. Nuestro Consejo de Expertos revisará tu perfil, formación, trayectoria y enfoque profesional para evaluar tu incorporación a la red.
        </p>

        <p className="text-[13px] text-slate-500 font-medium">
          Te notificaremos por correo electrónico cuando haya novedades sobre el proceso.
        </p>

        <div className="p-3.5 bg-slate-100/80 rounded-xl border border-slate-200/80 text-[12px] text-slate-500 font-medium leading-normal">
          Mientras tu aplicación esté en revisión, no podrás enviar una nueva ni modificar la información presentada.
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 mt-4 w-full sm:w-auto">
        <Button
          onClick={() => router.push("/especialistas")}
          variant="primary"
          className="w-full sm:!w-auto px-8 !h-12 bg-slate-900 text-white hover:bg-black font-bold font-jakarta text-[13px] tracking-wide !rounded-xl"
        >
          Volver a Especialistas
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
