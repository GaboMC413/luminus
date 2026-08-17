import React from "react";

type BadgeVariant = "lime" | "pink" | "orange" | "blue" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  blue: "bg-[#DCE6FF] text-[#002C9E] border-[#0450FB]/10",
  lime: "bg-[#F4F8B8] text-[#7A8500] border-[#D4E600]/10",
  orange: "bg-[#FFE0C2] text-[#B84A00] border-[#FF7700]/10",
  pink: "bg-[#FFE0FC] text-[#B832B4] border-[#FF80FC]/10",
  neutral: "bg-slate-50 text-black border-slate-200",
};

export function Badge({ children, icon, variant = "lime", className = "" }: BadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 self-start rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide ${variants[variant]} ${className}`}>
      {icon && <span className="flex items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}
