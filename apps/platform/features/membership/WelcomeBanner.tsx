"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface WelcomeBannerProps {
  userProfile?: {
    tier?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    country?: string;
  } | null;
}

export function WelcomeBanner({ userProfile }: WelcomeBannerProps) {
  const searchParams = useSearchParams();
  const hasWelcomeParam = searchParams.get("welcome") === "1";

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed before in localStorage
    const dismissed = localStorage.getItem("luminus_welcome_dismissed");
    if (hasWelcomeParam || !dismissed) {
      setVisible(true);
    }
  }, [hasWelcomeParam]);

  if (!visible) return null;

  const isPaidMember = userProfile?.tier === "MECENAS";
  const isProfileIncomplete = !userProfile?.city || !userProfile?.first_name;

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem("luminus_welcome_dismissed", "true");
    } catch {
      // Ignore localStorage error
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-zinc-200/90 p-5 mb-4 relative transition-all duration-200">
      {/* Dismiss Button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg bg-transparent border-none cursor-pointer transition-colors"
        title="Cerrar bienvenida"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pr-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 font-jakarta">
              {isPaidMember ? "Ya eres miembro de LUMINUS" : "Te damos la bienvenida a LUMINUS"}
            </h2>
            {isPaidMember && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-black text-white rounded-full">
                Miembro
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-normal">
            {isPaidMember
              ? "Gracias por ser parte e impulsar el crecimiento de la red."
              : "Explora la red y descubre lo que está pasando."}
          </p>
        </div>

        {isProfileIncomplete && (
          <Link
            href="/unirme/perfil"
            className="text-xs font-semibold text-slate-900 underline underline-offset-2 hover:text-black shrink-0 font-jakarta"
          >
            ¿Deseas completar tu perfil ahora?
          </Link>
        )}
      </div>
    </div>
  );
}
