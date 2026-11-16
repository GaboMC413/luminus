"use client";

import React, { useRef, useEffect } from "react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Send } from "lucide-react";

export interface CommentInputBoxProps {
  userAvatar?: string | null;
  userName?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CommentInputBox({
  userAvatar,
  userName = "Usuario",
  value,
  onChange,
  onSubmit,
  placeholder = "Escribe un comentario...",
  disabled = false,
}: CommentInputBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea according to content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 115)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  const hasContent = Boolean(value.trim());

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (hasContent && !disabled) {
          onSubmit();
        }
      }}
      className="flex items-start gap-2.5 sm:gap-3 pt-2 w-full"
    >
      {/* Current User Avatar - Standard 40px (size="md") */}
      <div className="shrink-0">
        <UserAvatar src={userAvatar} alt={userName} size="md" />
      </div>

      {/* Input container: 40px base height matching the avatar */}
      <div className="flex-1 min-w-0 bg-white border border-slate-200 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400/20 rounded-xl transition-colors flex items-center gap-2 pl-3.5 pr-2 py-1.5 min-h-[40px] shadow-none">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          style={{ overflowY: "hidden" }}
          className="flex-1 min-w-0 bg-transparent border-none outline-none resize-none text-sm text-slate-900 placeholder:text-slate-400 font-sans leading-5 max-h-[115px] visible-scrollbar p-0 my-auto focus:ring-0 disabled:text-slate-400"
        />

        {/* Send Action Button: Clean icon when empty, solid when active */}
        <button
          type="submit"
          disabled={!hasContent || disabled}
          aria-label="Enviar comentario"
          title="Enviar comentario"
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 my-auto transition-all border-none ${
            hasContent && !disabled
              ? "bg-slate-900 text-white hover:bg-black active:scale-95 cursor-pointer shadow-xs"
              : "bg-transparent text-slate-300 cursor-default"
          }`}
        >
          <Send className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>
    </form>
  );
}
