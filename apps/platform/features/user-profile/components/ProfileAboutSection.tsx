"use client";

import { ProfileButton, EmptyProfileButton } from "@/components/ui/Button";

interface ProfileAboutSectionProps {
  bio?: string;
  onEdit?: () => void;
  isPublic?: boolean;
  firstName?: string;
}

export function ProfileAboutSection({ bio, onEdit, isPublic = false, firstName }: ProfileAboutSectionProps) {
  const hasBio = bio && bio.trim().length > 0;
  const nameToUse = firstName ? firstName.trim() : "Este usuario";

  return (
    <div className="bg-white rounded-2xl p-4 lg:p-6 flex flex-col gap-4 lg:gap-5 border border-slate-200 shadow-none relative group">
      {!isPublic && onEdit && (
        <ProfileButton
          onClick={onEdit}
          icon="edit"
          className="absolute top-4 right-4 z-20"
        />
      )}
      <div className="flex items-center gap-1">
        <h3 className="text-label text-[0.75rem] lg:text-[0.8125rem] uppercase font-semibold ml-1">Sobre mí</h3>
      </div>

      {hasBio ? (
        <p className="text-sm lg:text-base text-slate-600 leading-relaxed animate-in fade-in duration-300">
          {bio}
        </p>
      ) : (
        <div className="flex flex-col items-start gap-4">
          <p className="text-sm lg:text-base text-slate-400 font-medium italic tracking-tight leading-relaxed">
            {isPublic ? `${nameToUse} aún no ha escrito sobre sí...` : "Aún no has escrito nada sobre ti..."}
          </p>
          {!isPublic && onEdit && (
            <EmptyProfileButton
              onClick={onEdit}
              label="Escribe sobre ti"
              icon="add"
            />
          )}
        </div>
      )}
    </div>
  );
}
