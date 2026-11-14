import React from "react";

export interface StepHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function StepHeader({
  title,
  subtitle,
  className = "",
}: StepHeaderProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 font-jakarta leading-tight tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-slate-500 font-sans leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default StepHeader;
