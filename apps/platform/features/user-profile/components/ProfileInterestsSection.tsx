"use client";

import { ProfileSectionCard } from "@/components/ui/ProfileSectionCard";
import { InterestPill } from "@/components/ui/InterestPill";

interface ProfileInterestsSectionProps {
  interests: string[];
  otherInterests?: string;
  onEdit?: () => void;
  isPublic?: boolean;
  firstName?: string;
  highlight?: boolean;
}

export function ProfileInterestsSection({
  interests,
  otherInterests,
  onEdit,
  isPublic = false,
  highlight = false,
}: ProfileInterestsSectionProps) {
  const hasInterests = Boolean(
    (interests && interests.length > 0) ||
      (otherInterests && otherInterests.trim().length > 0)
  );

  return (
    <ProfileSectionCard
      title="Intereses"
      isPublic={isPublic}
      isEmpty={!hasInterests}
      emptyActionLabel="Selecciona tus intereses"
      onEdit={onEdit}
      editTitle="Editar intereses"
      highlight={highlight}
    >
      <div className="flex flex-wrap gap-1.5">
        {interests?.map((interest: string, idx: number) => (
          <InterestPill key={idx} interest={interest} size="sm" />
        ))}
        {otherInterests && otherInterests.trim().length > 0 && (
          <div className="h-6 px-2.5 bg-slate-50 text-slate-600 border border-slate-200/80 rounded-full text-meta font-medium italic font-sans flex items-center shadow-none shrink-0 select-none">
            + {otherInterests}
          </div>
        )}
      </div>
    </ProfileSectionCard>
  );
}
