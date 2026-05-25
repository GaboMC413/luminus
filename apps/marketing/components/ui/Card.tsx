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
    lift: "hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5",
    "lift-lg": "hover:shadow-bold-lg hover:-translate-x-1 hover:-translate-y-1",
  };

  return (
    <div
      className={`relative rounded-[2.5rem] border-2 border-black bg-white p-8 transition-all duration-150 ${hoverClasses[hoverEffect]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
