"use client";

import React, { useState } from "react";
import { User } from "lucide-react";

export interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_STYLES = {
  xs: "w-6 h-6 rounded-lg text-slate-400",
  sm: "w-8 h-8 rounded-lg text-slate-400",
  md: "w-10 h-10 rounded-xl text-slate-400",
  lg: "w-16 h-16 rounded-2xl text-slate-400",
  xl: "w-24 h-24 rounded-2xl text-slate-400",
};

const ICON_SIZES = {
  xs: "w-3.5 h-3.5",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export function UserAvatar({
  src,
  alt = "Usuario",
  size = "md",
  className = "",
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const showImage = Boolean(src && !hasError);

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 select-none ${SIZE_STYLES[size]} ${className}`}
    >
      {showImage ? (
        <img
          src={src as string}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <User className={ICON_SIZES[size]} strokeWidth={1.75} />
      )}
    </div>
  );
}
