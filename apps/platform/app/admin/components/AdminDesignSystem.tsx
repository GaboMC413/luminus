"use client";

import React from "react";

export interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminCard({ children, className = "" }: AdminCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export interface AdminBadgeProps {
  variant?: "active" | "pending" | "disabled" | "deleted" | "admin" | "specialist" | "user" | "plan" | "default";
  children: React.ReactNode;
  className?: string;
}

export function AdminBadge({ variant = "default", children, className = "" }: AdminBadgeProps) {
  const variantStyles = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    pending: "bg-amber-50 text-amber-700 border-amber-200/60",
    disabled: "bg-slate-100 text-slate-600 border-slate-200",
    deleted: "bg-rose-50 text-rose-700 border-rose-200/60",
    admin: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
    specialist: "bg-teal-50 text-teal-700 border-teal-200/60",
    user: "bg-slate-100 text-slate-700 border-slate-200/60",
    plan: "bg-violet-50 text-violet-700 border-violet-200/60",
    default: "bg-slate-100 text-slate-600 border-slate-200/60",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export interface AdminDetailRowProps {
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
  icon?: string;
  className?: string;
}

export function AdminDetailRow({ label, value, subValue, icon, className = "" }: AdminDetailRowProps) {
  return (
    <div
      className={`flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/40 px-3 rounded-xl transition-colors ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {icon && (
          <span className="material-symbols-rounded text-slate-400 text-[18px] shrink-0">
            {icon}
          </span>
        )}
        <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="text-right min-w-0 flex-1">
        <span className="text-[13.5px] font-semibold text-slate-900 block truncate">
          {value || "-"}
        </span>
        {subValue && (
          <span className="text-[11.5px] text-slate-500 block truncate mt-0.5 font-sans">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}

export interface AdminSectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function AdminSectionHeader({ title, subtitle, action, className = "" }: AdminSectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-4 mb-4 ${className}`}>
      <div>
        <h2 className="text-[18px] font-bold text-slate-900 leading-tight font-jakarta">{title}</h2>
        {subtitle && <p className="text-[13px] text-slate-500 mt-0.5 font-sans">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
