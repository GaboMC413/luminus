"use client";

import { ProfileButton, EmptyProfileButton } from "@/components/ui/Button";
import { InterestPill } from "@/components/ui/InterestPill";

interface ProfileInterestsSectionProps {
  interests: string[];
  otherInterests?: string;
  onEdit: () => void;
}

export function ProfileInterestsSection({ interests, otherInterests, onEdit }: ProfileInterestsSectionProps) {
  const hasInterests = (interests && interests.length > 0) || (otherInterests && otherInterests.trim().length > 0);

  return (
    <div className="bg-white rounded-[24px] p-5 md:p-6 flex flex-col gap-2 md:gap-6 border border-slate-200 shadow-none relative group">
      <ProfileButton
        onClick={onEdit}
        icon="edit"
        className="absolute top-4 right-4 z-20"
      />
      <div className="flex items-center gap-1">
        <h3 className="text-label text-[0.8125rem] uppercase font-semibold ml-1">Intereses</h3>
      </div>

      {hasInterests ? (
        <div className="flex flex-wrap gap-3">
          {interests?.map((interest: string, idx: number) => (
            <InterestPill key={idx} interest={interest} />
          ))}
          {otherInterests && (
            <div className="h-9 px-4 bg-slate-50 text-slate-400 border border-slate-100 rounded-[12px] text-[12px] md:text-[14px] font-medium italic tracking-tight font-sans flex items-center shadow-none shrink-0 select-none">
              + {otherInterests}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-4">
          <p className="text-body text-slate-400 font-medium italic tracking-tight">
            No has seleccionado tus intereses todavía
          </p>
          <EmptyProfileButton 
            onClick={onEdit}
            label="Selecciona tus intereses"
            icon="add"
          />
        </div>
      )}
    </div>
  );
}
