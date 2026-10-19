"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BillingAddressInput, BillingAddressData } from "@/components/ui/BillingAddressInput";


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
  const [cardFirstName, setCardFirstName] = useState("");
  const [cardLastName, setCardLastName] = useState("");
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
            if (p.first_name && !cardFirstName) setCardFirstName(p.first_name);
            if (p.last_name && !cardLastName) setCardLastName(p.last_name);
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
    if (!cardFirstName.trim()) {
      setErrorMessage("Por favor ingresa tu nombre.");
      return;
    }
    if (!cardLastName.trim()) {
      setErrorMessage("Por favor ingresa tu apellido.");
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
      const fullName = `${cardFirstName.trim()} ${cardLastName.trim()}`;
      const confirmRes = await fetch("/api/membership/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: subscriptionData?.subscriptionId,
          customerId: subscriptionData?.customerId,
          billingInterval: billingCycle,
          firstName: cardFirstName.trim(),
          lastName: cardLastName.trim(),
          cardName: fullName,
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
        localStorage.setItem("luminus_first_name", cardFirstName.trim());
        localStorage.setItem("luminus_last_name", cardLastName.trim());
        localStorage.setItem("luminus_card_name", fullName);
        if (billingCity) localStorage.setItem("luminus_billing_city", billingCity.trim());
        if (billingCountry) localStorage.setItem("luminus_billing_country", billingCountry.trim());
        if (billingCountryCode) localStorage.setItem("luminus_billing_country_code", billingCountryCode.trim());
      }

      // Success -> Advance to Screen 4 (Profile Onboarding)
      router.push("/perfil/completar");
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
          <h1 className="text-2xl sm:text-[26px] font-bold font-jakarta text-slate-900 tracking-tight">
            Activa tu membresía
          </h1>
        </div>

        {/* Card 1: Price & Plan Summary */}
        <div className="w-full bg-white rounded-2xl border border-zinc-200/90 p-6 flex flex-col gap-4 mb-3.5">
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
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer border-none font-jakarta flex items-center justify-center ${
                  !isAnnual
                    ? "bg-white text-slate-900"
                    : "bg-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Mensual
              </button>
              <button
                type="button"
                onClick={() => handleSwitchBilling("annual")}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer border-none font-jakarta flex items-center justify-center gap-1.5 ${
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
          )}
        </div>

        {/* Card 2: Payment and Card Info */}
        <div className="w-full bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-7 flex flex-col gap-4">
          {/* Payment Form */}
          <form onSubmit={handlePay} className="flex flex-col gap-4">
            {/* Names: Nombre & Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 font-jakarta">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={cardFirstName}
                  onChange={(e) => {
                    setCardFirstName(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Tu nombre"
                  className="w-full h-12 px-4 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 font-jakarta">
                  Apellido
                </label>
                <input
                  type="text"
                  required
                  value={cardLastName}
                  onChange={(e) => {
                    setCardLastName(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Tu apellido"
                  className="w-full h-12 px-4 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal font-sans"
                />
              </div>
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
                  className={`w-full h-12 pl-4 pr-11 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal ${
                    cardNumber ? "font-mono" : "font-sans"
                  }`}
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
                  className={`w-full h-12 px-4 text-sm text-left bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal ${
                    cardExpiry ? "font-mono" : "font-sans"
                  }`}
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
                  placeholder="123"
                  maxLength={4}
                  className={`w-full h-12 px-4 text-sm text-left bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal ${
                    cardCvc ? "font-mono" : "font-sans"
                  }`}
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
                  className="w-full h-12 px-4 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 font-jakarta">
                  Código postal / ZIP
                </label>
                <input
                  type="text"
                  required
                  value={cardPostalCode}
                  onChange={(e) => {
                    setCardPostalCode(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Código postal o ZIP"
                  className="w-full h-12 px-4 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal font-sans"
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
            <button
              type="submit"
              disabled={processing || loadingIntent}
              className="w-full h-12 mt-2 bg-black hover:bg-zinc-800 active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center font-jakarta disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing
                ? "Procesando pago..."
                : isAnnual
                ? "Activar membresía — USD 45/año"
                : "Activar membresía — USD 5/mes"}
            </button>
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
        </div>

        {/* Secondary Action: Cancelar (outside of the card) */}
        <button
          type="button"
          onClick={handleCancel}
          className="mt-4 py-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors text-center cursor-pointer bg-transparent border-none font-jakarta"
        >
          Cancelar
        </button>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto px-6 py-8 flex items-center justify-center text-xs text-slate-400">
        <p className="m-0">© 2026 LUMINUS Latam.</p>
      </footer>
    </div>
  );
}
