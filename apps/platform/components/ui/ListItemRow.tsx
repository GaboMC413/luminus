"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

export interface ListItemRowProps {
  avatar?: string | null;
  name: string;
  subtitle?: string | null;
  trailingAction?: React.ReactNode;
  showChevron?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ListItemRow({
  avatar,
  name,
  subtitle,
  trailingAction,
  showChevron = true,
  onClick,
  className = "",
}: ListItemRowProps) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`flex items-center justify-between p-2 rounded-xl transition-colors duration-150 group select-none ${
        isClickable ? "hover:bg-slate-50 cursor-pointer" : ""
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <UserAvatar src={avatar} alt={name} size="md" />

        <div className="flex flex-col min-w-0">
          <span className="font-jakarta text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-slate-700 transition-colors truncate">
            {name}
          </span>
          {subtitle && (
            <span className="font-sans text-[11px] sm:text-xs text-slate-500 truncate">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center shrink-0 ml-2">
        {trailingAction}
        {!trailingAction && showChevron && isClickable && (
          <ChevronRight
            className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors"
            strokeWidth={2}
          />
        )}
      </div>
    </div>
  );
}
