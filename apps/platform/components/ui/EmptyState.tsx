"use client";

import React from "react";
import { Inbox } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-10 px-4 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shrink-0">
        {icon || <Inbox className="w-6 h-6 stroke-[1.75]" />}
      </div>
      <h4 className="text-title-section text-[15px] text-slate-900 mb-1">
        {title}
      </h4>
      {description && (
        <p className="text-body text-slate-500 max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
      {!action && actionLabel && onAction && (
        <div className="mt-1">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
