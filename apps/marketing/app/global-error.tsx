"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MarketingGlobalError]", { digest: error.digest ?? null });
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-screen flex items-center justify-center px-4 py-12 bg-white text-slate-900 font-sans antialiased">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">
            No pudimos cargar la página
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            Ocurrió un error inesperado. Por favor, intenta recargar la página.
          </p>
          {error.digest ? (
            <p className="text-xs text-slate-400 mb-6 font-mono">
              Código de referencia: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
