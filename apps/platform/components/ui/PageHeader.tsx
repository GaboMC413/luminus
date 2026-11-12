"use client";

import React from "react";
import Link from "next/link";
import { Button } from "./Button";

export interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  backHref?: string;
  onBack?: () => void;
  backLabel?: string;
  rightSlot?: React.ReactNode;
  className?: string;
}

/**
 * Standardized page header for in-app screens across LUMINUS platform.
 * Adheres strictly to DESIGN.md Section 2.2: .text-title-page token.
 */
export function PageHeader({
  title,
  description,
  backHref,
  onBack,
  backLabel = "Volver",
  rightSlot,
  className = "",
}: PageHeaderProps) {
  const hasBackAction = Boolean(backHref || onBack);

  return (
    <header className={`flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="flex flex-col min-w-0">
        {hasBackAction && (
          <div className="mb-2">
            {backHref ? (
              <Link href={backHref} className="inline-flex">
                <Button variant="back">{backLabel}</Button>
              </Link>
            ) : (
              <Button variant="back" onClick={onBack}>
                {backLabel}
              </Button>
            )}
          </div>
        )}

        <h1 className="font-jakarta font-bold text-slate-900 tracking-tight text-xl sm:text-2xl m-0 leading-tight">
          {title}
        </h1>

        {description && (
          <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1 m-0 leading-normal">
            {description}
          </p>
        )}
      </div>

      {rightSlot && (
        <div className="flex items-center gap-2 sm:self-center shrink-0">
          {rightSlot}
        </div>
      )}
    </header>
  );
}

export default PageHeader;
