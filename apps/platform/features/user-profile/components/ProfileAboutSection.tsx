"use client";

import { ProfileButton, EmptyProfileButton } from "@/components/ui/Button";

interface ProfileAboutSectionProps {
  bio?: string;
  onEdit: () => void;
}

export function ProfileAboutSection({ bio, onEdit }: ProfileAboutSectionProps) {
  const hasBio = bio && bio.trim().length > 0;

  return (
    <div className="bg-white rounded-[24px] p-4 md:p-6 flex flex-col gap-4 md:gap-5 border border-slate-200 shadow-none relative group">
      <ProfileButton
        onClick={onEdit}
        icon="edit"
        className="absolute top-4 right-4 z-20"
      />
      <div className="flex items-center gap-1">
        <h3 className="text-label text-[0.75rem] md:text-[0.8125rem] uppercase font-semibold ml-1">Sobre mí</h3>
      </div>

      {hasBio ? (
        <p className="text-sm md:text-base text-slate-600 leading-relaxed animate-in fade-in duration-300">
          {bio}
        </p>
      ) : (
        <div className="flex flex-col items-start gap-4">
          <p className="text-sm md:text-base text-slate-400 font-medium italic tracking-tight leading-relaxed">
            Aún no has escrito nada sobre ti...
          </p>
          <EmptyProfileButton
            onClick={onEdit}
            label="Escribe sobre ti"
            icon="add"
          />
        </div>
      )}
    </div>
  );
}
