import React from "react";

export function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-1 mb-5 md:mb-6">
      <h2 className="text-xl sm:text-2xl font-bold font-jakarta text-slate-900 tracking-tight m-0 hidden md:block">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-slate-500 font-sans leading-relaxed m-0">
          {description}
        </p>
      )}
    </div>
  );
}
