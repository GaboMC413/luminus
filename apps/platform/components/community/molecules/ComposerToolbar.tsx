"use client";

import React from "react";
import { Bold, Italic, Underline, List, ListOrdered, Link2 } from "lucide-react";

export interface ComposerToolbarProps {
  onFormat: (command: string, value?: string) => void;
  onInsertLink: () => void;
}

export function ComposerToolbar({ onFormat, onInsertLink }: ComposerToolbarProps) {
  const handleMouseDown = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    action();
  };

  return (
    <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-1 bg-white">
      <button
        type="button"
        onMouseDown={(e) => handleMouseDown(e, () => onFormat("bold"))}
        title="Negrita (Ctrl+B)"
        aria-label="Negrita"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
      >
        <Bold className="w-4 h-4" strokeWidth={2.2} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => handleMouseDown(e, () => onFormat("italic"))}
        title="Cursiva (Ctrl+I)"
        aria-label="Cursiva"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
      >
        <Italic className="w-4 h-4" strokeWidth={2.2} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => handleMouseDown(e, () => onFormat("underline"))}
        title="Subrayado (Ctrl+U)"
        aria-label="Subrayado"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
      >
        <Underline className="w-4 h-4" strokeWidth={2.2} />
      </button>

      <div className="w-[1px] h-4 bg-slate-200 mx-1 shrink-0" />

      <button
        type="button"
        onMouseDown={(e) => handleMouseDown(e, () => onFormat("insertUnorderedList"))}
        title="Lista con viñetas"
        aria-label="Lista con viñetas"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
      >
        <List className="w-4 h-4" strokeWidth={2} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => handleMouseDown(e, () => onFormat("insertOrderedList"))}
        title="Lista numerada"
        aria-label="Lista numerada"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
      >
        <ListOrdered className="w-4 h-4" strokeWidth={2} />
      </button>

      <div className="w-[1px] h-4 bg-slate-200 mx-1 shrink-0" />

      <button
        type="button"
        onMouseDown={(e) => handleMouseDown(e, onInsertLink)}
        title="Insertar enlace"
        aria-label="Insertar enlace"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
      >
        <Link2 className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}
