import React from "react";

interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  badge?: React.ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  align = "center",
  className = "",
  badge,
}: SectionHeaderProps) {
  return (
    <div
      className={`mb-16 flex flex-col ${
        align === "center" ? "items-center text-center" : "items-start text-left"
      } ${className}`}
    >
      {badge && <div className="mb-6">{badge}</div>}
      <h2 className="font-display text-4xl font-black tracking-tight text-black sm:text-5xl lg:text-6xl leading-[1.05] mb-6 max-w-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg sm:text-xl leading-relaxed text-slate-700 font-bold max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
