"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function MembershipPaymentView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const billing = searchParams.get("billing") === "annual" ? "annual" : "monthly";
  const isAnnual = billing === "annual";

  const [loadingIntent, setLoadingIntent] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<{
    clientSecret: string | null;
    subscriptionId: string;
    customerId: string;
    interval?: "month" | "year";
    isMock?: boolean;
  } | null>(null);

  // Card Inputs (Stripe Required Cardholder & Billing Data)
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardPostalCode, setCardPostalCode] = useState("");

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function initIntent() {
      try {
        const res = await fetch("/api/membership/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interval: isAnnual ? "year" : "month" }),
        });

        if (res.status === 401) {
          // If not authenticated, redirect to Screen 2
          router.push(`/auth/crear-cuenta?plan=membership&billing=${billing}`);
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
    }

    initIntent();
  }, [router, isAnnual, billing]);

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

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCard = cardNumber.replace(/\s+/g, "");
    if (!cardName.trim()) {
      setErrorMessage("Por favor ingresa el nombre como figura en la tarjeta.");
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
      setErrorMessage("Por favor ingresa tu código postal.");
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
          cardName: cardName.trim(),
          postalCode: cardPostalCode.trim(),
        }),
      });

      const confirmData = await confirmRes.json();

      if (!confirmRes.ok) {
        throw new Error(confirmData.message || "Tu tarjeta fue rechazada. Verifica los datos o intenta con otro método.");
      }

      // Success -> Advance to Screen 4 (Profile)
      router.push("/perfil/completar");
    } catch (err: any) {
      setErrorMessage(err.message || "Tu tarjeta fue rechazada. Verifica los datos o intenta con otro método.");
    } finally {
      setProcessing(false);
    }
  };

  const handleJoinFree = () => {
    // Escape hatch: user remains free tier and advances to Screen 4
    router.push("/perfil/completar");
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

        {/* Card */}
        <div className="w-full bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-8 flex flex-col gap-6">
          {/* Order Summary */}
          <div className="p-4 sm:p-5 bg-zinc-50/80 rounded-xl border border-zinc-200/70 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 font-jakarta">
                {isAnnual ? "Membresía Anual" : "Membresía Mensual"}
              </span>
              {isAnnual && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 font-jakarta">
                  Ahorras USD 15
                </span>
              )}
            </div>
            <div className="flex items-baseline">
              <span className="text-[32px] sm:text-[36px] font-extrabold text-slate-900 font-jakarta leading-none tracking-tight">
                {isAnnual ? "USD 45" : "USD 5"}
              </span>
              <span className="text-sm text-slate-500 font-medium ml-1.5">
                {isAnnual ? "/ año" : "/ mes"}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed m-0 pt-0.5">
              Renovación automática. Cancela cuando quieras.
            </p>
          </div>

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
                value={cardName}
                onChange={(e) => {
                  setCardName(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Nombre como aparece en la tarjeta"
                className="w-full h-12 px-4 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 font-sans"
              />
            </div>

            {/* Card Number */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 font-jakarta">
                  Número de tarjeta
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  Visa, Mastercard, Amex
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  placeholder="1234 1234 1234 1234"
                  className="w-full h-12 pl-4 pr-11 text-sm font-mono bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400"
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
                  className="w-full h-12 px-4 text-sm font-mono text-center bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400"
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
                  className="w-full h-12 px-4 text-sm font-mono text-center bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Postal Code */}
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
                placeholder="Código postal o ZIP"
                className="w-full h-12 px-4 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 font-sans"
              />
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

            {/* Secondary Escape Action */}
            <button
              type="button"
              onClick={handleJoinFree}
              className="w-full py-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors text-center cursor-pointer bg-transparent border-none"
            >
              Unirme gratis por ahora
            </button>
          </form>

          {/* Security & Guarantee Note */}
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <span className="material-symbols-outlined text-[15px] text-slate-400">
              lock
            </span>
            <span>Pago seguro encriptado de 256 bits</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto px-6 py-8 flex items-center justify-center text-xs text-slate-400">
        <p className="m-0">© 2026 LUMINUS Latam.</p>
      </footer>
    </div>
  );
}
