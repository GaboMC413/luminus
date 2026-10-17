"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MembershipChoiceView() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("monthly");

  const isAnnual = billingCycle === "annual";

  const handleSelectPlan = (plan: "membership" | "free") => {
    if (plan === "free") {
      router.push("/auth/crear-cuenta?plan=free");
    } else {
      router.push(`/auth/crear-cuenta?plan=membership&billing=${billingCycle}`);
    }
  };

  const benefits = [
    "Conecta con personas y especialistas.",
    "Descubre actividades de bienestar.",
    "Publica y comparte tus iniciativas.",
    "Accede a funcionalidades exclusivas.",
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between font-sans selection:bg-slate-200">
      {/* 0. Logo centered on the page */}
      <header className="w-full max-w-5xl mx-auto px-6 pt-8 pb-3 flex items-center justify-center">
        <Link href="/" className="inline-flex items-center">
          <img src="/logo-luminus-black.svg" alt="LUMINUS" className="h-[24px] w-auto" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-[430px] mx-auto px-4 pt-4 pb-8 flex flex-col items-center">
        {/* 1. Only one line title */}
        <h1 className="text-2xl sm:text-[26px] font-bold font-jakarta text-slate-900 tracking-tight text-center mb-5">
          Sé parte de una red de bienestar
        </h1>

        {/* Switch buttons: Mensual / Anual (equal size buttons) */}
        <div className="w-fit p-1 bg-zinc-100/90 rounded-xl flex items-center gap-1 border border-zinc-200/70 mb-6">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`w-32 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer border-none font-jakarta flex items-center justify-center ${
              !isAnnual
                ? "bg-white text-slate-900"
                : "bg-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`w-32 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer border-none font-jakarta flex items-center justify-center gap-1.5 ${
              isAnnual
                ? "bg-white text-slate-900"
                : "bg-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Anual</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full">
              -25%
            </span>
          </button>
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-8 flex flex-col">
          {/* Pricing Section */}
          <div className="flex items-baseline gap-2.5 flex-wrap mb-6">
            <span className="text-[38px] font-extrabold text-slate-900 font-jakarta tracking-tight leading-none">
              {isAnnual ? "USD 45" : "USD 5"}
            </span>
            <span className="text-sm sm:text-base font-medium text-slate-500">
              {isAnnual ? "/año" : "/mes"}
            </span>

            {isAnnual && (
              <span className="text-xs sm:text-sm font-semibold text-emerald-700">
                Ahorra USD 15
              </span>
            )}
          </div>

          {/* Lo que incluye tu membresía */}
          <div className="flex flex-col gap-3 mb-6">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-jakarta">
              Lo que incluye tu membresía
            </h3>
            <ul className="flex flex-col gap-3.5 p-0 m-0 list-none">
              {benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-800 leading-snug">
                  <svg
                    className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mission text directly on the card */}
          <p className="text-sm text-slate-900 font-medium leading-snug m-0 mb-6">
            Tu membresía nos permite desarrollar nuevas herramientas, ampliar la red y acercar el bienestar a cada vez más personas en Latinoamérica.
          </p>

          {/* Action buttons: Ser miembro over Unirme gratis por ahora */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleSelectPlan("membership")}
              className="w-full h-12 bg-black hover:bg-zinc-800 active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center font-jakarta"
            >
              {isAnnual ? "Ser miembro por USD 45/año" : "Ser miembro por USD 5/mes"}
            </button>
            <button
              type="button"
              onClick={() => handleSelectPlan("free")}
              className="w-full h-12 bg-zinc-100 hover:bg-zinc-200/80 active:scale-[0.99] text-slate-700 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center font-jakarta border border-zinc-200/60"
            >
              Unirme gratis por ahora
            </button>
          </div>

          {/* Legal Notice */}
          <p className="text-[11px] text-slate-400 text-center leading-relaxed mt-4 mb-0">
            Al registrarte aceptas nuestros{" "}
            <Link
              href="https://luminuslatam.com/legal/terminos"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-600"
            >
              Términos y Condiciones
            </Link>{" "}
            y{" "}
            <Link
              href="https://luminuslatam.com/legal/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-600"
            >
              Política de Privacidad
            </Link>
            .
          </p>
        </div>

        {/* Account Login Link below out of the card div */}
        <p className="mt-6 text-center text-xs sm:text-sm text-slate-500 font-medium">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/auth/iniciar-sesion"
            className="text-black font-semibold underline underline-offset-2 hover:text-slate-800"
          >
            Ingresa
          </Link>
        </p>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto px-6 py-6 flex items-center justify-center text-xs text-slate-400">
        <p className="m-0">© 2026 LUMINUS Latam.</p>
      </footer>
    </div>
  );
}
