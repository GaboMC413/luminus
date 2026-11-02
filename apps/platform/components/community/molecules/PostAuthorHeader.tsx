"use client";

import React, { useState, useRef, useEffect } from "react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { MoreHorizontal, Pin } from "lucide-react";

export interface MenuActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
}

export interface PostAuthorHeaderProps {
  authorName: string;
  authorAvatar?: string | null;
  authorSubtitle?: string;
  displayDate?: string;
  isPinned?: boolean;
  isOfficial?: boolean;
  onAuthorClick?: () => void;
  menuActions?: MenuActionItem[];
}

export function PostAuthorHeader({
  authorName,
  authorAvatar,
  authorSubtitle,
  displayDate,
  isPinned = false,
  isOfficial = false,
  onAuthorClick,
  menuActions,
}: PostAuthorHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="flex items-center justify-between gap-3 w-full">
      {/* Left: Avatar + Author Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          onClick={onAuthorClick}
          className={onAuthorClick ? "cursor-pointer transition-opacity hover:opacity-90 shrink-0" : "shrink-0"}
        >
          <UserAvatar src={authorAvatar} alt={authorName} size="md" />
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span
              onClick={onAuthorClick}
              className={`font-jakarta text-sm sm:text-[15px] font-bold text-slate-900 truncate ${
                onAuthorClick ? "hover:text-slate-700 cursor-pointer" : ""
              }`}
            >
              {authorName}
            </span>

            {isOfficial && (
              <span className="font-jakarta text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 shrink-0">
                Oficial
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 font-sans text-xs text-slate-400 font-medium truncate">
            {authorSubtitle && <span className="truncate">{authorSubtitle}</span>}
            {authorSubtitle && displayDate && <span>•</span>}
            {displayDate && <span className="shrink-0">{displayDate}</span>}
          </div>
        </div>
      </div>

      {/* Right: Pinned indicator & Action Menu */}
      <div className="flex items-center gap-1 shrink-0">
        {isPinned && (
          <div
            title="Publicación fijada"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 border border-slate-100"
          >
            <Pin className="w-3.5 h-3.5 fill-slate-400/20" />
          </div>
        )}

        {menuActions && menuActions.length > 0 && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Opciones de publicación"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer border-none bg-transparent"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white border border-slate-200/90 shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                {menuActions.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      action.onClick();
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-jakarta font-semibold flex items-center gap-2 transition-colors cursor-pointer border-none bg-transparent ${
                      action.variant === "destructive"
                        ? "text-rose-600 hover:bg-rose-50"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {action.icon && <span className="shrink-0">{action.icon}</span>}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
