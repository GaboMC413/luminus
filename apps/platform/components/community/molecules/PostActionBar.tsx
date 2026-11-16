"use client";

import React from "react";
import { Heart, MessageCircle } from "lucide-react";

export interface PostActionBarProps {
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  onToggleLike: () => void;
  onToggleComments: () => void;
  showComments?: boolean;
}

export function PostActionBar({
  isLiked,
  likesCount,
  commentsCount,
  onToggleLike,
  onToggleComments,
  showComments = false,
}: PostActionBarProps) {
  return (
    <div className="flex items-center gap-2 pt-2 border-t border-slate-100/90 w-full">
      {/* 1. Like Action */}
      <button
        type="button"
        onClick={onToggleLike}
        className={`h-8.5 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold font-jakarta transition-all duration-150 cursor-pointer select-none border ${
          isLiked
            ? "bg-rose-50/80 text-rose-600 border-rose-200/60"
            : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent"
        }`}
        title={isLiked ? "Quitar me gusta" : "Me gusta"}
        aria-label={isLiked ? "Quitar me gusta" : "Me gusta"}
      >
        <Heart
          className={`w-4 h-4 transition-transform active:scale-125 ${
            isLiked ? "fill-current text-rose-600" : "text-slate-400 group-hover:text-slate-600"
          }`}
          strokeWidth={isLiked ? 2.2 : 1.75}
        />
        <span>{likesCount}</span>
      </button>

      {/* 2. Comments Action */}
      <button
        type="button"
        onClick={onToggleComments}
        className={`h-8.5 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold font-jakarta transition-all duration-150 cursor-pointer select-none border ${
          showComments
            ? "bg-slate-100/80 text-slate-900 border-slate-200/60"
            : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent"
        }`}
        title={showComments ? "Ocultar comentarios" : "Ver comentarios"}
        aria-label="Comentarios"
      >
        <MessageCircle className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
        <span>{commentsCount}</span>
      </button>
    </div>
  );
}
