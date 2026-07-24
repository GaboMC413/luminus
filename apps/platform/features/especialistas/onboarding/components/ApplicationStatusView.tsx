"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface ApplicationStatusViewProps {
  createdAt?: string | null;
  email?: string | null;
}

export function ApplicationStatusView({ createdAt, email }: ApplicationStatusViewProps) {
  const router = useRouter();

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-2">
        <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 font-jakarta leading-tight">
          Estamos revisando tu perfil profesional
        </h1>
        <p className="text-[14px] text-slate-600 font-sans leading-relaxed">
          Tu aplicación como especialista fue enviada correctamente y actualmente está siendo evaluada por nuestro Consejo de Expertos.
        </p>
      </div>

      {/* Details Box */}
      <div className="flex flex-col gap-3 p-5 bg-white border border-slate-200/90 rounded-2xl font-sans text-[13px]">
        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Estado actual:</span>
          <div className="inline-flex items-center gap-1.5 text-emerald-700 text-[13px] font-bold font-jakarta">
            <span className="material-symbols-rounded text-[18px]">schedule</span>
            <span>En revisión</span>
          </div>
        </div>
        {formattedDate && (
          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Fecha de envío:</span>
            <span className="text-slate-900 font-bold font-jakarta">{formattedDate}</span>
          </div>
        )}

        {email && (
          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Correo de notificación:</span>
            <span className="text-slate-900 font-semibold truncate max-w-[240px] sm:max-w-[320px]">{email}</span>
          </div>
        )}

        <div className="flex items-start gap-2.5 pt-1 text-slate-600 leading-relaxed">
          <span className="material-symbols-rounded text-slate-400 text-[18px] shrink-0 mt-0.5">info</span>
          <span>
            No necesitas realizar ninguna acción por el momento. Te notificaremos por correo electrónico cuando haya novedades sobre tu aplicación.
          </span>
        </div>
      </div>

      <div className="p-4 bg-slate-100/70 border border-slate-200/80 rounded-xl text-[12px] text-slate-500 font-medium leading-relaxed">
        Mientras tu aplicación esté en revisión, no podrás enviar una nueva ni modificar la información presentada.
      </div>

      {/* Navigation CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
        <Button
          onClick={() => router.push("/especialistas")}
          variant="primary"
          className="w-full sm:!w-auto px-6 !h-11 bg-slate-900 text-white hover:bg-black font-bold font-jakarta text-[13px] tracking-wide !rounded-xl"
        >
          Volver a Especialistas
        </Button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-[13px] text-slate-600 hover:text-slate-900 font-semibold font-jakarta hover:underline transition bg-transparent border-none cursor-pointer px-4 py-2"
        >
          Ir al inicio
        </button>
      </div>
    </div>
  );
}
