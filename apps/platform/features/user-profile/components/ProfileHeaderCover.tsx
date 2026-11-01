"use client";

import { Camera } from "lucide-react";

interface ProfileHeaderCoverProps {
  coverUrl: string;
  onChangeCover?: () => void;
  isPublic?: boolean;
  highlight?: boolean;
}

export function ProfileHeaderCover({ coverUrl, onChangeCover, isPublic = false, highlight = false }: ProfileHeaderCoverProps) {
  const hasCover = coverUrl && coverUrl !== "" && !coverUrl.includes("empty");

  return (
    <div className={`hidden md:block w-full md:h-44 lg:h-56 overflow-hidden relative shrink-0 group ${!hasCover ? 'luminus-light-gradient border-b border-slate-200' : 'bg-slate-100'}`}>
      {hasCover && (
        <img
          src={coverUrl}
          alt="Profile Cover"
          className="w-full h-full object-cover"
        />
      )}
      {!isPublic && onChangeCover && (
        <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
          <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 h-full relative">
            <div className="w-full max-w-6xl mx-auto h-full relative">
              <button
                onClick={() => {
                  window.history.replaceState(null, "", window.location.pathname);
                  onChangeCover();
                }}
                className={`absolute bottom-4 right-0 pointer-events-auto flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white/95 border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:bg-white text-xs font-semibold font-jakarta transition-all shadow-none cursor-pointer ${highlight ? "glow-highlight" : ""} ${hasCover ? "opacity-70 hover:opacity-100" : ""}`}
              >
                <Camera className="w-4 h-4" />
                <span>{hasCover ? "Cambiar portada" : "Seleccionar portada"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
