"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  getCookieConsent,
  OPEN_COOKIE_SETTINGS_EVENT,
  setCookieConsent,
} from "@/lib/cookie-consent";

export function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    setMounted(true);
    const existing = getCookieConsent();
    if (!existing) {
      setShowBanner(true);
    } else {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }

    const handleOpenSettings = () => {
      const current = getCookieConsent();
      if (current) {
        setAnalytics(current.analytics);
        setMarketing(current.marketing);
      } else {
        setAnalytics(true);
        setMarketing(true);
      }
      setShowModal(true);
    };

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);
    return () => {
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);
    };
  }, []);

  const handleAcceptAll = () => {
    setCookieConsent({ analytics: true, marketing: true });
    setAnalytics(true);
    setMarketing(true);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleOnlyNecessary = () => {
    setCookieConsent({ analytics: false, marketing: false });
    setAnalytics(false);
    setMarketing(false);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSavePreferences = () => {
    setCookieConsent({ analytics, marketing });
    setShowBanner(false);
    setShowModal(false);
  };

  if (!mounted) return null;

  return (
    <>
      {showBanner && !showModal && (
        <aside
          aria-label="Preferencias de cookies"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-[420px] z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-5 text-slate-900"
        >
          <div className="flex flex-col gap-3">
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-slate-900">
                Cuidamos tu experiencia
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Usamos cookies para que LUMINUS funcione bien, recordar tus preferencias y entender cómo mejorar la plataforma.{" "}
                <a
                  href="https://luminuslatam.com/legal/cookies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 underline underline-offset-2 hover:text-slate-700 transition-colors"
                >
                  Política de cookies
                </a>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2 transition-colors py-1.5"
              >
                Personalizar
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleOnlyNecessary}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Solo necesarias
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Personalizar cookies"
        subtitle="Elige qué cookies deseas permitir. Puedes cambiar tu elección cuando quieras."
        maxWidth="480px"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleSavePreferences}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Guardar preferencias
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
            >
              Aceptar todas
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          {/* Necesarias */}
          <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-900">Necesarias</span>
                <span className="text-xs font-medium text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                  Siempre activas
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Para iniciar sesión, mantener tu cuenta segura y que el sitio funcione correctamente.
              </p>
            </div>
          </div>

          {/* Experiencia y mejoras */}
          <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-slate-200">
            <div className="space-y-0.5">
              <span id="cookie-analytics-label" className="text-sm font-medium text-slate-900">
                Experiencia y mejoras
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nos ayudan a entender qué funciona mejor para seguir mejorando la plataforma.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={analytics}
              aria-labelledby="cookie-analytics-label"
              onClick={() => setAnalytics((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                analytics ? "bg-slate-900" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                  analytics ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Novedades */}
          <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-slate-200">
            <div className="space-y-0.5">
              <span id="cookie-marketing-label" className="text-sm font-medium text-slate-900">
                Novedades
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nos permiten mostrarte contenido, actividades y eventos relevantes para ti.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={marketing}
              aria-labelledby="cookie-marketing-label"
              onClick={() => setMarketing((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                marketing ? "bg-slate-900" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                  marketing ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
