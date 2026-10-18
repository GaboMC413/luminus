"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar, Footer } from "@/components";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "resubscribed">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!email || !token) {
      setStatus("error");
      setErrorMessage("Enlace inválido o incompleto. Faltan los parámetros necesarios para confirmar tu desuscripción.");
      return;
    }

    let isMounted = true;

    async function executeUnsubscribe() {
      try {
        const res = await fetch(`/api/unsubscribe?email=${encodeURIComponent(email!)}&token=${encodeURIComponent(token!)}`);
        const data = await res.json();

        if (!isMounted) return;

        if (data.ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(data.error || "No pudimos procesar la desuscripción.");
        }
      } catch (err) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage("Ocurrió un problema de conexión. Por favor, intenta de nuevo más tarde.");
        }
      }
    }

    executeUnsubscribe();

    return () => {
      isMounted = false;
    };
  }, [email, token]);

  const handleResubscribe = async () => {
    if (!email || !token) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}&action=resubscribe`
      );
      const data = await res.json();
      if (data.ok) {
        setStatus("resubscribed");
      } else {
        alert(data.error || "Error al volver a suscribirse.");
      }
    } catch {
      alert("Error de conexión al re-suscribir.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm flex flex-col items-center text-center gap-6 my-12">
      {status === "loading" && (
        <>
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Procesando desuscripción...</h1>
          <p className="text-slate-600 text-sm">
            Guardando tus preferencias de correo. Por favor aguarda un segundo.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">Te has desuscrito exitosamente</h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              No recibirás más boletines informativos ni correos de novedades de LUMINUS en{" "}
              <strong className="text-slate-800 break-all">{email}</strong>.
            </p>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 flex flex-col gap-3">
            <p className="text-xs text-slate-600">
              ¿Te desuscribiste por equivocación?
            </p>
            <button
              onClick={handleResubscribe}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Procesando..." : "Volver a suscribirme"}
            </button>
            <Link
              href="/"
              className="text-xs text-slate-600 hover:text-slate-800 underline transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </>
      )}

      {status === "resubscribed" && (
        <>
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">¡Suscripción reactivada!</h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              Hemos reactivado tu suscripción para <strong className="text-slate-800 break-all">{email}</strong>. Seguirás recibiendo nuestros contenidos y novedades de bienestar.
            </p>
          </div>

          <div className="w-full pt-4 border-t border-slate-100">
            <Link
              href="/"
              className="inline-block py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Ir al inicio
            </Link>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">No pudimos procesar la solicitud</h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              {errorMessage}
            </p>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 flex flex-col gap-3">
            <Link
              href="/"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Ir al inicio
            </Link>
            <Link
              href="/contacto"
              className="text-xs text-slate-600 hover:text-slate-800 underline transition-colors"
            >
              Contactar a soporte
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function DesuscribirPage() {
  return (
    <main className="w-full min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />
      <div className="w-full pt-[80px] pb-12 flex-1 flex items-center justify-center px-4">
        <Suspense
          fallback={
            <div className="text-slate-500 text-sm py-12">Cargando...</div>
          }
        >
          <UnsubscribeContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
