"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BillingAddressInput, BillingAddressData } from "@/components/ui/BillingAddressInput";
import { Button } from "@/components/ui/Button";
import { CreditCard } from "lucide-react";

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
        router.push(`/unirme/crear-cuenta?plan=membership&billing=${interval === "year" ? "annual" : "monthly"}`);
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
        router.push("/unirme/perfil");
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
    <div className="min-h-screen bg-white flex flex-col justify-between font-sans selection:bg-slate-200">
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-8">
        <main className="w-full max-w-[380px] mx-auto flex flex-col items-center gap-6 animate-fade-in-up">
          {/* Title */}
          <h1 className="text-2xl sm:text-[26px] font-bold font-jakarta text-slate-900 tracking-tight text-center m-0 transition-all">
            {isSuccess ? "¡Membresía activada!" : "Activa tu membresía"}
          </h1>

          {/* Payment and Card Info OR Success Confirmation */}
          <div className="w-full flex flex-col gap-4">
            {/* Price & Plan Summary (Hidden on Success) */}
            {!isSuccess && (
              <div className="w-full bg-zinc-50/70 rounded-2xl border border-zinc-200/90 p-5 flex flex-col gap-3 animate-in fade-in duration-200">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 font-jakarta">
                      {isAnnual ? "Membresía Anual" : "Membresía Mensual"}
                    </span>
                    {isAnnual && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 font-jakarta">
                        Ahorras USD 15
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[30px] sm:text-[34px] font-extrabold text-slate-900 font-jakarta leading-none tracking-tight">
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

                  <p className="text-xs text-slate-500 leading-normal m-0">
                    Renovación automática. Cancela cuando quieras.
                  </p>
                </div>

                {/* Patreon-style Annual Toggle Switch (hidden if Step 1 selected annual) */}
                {!selectedAnnualInStep1 && (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isAnnual}
                    onClick={() => handleSwitchBilling(isAnnual ? "monthly" : "annual")}
                    className="w-fit inline-flex items-center gap-2.5 cursor-pointer bg-transparent border-none p-0 select-none group"
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
                )}
              </div>
            )}

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
                {/* Payment Form (placeholder-driven, no input labels) */}
                <form onSubmit={handlePay} className="flex flex-col gap-3">
                  {/* Cardholder Name */}
                  <input
                    type="text"
                    required
                    value={cardHolderName}
                    onChange={(e) => {
                      setCardHolderName(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Nombre en la tarjeta"
                    className="w-full h-12 px-4 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 font-sans"
                  />

                  {/* Card Number */}
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="Número de tarjeta"
                      className="w-full h-12 pl-4 pr-11 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 font-sans tabular-nums tracking-wider"
                    />
                    <CreditCard className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Expiry & CVC */}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      placeholder="Vencimiento (MM/AA)"
                      maxLength={5}
                      className="w-full h-12 px-4 text-sm text-left bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 font-sans tabular-nums tracking-wider"
                    />

                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={cardCvc}
                      onChange={(e) => handleCvcChange(e.target.value)}
                      placeholder="CVC / CVV"
                      maxLength={4}
                      className="w-full h-12 px-4 text-sm text-left bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 font-sans tabular-nums tracking-wider"
                    />
                  </div>

                  {/* Billing Address with Google Places Autocomplete */}
                  <BillingAddressInput
                    defaultValue={billingAddress}
                    placeholder="Dirección de facturación"
                    onAddressSelect={handleAddressSelected}
                  />

                  {/* City, Country & Postal Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      placeholder="Ciudad y País"
                      className="w-full h-12 px-4 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 font-sans"
                    />

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
                  >
                    {processing
                      ? "Procesando pago..."
                      : isAnnual
                      ? "Activar membresía — USD 45/año"
                      : "Activar membresía — USD 5/mes"}
                  </Button>
                </form>

                {/* Clean Security Branding with Stripe Wordmark */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <span>Pagos procesados de forma segura con</span>
                  <img
                    src="/Stripe_Logo,_revised_2016.svg"
                    alt="Stripe"
                    className="h-[15px] w-auto inline-block"
                  />
                </div>

                {/* Secondary Action: Cancelar */}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="py-1 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors text-center cursor-pointer bg-transparent border-none font-jakarta"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </main>
      </div>

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
      <footer className="w-full max-w-[380px] mx-auto px-4 py-6 flex flex-col items-center gap-3 text-center">
        <p className="text-xs text-slate-400 m-0">© 2026 LUMINUS Latam.</p>
      </footer>
    </div>
  );
}
