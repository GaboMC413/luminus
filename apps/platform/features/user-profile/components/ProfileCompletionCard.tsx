"use client";

import { PromptsDisplay, Prompt } from "./ProfilePrompts";

interface ProfileCompletionCardProps {
  prompts: Prompt[];
  onEditPrompts?: (step?: 'list' | 'select') => void;
  isPublic?: boolean;
  firstName?: string;
  highlight?: boolean;
}

export function ProfileCompletionCard({
  prompts,
  onEditPrompts,
  isPublic = false,
  firstName,
  highlight = false,
}: ProfileCompletionCardProps) {
  return (
    <PromptsDisplay
      prompts={prompts}
      onEdit={onEditPrompts}
      isPublic={isPublic}
      firstName={firstName}
      highlight={highlight}
    />
  );
}
