"use client";

import { ProfileButton } from "@/components/ui/Button";
import { PromptsDisplay, Prompt } from "./ProfilePrompts";

interface ProfileCompletionCardProps {
  prompts: Prompt[];
  onEditPrompts?: (step?: 'list' | 'select') => void;
  isPublic?: boolean;
}

export function ProfileCompletionCard({ prompts, onEditPrompts, isPublic = false }: ProfileCompletionCardProps) {
  return (
    <div className="relative group">
      {!isPublic && onEditPrompts && (
        <ProfileButton
          onClick={() => onEditPrompts('list')}
          icon="edit"
          className="absolute top-4 right-4 z-20"
        />
      )}
      <PromptsDisplay prompts={prompts} onEdit={onEditPrompts} isPublic={isPublic} />
    </div>
  );
}
