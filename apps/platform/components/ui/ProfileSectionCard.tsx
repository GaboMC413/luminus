"use client";

import React from "react";
import { Edit3 } from "lucide-react";
import { EmptyProfileButton } from "@/components/ui/Button";

export interface ProfileSectionCardProps {
  title?: string;
  meta?: React.ReactNode;
  isPublic?: boolean;
  isEmpty?: boolean;
  emptyActionLabel?: string;
  emptyActionIcon?: string;
  onEdit?: () => void;
  editTitle?: string;
  highlight?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Canonical card container for all User and Specialist profile sections.
 * Automatically hides empty cards on public views and standardizes headers,
 * body rhythm, and owner edit triggers.
 */
export function ProfileSectionCard({
  title,
  meta,
  isPublic = false,
  isEmpty = false,
  emptyActionLabel,
  emptyActionIcon = "add",
  onEdit,
  editTitle,
  highlight = false,
  children,
  className = "",
}: ProfileSectionCardProps) {
  if (isPublic && isEmpty) {
    return null;
  }

  const handleEditClick = () => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
    onEdit?.();
  };

  const hasHeaderRow = Boolean(title || meta);
  const showFloatingEdit = !hasHeaderRow && !isPublic && Boolean(onEdit) && !isEmpty;

  return (
    <section
      className={`bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col gap-3.5 shadow-none relative ${className}`}
    >
      {hasHeaderRow && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {title && (
              <h3 className="text-title-section text-slate-900 font-bold truncate">
                {title}
              </h3>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {meta && (
              <span className="text-meta text-slate-400">
                {meta}
              </span>
            )}
            {!isPublic && onEdit && !isEmpty && (
              <button
                type="button"
                onClick={handleEditClick}
                className={`w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer border border-slate-200/60 shadow-none ${
                  highlight ? "glow-highlight" : ""
                }`}
                title={editTitle || (title ? `Editar ${title}` : "Editar sección")}
                aria-label={editTitle || (title ? `Editar ${title}` : "Editar sección")}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {showFloatingEdit && (
        <button
          type="button"
          onClick={handleEditClick}
          className={`absolute top-5 right-5 sm:top-6 sm:right-6 w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer border border-slate-200/60 shadow-none ${
            highlight ? "glow-highlight" : ""
          }`}
          title={editTitle || "Editar sección"}
          aria-label={editTitle || "Editar sección"}
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      )}

      {isEmpty && !isPublic && onEdit && emptyActionLabel ? (
        <EmptyProfileButton
          onClick={handleEditClick}
          label={emptyActionLabel}
          icon={emptyActionIcon}
          className={highlight ? "glow-highlight" : ""}
        />
      ) : (
        children
      )}
    </section>
  );
}

export default ProfileSectionCard;
