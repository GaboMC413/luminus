import React from "react";
import { CreditCard } from "lucide-react";

interface BrandIconProps {
  brand?: string;
  className?: string;
}

export function BrandIcon({ brand = "unknown", className = "" }: BrandIconProps) {
  const normalized = brand.toLowerCase();

  if (normalized === "visa") {
    return (
      <div
        className={`w-9 h-6 rounded bg-[#1A1F71] text-white flex items-center justify-center font-black tracking-wider text-[11px] italic shadow-none select-none shrink-0 ${className}`}
        aria-label="Visa"
      >
        VISA
      </div>
    );
  }

  if (normalized === "mastercard") {
    return (
      <div
        className={`w-9 h-6 rounded bg-slate-900 flex items-center justify-center relative shadow-none overflow-hidden select-none shrink-0 ${className}`}
        aria-label="Mastercard"
      >
        <span className="w-3.5 h-3.5 rounded-full bg-[#EB001B] opacity-90 inline-block mr-[-4px]" />
        <span className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90 inline-block" />
      </div>
    );
  }

  if (normalized === "amex" || normalized === "american_express") {
    return (
      <div
        className={`w-9 h-6 rounded bg-[#006FCF] text-white flex items-center justify-center font-bold text-[8px] tracking-tighter shadow-none select-none shrink-0 ${className}`}
        aria-label="American Express"
      >
        AMEX
      </div>
    );
  }

  return (
    <div
      className={`w-9 h-6 rounded bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center shadow-none select-none shrink-0 ${className}`}
      aria-label="Tarjeta de crédito"
    >
      <CreditCard className="w-4 h-4 text-slate-500" />
    </div>
  );
}
