"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BillingAddressInput, BillingAddressData } from "@/components/ui/BillingAddressInput";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";


export default function MembershipPaymentView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial billing choice from Step 1
  const initialBillingParam = searchParams.get("billing") === "annual" ? "annual" : "monthly";
  const selectedAnnualInStep1 = initialBillingParam === "annual";

  // Reactive billing interval state
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">(initialBillingParam);
  const isAnnual = billingCycle === "annual";

  const [loadingIntent, setLoadingIntent] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<{
    clientSecret: string | null;
    subscriptionId: string;
    customerId: string;
    interval?: "month" | "year";
    isMock?: boolean;
  } | null>(null);

  // Card Inputs
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Billing Address & Autocomplete Inputs
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingCountry, setBillingCountry] = useState("");
  const [billingCountryCode, setBillingCountryCode] = useState("");
  const [cardPostalCode, setCardPostalCode] = useState("");

  const [processing, setProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize Payment Intent with chosen interval
  const initIntent = useCallback(async (interval: "month" | "year") => {
    setLoadingIntent(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/membership/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });

      if (res.status === 401) {
        router.push(`/auth/crear-cuenta?plan=membership&billing=${interval === "year" ? "annual" : "monthly"}`);
        return;
      }

      const data = await res.json();
      if (data.alreadySubscribed) {
        router.push("/comunidad?welcome=1");
        return;
      }

      setSubscriptionData(data);
    } catch {
      setErrorMessage("No pudimos inicializar la pasarela de pago. Intenta recargar la página.");
    } finally {
      setLoadingIntent(false);
    }
  }, [router]);

  useEffect(() => {
    initIntent(isAnnual ? "year" : "month");
  }, [initIntent, isAnnual]);

  // Prefill initial user profile details if available
  useEffect(() => {
    async function fetchProfileData() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          const p = data?.profile;
          if (p) {
            const userFullName = [p.first_name, p.last_name].filter(Boolean).join(" ");
            if (userFullName && !cardHolderName) setCardHolderName(userFullName);
            if (p.city && !billingCity) setBillingCity(p.city);
            if (p.country && !billingCountry) setBillingCountry(p.country);
          }
        }
      } catch {
        // Non-critical background prefill failure
      }
    }
    fetchProfileData();
  }, []);

  const handleSwitchBilling = (newCycle: "annual" | "monthly") => {
    setBillingCycle(newCycle);
    initIntent(newCycle === "annual" ? "year" : "month");
  };

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
    setErrorMessage(null);
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
    setErrorMessage(null);
  };

  const handleCvcChange = (val: string) => {
    setCardCvc(val.replace(/\D/g, "").slice(0, 4));
    setErrorMessage(null);
  };

  const handleAddressSelected = (data: BillingAddressData) => {
    setBillingAddress(data.address);
    if (data.city) setBillingCity(data.city);
    if (data.country) setBillingCountry(data.country);
    if (data.countryCode) setBillingCountryCode(data.countryCode);
    if (data.postalCode) setCardPostalCode(data.postalCode);
    setErrorMessage(null);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCard = cardNumber.replace(/\s+/g, "");
    if (!cardHolderName.trim()) {
      setErrorMessage("Por favor ingresa el nombre que figura en la tarjeta.");
      return;
    }
    if (cleanCard.length < 15) {
      setErrorMessage("Por favor ingresa un número de tarjeta válido.");
      return;
    }
    if (!cardExpiry || cardExpiry.length < 5) {
      setErrorMessage("Por favor ingresa una fecha de vencimiento válida (MM/AA).");
      return;
    }
    if (!cardCvc || cardCvc.length < 3) {
      setErrorMessage("Por favor ingresa el código CVC de seguridad.");
      return;
    }
    if (!cardPostalCode.trim()) {
      setErrorMessage("Por favor ingresa tu código postal o selecciona tu dirección.");
      return;
    }

    setProcessing(true);

    try {
      const confirmRes = await fetch("/api/membership/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: subscriptionData?.subscriptionId,
          customerId: subscriptionData?.customerId,
          billingInterval: billingCycle,
          cardName: cardHolderName.trim(),
          postalCode: cardPostalCode.trim(),
          address: billingAddress.trim(),
          city: billingCity.trim(),
          country: billingCountry.trim(),
        }),
      });

      const confirmData = await confirmRes.json();

      if (!confirmRes.ok) {
        throw new Error(confirmData.message || "Tu tarjeta fue rechazada. Verifica los datos o intenta con otro método.");
      }

      // Persist in localStorage for instant pre-fill in Step 4
      if (typeof window !== "undefined") {
        localStorage.setItem("luminus_card_name", cardHolderName.trim());
        if (billingCity) localStorage.setItem("luminus_billing_city", billingCity.trim());
        if (billingCountry) localStorage.setItem("luminus_billing_country", billingCountry.trim());
        if (billingCountryCode) localStorage.setItem("luminus_billing_country_code", billingCountryCode.trim());
      }

      // Success -> Show animation, then advance to Screen 4 (Profile Onboarding)
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/perfil/completar");
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || "Tu tarjeta fue rechazada. Verifica los datos o intenta con otro método.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    router.push("/unirme");
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between font-sans selection:bg-slate-200">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-6 pt-8 pb-3 flex items-center justify-center">
        <Link href="/" className="inline-flex items-center">
          <img src="/logo-luminus-black.svg" alt="LUMINUS" className="h-[24px] w-auto" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-[430px] mx-auto px-4 pt-4 pb-8 flex flex-col items-center">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-[26px] font-bold font-jakarta text-slate-900 tracking-tight transition-all">
            {isSuccess ? "¡Membresía activada!" : "Activa tu membresía"}
          </h1>
        </div>

        {/* Card 1: Price & Plan Summary (Hidden on Success) */}
        {!isSuccess && (
          <div className="w-full bg-white rounded-2xl border border-zinc-200/90 p-6 flex flex-col gap-4 mb-3.5 animate-in fade-in duration-200">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900 font-jakarta">
                  {isAnnual ? "Membresía Anual" : "Membresía Mensual"}
                </span>
                {isAnnual && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 font-jakarta">
                    Ahorras USD 15
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1.5 pt-0.5">
                <span className="text-[32px] sm:text-[36px] font-extrabold text-slate-900 font-jakarta leading-none tracking-tight">
                  {isAnnual ? "USD 45" : "USD 5"}
                </span>
                <span className="text-sm text-slate-500 font-medium">
                  {isAnnual ? "/ año" : "/ mes"}
                </span>
                {isAnnual && (
                  <span className="text-xs text-slate-400 font-normal ml-1">
                    (USD 3.75/mes)
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 leading-relaxed m-0 pt-0.5">
                Renovación automática. Cancela cuando quieras.
              </p>
            </div>

            {/* Switch buttons: Mensual / Anual at bottom (same component as Step 1, hidden if Step 1 selected annual) */}
            {!selectedAnnualInStep1 && (
              <div className="w-full p-1 bg-zinc-100/90 rounded-xl flex items-center gap-1 border border-zinc-200/70 mt-1">
                <button
                  type="button"
                  onClick={() => handleSwitchBilling("monthly")}
                  className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer border-none font-jakarta flex items-center justify-center ${!isAnnual
                      ? "bg-white text-slate-900"
                      : "bg-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                  Mensual
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchBilling("annual")}
                  className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer border-none font-jakarta flex items-center justify-center gap-1.5 ${isAnnual
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
            )}
          </div>
        )}

        {/* Card 2: Payment and Card Info OR Success Confirmation */}
        <div className="w-full bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-7 flex flex-col gap-4">
          {isSuccess ? (
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300 w-full">
              {/* Animated Checkmark Badge */}
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center mb-5 relative">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    className="animate-draw-check"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {/* Subtle soft pulse ping */}
                <span className="absolute inset-0 rounded-full border border-emerald-400/30 animate-ping opacity-25 pointer-events-none" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold font-jakarta text-slate-900 tracking-tight mb-2">
                ¡Pago confirmado!
              </h3>

              {/* Subtitle */}
              <p className="text-sm text-slate-500 max-w-[290px] leading-relaxed mb-6 font-sans">
                Tu membresía {isAnnual ? "anual" : "mensual"} ya está activa.
              </p>

              {/* Minimalist Progress Indicator */}
              <div className="w-40 h-1 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 rounded-full animate-progress-fill" />
              </div>
            </div>
          ) : (
            <>
              {/* Payment Form */}
              <form onSubmit={handlePay} className="flex flex-col gap-4">
                {/* Cardholder Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 font-jakarta">
                    Nombre en la tarjeta
                  </label>
                  <input
                    type="text"
                    required
                    value={cardHolderName}
                    onChange={(e) => {
                      setCardHolderName(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Nombre como figura en la tarjeta"
                    className="w-full h-12 px-4 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 font-sans"
                  />
                </div>

                {/* Card Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 font-jakarta">
                    Número de tarjeta
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="1234 1234 1234 1234"
                      className="w-full h-12 pl-4 pr-11 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 font-sans tabular-nums tracking-wider"
                    />
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                      credit_card
                    </span>
                  </div>
                </div>

                {/* Expiry & CVC */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 font-jakarta">
                      Vencimiento (MM/AA)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full h-12 px-4 text-sm text-left bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 font-sans tabular-nums tracking-wider"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 font-jakarta">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={cardCvc}
                      onChange={(e) => handleCvcChange(e.target.value)}
                      placeholder="CVC"
                      maxLength={4}
                      className="w-full h-12 px-4 text-sm text-left bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 font-sans tabular-nums tracking-wider"
                    />
                  </div>
                </div>

                {/* Billing Address with Google Places Autocomplete */}
                <BillingAddressInput
                  defaultValue={billingAddress}
                  onAddressSelect={handleAddressSelected}
                />

                {/* City, Country & Postal Code (Prefilled from Address Autocomplete) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 font-jakarta">
                      Ciudad y País
                    </label>
                    <input
                      type="text"
                      value={
                        billingCity && billingCountry
                          ? `${billingCity}, ${billingCountry}`
                          : billingCity || billingCountry || ""
                      }
                      onChange={(e) => {
                        const parts = e.target.value.split(",").map((s) => s.trim());
                        setBillingCity(parts[0] || "");
                        setBillingCountry(parts[1] || "");
                      }}
                      placeholder="Ciudad, País"
                      className="w-full h-12 px-4 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 font-jakarta">
                      Código postal
                    </label>
                    <input
                      type="text"
                      required
                      value={cardPostalCode}
                      onChange={(e) => {
                        setCardPostalCode(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="Código postal"
                      className="w-full h-12 px-4 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 font-sans tabular-nums"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                    {errorMessage}
                  </div>
                )}

                {/* Primary Action Button */}
                <Button
                  type="submit"
                  variant="primary"
                  disabled={processing || loadingIntent}
                  className="mt-2"
                >
                  {processing
                    ? "Procesando pago..."
                    : isAnnual
                      ? "Activar membresía — USD 45/año"
                      : "Activar membresía — USD 5/mes"}
                </Button>
              </form>

              {/* Clean Security Branding with Stripe Wordmark (No divider bar, no lock) */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-1">
                <span>Pagos procesados de forma segura con</span>
                <img
                  src="/Stripe_Logo,_revised_2016.svg"
                  alt="Stripe"
                  className="h-[15px] w-auto inline-block"
                />
              </div>
            </>
          )}
        </div>

        {/* Secondary Action: Cancelar (outside of the card, hidden on success) */}
        {!isSuccess && (
          <button
            type="button"
            onClick={handleCancel}
            className="mt-4 py-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors text-center cursor-pointer bg-transparent border-none font-jakarta"
          >
            Cancelar
          </button>
        )}
      </main>

      {/* Embedded CSS Micro-animations */}
      <style>{`
        @keyframes drawCheck {
          0% {
            stroke-dashoffset: 24;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes progressBar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-draw-check {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: drawCheck 0.45s 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-progress-fill {
          animation: progressBar 1.8s ease-in-out forwards;
        }
      `}</style>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto px-6 py-8 flex items-center justify-center text-xs text-slate-400">
        <p className="m-0">© 2026 LUMINUS Latam.</p>
      </footer>
    </div>
  );
}
