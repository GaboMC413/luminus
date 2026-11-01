"use client";

import { Edit3 } from "lucide-react";
import { EmptyProfileButton } from "@/components/ui/Button";
import { InterestPill } from "@/components/ui/InterestPill";

interface ProfileInterestsSectionProps {
  interests: string[];
  otherInterests?: string;
  onEdit?: () => void;
  isPublic?: boolean;
  firstName?: string;
  highlight?: boolean;
}

export function ProfileInterestsSection({ interests, otherInterests, onEdit, isPublic = false, firstName, highlight = false }: ProfileInterestsSectionProps) {
  const hasInterests = (interests && interests.length > 0) || (otherInterests && otherInterests.trim().length > 0);
  const nameToUse = firstName ? firstName.trim() : "Este usuario";

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 flex flex-col gap-4 border border-slate-200/90 shadow-none relative group">
      {!isPublic && onEdit && (
        <button
          onClick={() => {
            window.history.replaceState(null, "", window.location.pathname);
            onEdit();
          }}
          className={`absolute top-5 right-5 z-20 w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer border border-slate-200/60 shadow-none ${highlight ? "glow-highlight" : ""}`}
          title="Editar intereses"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      )}
      <div className="flex items-center gap-1.5">
        <h3 className="text-title-section text-slate-900 font-jakarta uppercase tracking-wider text-xs font-bold">
          Intereses
        </h3>
      </div>

      {hasInterests ? (
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {interests?.map((interest: string, idx: number) => (
            <InterestPill key={idx} interest={interest} />
          ))}
          {otherInterests && (
            <div className="h-8 px-3 bg-slate-50 text-slate-500 border border-slate-200/70 rounded-xl text-xs font-medium italic tracking-tight font-sans flex items-center shadow-none shrink-0 select-none">
              + {otherInterests}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-4">
          {isPublic ? (
            <p className="text-body text-slate-400 font-normal italic tracking-tight leading-relaxed">
              {nameToUse} aún no ha seleccionado intereses.
            </p>
          ) : (
            onEdit && (
              <EmptyProfileButton 
                onClick={() => {
                  window.history.replaceState(null, "", window.location.pathname);
                  onEdit();
                }}
                label="Selecciona tus intereses"
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
