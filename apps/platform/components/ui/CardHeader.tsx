"use client";

import React from "react";
import { Button } from "./Button";

export interface CardHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  customAction?: React.ReactNode;
  divider?: boolean;
  className?: string;
}

export function CardHeader({
  title,
  description,
  action,
  customAction,
  divider = false,
  className = "",
}: CardHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${
        divider ? "pb-3 border-b border-slate-100 mb-3" : ""
      } ${className}`}
    >
      <div className="flex flex-col min-w-0">
        <h3 className="font-jakarta text-xs sm:text-sm font-semibold text-slate-700 truncate m-0">
          {title}
        </h3>
        {description && (
          <p className="font-sans text-xs text-slate-500 mt-0.5 truncate m-0">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center shrink-0">
        {customAction}
        {!customAction && action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            className="text-slate-500 hover:text-slate-900"
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
