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

  return (
    <div
      className={`relative rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-soft backdrop-blur-sm transition-all duration-300 ${hoverClasses[hoverEffect]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
