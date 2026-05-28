import React from 'react';

export function PlatformFooter({ className = "" }: { className?: string }) {
 return (
  <footer className={`w-full py-6 border-t bg-slate-50 border-slate-100 bg-slate-5 shrink-0 ${className}`}>
   <p className="text-[10px] text-slate-400 text-center uppercase tracking-wide">
    LUMINUS LATAM © 2026
   </p>
  </footer>
 );
}

export default PlatformFooter;
