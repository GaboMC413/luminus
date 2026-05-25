import React from "react";

type BadgeVariant = "lime" | "pink" | "orange";

interface BadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  lime: "bg-luminus-lime text-black",
  pink: "bg-luminus-pink/20 text-black",
  orange: "bg-luminus-orange/20 text-black",
};

export function Badge({ children, icon, variant = "lime", className = "" }: BadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 self-start rounded-full border-2 border-black px-4 py-1.5 text-xs font-black shadow-bold-sm ${variants[variant]} ${className}`}>
      {icon && <span className="flex items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}
