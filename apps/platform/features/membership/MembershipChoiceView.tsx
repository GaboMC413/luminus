"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function MembershipChoiceView() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("monthly");

  const isAnnual = billingCycle === "annual";

  const handleSelectPlan = (plan: "membership" | "free") => {
    if (plan === "free") {
      router.push("/unirme/crear-cuenta?plan=free");
    } else {
      router.push(`/unirme/crear-cuenta?plan=membership&billing=${billingCycle}`);
    }
  };

  const benefits = [
    "Conecta con personas y especialistas.",
    "Descubre actividades de bienestar.",
    "Publica y comparte tus iniciativas.",
    "Accede a funcionalidades exclusivas.",
  ];

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col justify-between font-sans selection:bg-slate-200">
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-10 pb-8 sm:py-12">
        <main className="w-full max-w-[380px] mx-auto flex flex-col items-center my-auto animate-fade-in-up">
          {/* Header unit with persistent brand anchor */}
          <header className="flex flex-col items-center text-center gap-2 mb-6 sm:mb-8">
            <Link href="/" className="inline-flex items-center mb-1">
              <img src="/iso-logo-black.svg" alt="LUMINUS" className="h-[36px] w-[36px]" />
            </Link>
            <h1 className="text-[22px] sm:text-[26px] font-bold font-jakarta text-slate-900 tracking-tight sm:whitespace-nowrap m-0">
              Sé parte de una red de bienestar
            </h1>
          </header>

          {/* Content Block: Switch + Card + Login Prompt */}
          <div className="w-full flex flex-col items-center gap-4">
            <button
              type="button"
              role="switch"
              aria-checked={isAnnual}
              onClick={() => setBillingCycle(isAnnual ? "monthly" : "annual")}
              className="inline-flex items-center gap-2.5 cursor-pointer bg-transparent border-none p-0 select-none group"
            >
              <span
                className={`w-[42px] h-[24px] rounded-full border p-[3px] flex items-center transition-colors duration-200 box-border ${
                  isAnnual
                    ? "bg-black border-black"
                    : "bg-white border-zinc-300 group-hover:border-zinc-400"
                }`}
              >
                <span
                  className={`w-[16px] h-[16px] rounded-full transition-transform duration-200 ${
                    isAnnual
                      ? "translate-x-[18px] bg-white"
                      : "translate-x-0 bg-zinc-400 group-hover:bg-zinc-500"
                  }`}
                />
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-600 font-jakarta">
                Paga anual y ahorra un 25%
              </span>
            </button>

            {/* Pricing Card Block */}
            <div className="w-full bg-white border border-zinc-200/90 rounded-2xl p-6 flex flex-col gap-4">
              {/* Block 1: Price */}
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-[34px] font-extrabold text-slate-900 font-jakarta tracking-tight leading-none">
                  {isAnnual ? "USD 45" : "USD 5"}
                </span>
                <span className="text-sm font-medium text-slate-500">
                  {isAnnual ? "/ año" : "/ mes"}
                </span>

                {isAnnual && (
                  <span className="ml-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                    Ahorra USD 15
                  </span>
                )}
              </div>

              {/* Block 2: Benefits & Mission */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-jakarta m-0">
                    Lo que incluye tu membresía
                  </h3>
                  <ul className="flex flex-col gap-1.5 p-0 m-0 list-none">
                    {benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-[13.5px] text-slate-700 leading-snug">
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

                <p className="text-xs sm:text-[13px] text-slate-500 leading-normal m-0">
                  Tu membresía nos permite desarrollar nuevas herramientas, ampliar la red y acercar el bienestar a cada vez más personas en Latinoamérica.
                </p>
              </div>

              {/* Block 3: Action Buttons (gap-3 matching all other screens) */}
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => handleSelectPlan("membership")}
                >
                  {isAnnual ? "Hacerme miembro por USD 45/año" : "Hacerme miembro por USD 5/mes"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleSelectPlan("free")}
                >
                  Unirme gratis por ahora
                </Button>
              </div>
            </div>

            {/* Account Login Link Block */}
            <p className="text-center text-xs sm:text-sm text-slate-500 font-medium m-0">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/iniciar-sesion"
                className="text-black font-semibold underline underline-offset-2 hover:text-slate-800"
              >
                Ingresa
              </Link>
            </p>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-[380px] mx-auto px-4 py-4 sm:py-6 flex flex-col items-center gap-2 text-center">
        <p className="text-[11px] text-slate-400 leading-relaxed m-0">
          Al unirte, estás creando una cuenta en LUMINUS y aceptando estar de acuerdo con nuestros{" "}
          <Link
            href="https://luminuslatam.com/legal/terminos"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-600"
          >
            Términos y Condiciones
          </Link>{" "}
          así como con nuestra{" "}
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
        <p className="text-xs text-slate-400 m-0">© 2026 LUMINUS Latam.</p>
      </footer>
    </div>
  );
}
