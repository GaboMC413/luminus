"use client";

import { ProfileSectionCard } from "@/components/ui/ProfileSectionCard";

interface ProfileAboutSectionProps {
  bio?: string;
  onEdit?: () => void;
  isPublic?: boolean;
  firstName?: string;
  highlight?: boolean;
}

export function ProfileAboutSection({
  bio,
  onEdit,
  isPublic = false,
  highlight = false,
}: ProfileAboutSectionProps) {
  const hasBio = Boolean(bio && bio.trim().length > 0);

  return (
    <ProfileSectionCard
      title="Sobre mí"
      isPublic={isPublic}
      isEmpty={!hasBio}
      emptyActionLabel="Escribe sobre ti"
      onEdit={onEdit}
      editTitle="Editar Sobre mí"
      highlight={highlight}
    >
      <p className="text-body text-slate-600 whitespace-pre-wrap">
        {bio}
      </p>
    </ProfileSectionCard>
  );
}
