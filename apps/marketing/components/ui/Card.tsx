import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: "none" | "lift" | "lift-lg";
}

export function Card({
  children,
  className = "",
  hoverEffect = "lift",
  ...props
}: CardProps) {
  const hoverClasses = {
    none: "",
    lift: "hover:shadow-medium hover:-translate-y-1 hover:border-slate-200",
    "lift-lg": "hover:shadow-medium hover:-translate-y-1.5 hover:border-slate-300",
  };

  const baseBgClass = className.includes("bg-") ? "" : "bg-white/80";
  const basePaddingClass = className.includes("p-") ? "" : "p-8";
  const baseShadowClass = className.includes("shadow-") ? "" : "shadow-soft";

  return (
    <div
      className={`relative rounded-3xl border border-slate-200/80 ${baseBgClass} ${basePaddingClass} ${baseShadowClass} backdrop-blur-sm transition-all duration-300 ${hoverClasses[hoverEffect]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
