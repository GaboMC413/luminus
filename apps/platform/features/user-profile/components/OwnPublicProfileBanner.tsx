"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface OwnPublicProfileBannerProps {
  className?: string;
}

export function OwnPublicProfileBanner({ className = "" }: OwnPublicProfileBannerProps) {
  const router = useRouter();

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 ${className}`}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
          <Eye className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-title-section font-semibold text-slate-900 font-jakarta leading-snug">
            Estás viendo tu perfil como lo ven otros miembros
          </p>
          <p className="text-body text-slate-500 font-sans">
            Esta es tu vista pública. Para modificar tus datos o secciones, ve a tu editor de perfil.
          </p>
        </div>
      </div>

      <Button
        onClick={() => router.push("/perfil-usuario")}
        variant="primary"
        size="sm"
        className="gap-1.5 shrink-0 self-start sm:self-auto"
      >
        <Pencil className="w-3.5 h-3.5" />
        <span>Editar mi perfil</span>
      </Button>
    </div>
  );
}
