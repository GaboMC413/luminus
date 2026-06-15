"use client";

import { ProfileButton } from "@/components/ui/Button";
import { PromptsDisplay, Prompt } from "./ProfilePrompts";

interface ProfileCompletionCardProps {
  prompts: Prompt[];
  onEditPrompts?: (step?: 'list' | 'select') => void;
  isPublic?: boolean;
  firstName?: string;
  highlight?: boolean;
}

export function ProfileCompletionCard({ prompts, onEditPrompts, isPublic = false, firstName, highlight = false }: ProfileCompletionCardProps) {
  return (
    <div className="relative group">
      {!isPublic && onEditPrompts && (
        <ProfileButton
          onClick={() => {
            window.history.replaceState(null, "", window.location.pathname);
            onEditPrompts('list');
          }}
          icon="edit"
          className={`absolute top-4 right-4 z-20 ${highlight ? "glow-highlight" : ""}`}
        />
      )}
      <PromptsDisplay prompts={prompts} onEdit={onEditPrompts} isPublic={isPublic} firstName={firstName} highlight={highlight} />
    </div>
  );
}
