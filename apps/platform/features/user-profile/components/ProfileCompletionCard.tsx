"use client";

import { Edit3 } from "lucide-react";
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
        <button
          onClick={() => {
            window.history.replaceState(null, "", window.location.pathname);
            onEditPrompts('list');
          }}
          className={`absolute top-5 right-5 z-20 w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer border border-slate-200/60 shadow-none ${highlight ? "glow-highlight" : ""}`}
          title="Editar reflexiones"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      )}
      <PromptsDisplay prompts={prompts} onEdit={onEditPrompts} isPublic={isPublic} firstName={firstName} highlight={highlight} />
    </div>
  );
}
