import React from 'react';

export function PlatformFooter({ className = "" }: { className?: string }) {
  // Hide on mobile layouts globally by default unless an explicit display override is passed in className
  const hasDisplayOverride = className.includes("hidden") || className.includes("block") || className.includes("flex") || className.includes("grid");
  const displayClass = hasDisplayOverride ? "" : "hidden lg:block";

  return (
    <footer className={`${displayClass} w-full py-6 border-t bg-slate-50 border-slate-100 bg-slate-5 shrink-0 ${className}`}>
      <p className="text-[10px] text-slate-400 text-center uppercase tracking-wide">
        LUMINUS LATAM © 2026
      </p>
    </footer>
  );
}

export default PlatformFooter;
