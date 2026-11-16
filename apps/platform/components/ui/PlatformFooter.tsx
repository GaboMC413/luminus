import React from 'react';
import Link from 'next/link';

export function PlatformFooter({ className = "" }: { className?: string }) {
  // Hide on mobile layouts globally by default unless an explicit display override is passed in className
  const hasDisplayOverride = className.includes("hidden") || className.includes("block") || className.includes("flex") || className.includes("grid");
  const displayClass = hasDisplayOverride ? "" : "hidden lg:block";

  return (
    <footer className={`${displayClass} w-full py-6 border-t bg-slate-50 border-slate-100 shrink-0 ${className}`}>
      <div className="max-w-[1440px] mx-auto px-6 flex flex-col items-center justify-center gap-3 text-center text-meta">
        <p className="text-slate-500">
          Tu experiencia en LUMINUS nos importa. ¿Tienes alguna duda o algo que podamos mejorar?{" "}
          <Link
            href="/contacto?motivo=comentarios"
            className="font-medium text-slate-700 underline underline-offset-4 decoration-slate-300 hover:text-slate-900 hover:decoration-slate-500 transition-colors"
          >
            Escríbenos
          </Link>
        </p>
        <span className="text-slate-400 uppercase tracking-wide">
          LUMINUS LATAM © 2026
        </span>
      </div>
    </footer>
  );
}

export default PlatformFooter;
