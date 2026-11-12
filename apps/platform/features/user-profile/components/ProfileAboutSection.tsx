"use client";

import { Edit3 } from "lucide-react";
import { EmptyProfileButton } from "@/components/ui/Button";

interface ProfileAboutSectionProps {
  bio?: string;
  onEdit?: () => void;
  isPublic?: boolean;
  firstName?: string;
  highlight?: boolean;
}

export function ProfileAboutSection({ bio, onEdit, isPublic = false, firstName, highlight = false }: ProfileAboutSectionProps) {
  const hasBio = bio && bio.trim().length > 0;
  const nameToUse = firstName ? firstName.trim() : "Este usuario";

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 flex flex-col gap-3.5 border border-slate-200/90 shadow-none relative group">
      {!isPublic && onEdit && (
        <button
          onClick={() => {
            window.history.replaceState(null, "", window.location.pathname);
            onEdit();
          }}
          className={`absolute top-5 right-5 z-20 w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer border border-slate-200/60 shadow-none ${highlight ? "glow-highlight" : ""}`}
          title="Editar Sobre mí"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      )}
      <div className="flex items-center gap-1.5">
        <h3 className="text-title-section text-slate-900 font-bold">
          Sobre mí
        </h3>
      </div>

      {hasBio ? (
        <p className="text-body text-slate-600 leading-relaxed font-sans whitespace-pre-wrap">
          {bio}
        </p>
      ) : (
        <div className="flex flex-col items-start gap-4">
          {isPublic ? (
            <p className="text-body text-slate-400 font-normal italic tracking-tight leading-relaxed">
              {nameToUse} aún no ha escrito sobre sí.
            </p>
          ) : (
            onEdit && (
              <EmptyProfileButton
                onClick={() => {
                  window.history.replaceState(null, "", window.location.pathname);
                  onEdit();
                }}
                label="Escribe sobre ti"
                icon="add"
                className={highlight ? "glow-highlight" : ""}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
