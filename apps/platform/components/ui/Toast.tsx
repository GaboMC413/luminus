"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: "success" | "error" | "info";
  autoCloseMs?: number;
}

export function Toast({
  isOpen,
  onClose,
  title,
  message,
  type = "success",
  autoCloseMs = 5000,
}: ToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !autoCloseMs) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseMs);
    return () => clearTimeout(timer);
  }, [isOpen, autoCloseMs, onClose]);

  if (!isOpen || !mounted) return null;

  const iconConfig = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
      border: "border-slate-200/90",
      bgBadge: "bg-emerald-50 text-emerald-700",
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
      border: "border-rose-200",
      bgBadge: "bg-rose-50 text-rose-700",
    },
    info: {
      icon: <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />,
      border: "border-slate-200/90",
      bgBadge: "bg-indigo-50 text-indigo-700",
    },
  }[type];

  return createPortal(
    <aside
      aria-live="polite"
      role="status"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 sm:bottom-6 sm:right-6 sm:left-auto sm:translate-x-0 z-[9999] w-[calc(100%-32px)] sm:w-[380px] pointer-events-auto"
    >
      <div
        className={`w-full bg-white rounded-2xl border ${iconConfig.border} shadow-lg shadow-slate-900/10 p-4 flex items-start gap-3.5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3`}
      >
        {iconConfig.icon}

        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-sm font-semibold text-slate-900 leading-snug font-jakarta">
            {title}
          </h4>
          {message && (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed font-jakarta">
              {message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar notificación"
          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 -mr-1 -mt-1 cursor-pointer bg-transparent border-none"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>,
    document.body
  );
}

export default Toast;
