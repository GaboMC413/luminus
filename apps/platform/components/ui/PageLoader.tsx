import React from "react";

export function PageLoader() {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[300px] select-none bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold font-sans animate-pulse">
          Cargando...
        </p>
      </div>
    </div>
  );
}
