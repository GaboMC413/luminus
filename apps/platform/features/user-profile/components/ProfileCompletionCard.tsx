"use client";

import { ProfileButton } from "@/components/ui/Button";
import { PromptsDisplay, Prompt } from "./ProfilePrompts";

interface ProfileCompletionCardProps {
  prompts: Prompt[];
  onEditPrompts: (step?: 'list' | 'select') => void;
}

export function ProfileCompletionCard({ prompts, onEditPrompts }: ProfileCompletionCardProps) {
  return (
    <div className="relative group">
      <ProfileButton
        onClick={() => onEditPrompts('list')}
        icon="edit"
        className="absolute top-4 right-4 z-20"
      />
      <PromptsDisplay prompts={prompts} onEdit={onEditPrompts} />
    </div>
  );
}
