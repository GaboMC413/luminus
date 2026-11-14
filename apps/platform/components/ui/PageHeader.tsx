"use client";

import React from "react";
import { BackButton } from "./Button";

export interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  backHref?: string;
  onBack?: () => void;
  showBack?: boolean;
  backFallbackHref?: string;
  backLabel?: string;
  rightSlot?: React.ReactNode;
  className?: string;
}

/**
 * Standardized single-line page header molecule across LUMINUS platform.
 * Matches Account Settings (`Configuración`): inline BackButton (`w-10 h-10 rounded-xl`) + single-line `h1` title without subtitle.
 */
export function PageHeader({
  title,
  backHref,
  onBack,
  showBack = false,
  backFallbackHref = "/inicio",
  backLabel = "Volver",
  rightSlot,
  className = "",
}: PageHeaderProps) {
  const hasBackAction = Boolean(backHref || onBack || showBack);

  return (
    <header className={`flex items-center justify-between gap-3 shrink-0 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        {hasBackAction && (
          <BackButton
            href={backHref}
            onClick={onBack}
            fallbackHref={backFallbackHref}
            title={backLabel}
          />
        )}

        <h1 className="text-xl md:text-2xl text-slate-900 font-bold font-jakarta tracking-tight m-0 leading-tight truncate">
          {title}
        </h1>
      </div>

      {rightSlot && (
        <div className="flex items-center gap-2 shrink-0">
          {rightSlot}
        </div>
      )}
    </header>
  );
}

export default PageHeader;
