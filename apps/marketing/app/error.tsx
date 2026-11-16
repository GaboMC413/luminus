"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MarketingErrorBoundary]", { digest: error.digest ?? null });
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-white">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900 mb-2">
          Algo salió mal
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          Ocurrió un problema inesperado al cargar esta página. Por favor, intenta nuevamente.
        </p>
        {error.digest ? (
          <p className="text-xs text-slate-400 mb-6 font-mono">
            Código de referencia: {error.digest}
          </p>
        ) : null}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
