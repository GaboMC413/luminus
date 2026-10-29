"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BillingAddressInput, BillingAddressData } from "@/components/ui/BillingAddressInput";
import { Button } from "@/components/ui/Button";
import { CreditCard } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const ELEMENT_STYLE = {
  base: {
    fontSize: "14px",
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, sans-serif",
    color: "#0f172a",
    letterSpacing: "0.025em",
    "::placeholder": {
      color: "#94a3b8",
    },
  },
  invalid: {
    color: "#dc2626",
  },
};

interface PaymentFormProps {
  billingCycle: "annual" | "monthly";
  subscriptionData: {
    clientSecret: string | null;
    subscriptionId: string;
    customerId: string;
    interval?: "month" | "year";
    isMock?: boolean;
  } | null;
  loadingIntent: boolean;
  isFromSettings: boolean;
  isOnboarded: boolean;
  onSwitchBilling: (newCycle: "annual" | "monthly") => void;
  selectedAnnualInStep1: boolean;
  defaultEmail: string;
  defaultCardHolderName: string;
  defaultCity: string;
  defaultCountry: string;
  isSuccess: boolean;
  setIsSuccess: (val: boolean) => void;
}

function PaymentForm({
  billingCycle,
  subscriptionData,
  loadingIntent,
  isFromSettings,
  isOnboarded,
  onSwitchBilling,
  selectedAnnualInStep1,
  defaultEmail,
  defaultCardHolderName,
  defaultCity,
  defaultCountry,
  isSuccess,
  setIsSuccess,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const isAnnual = billingCycle === "annual";

  // Form states
  const [cardHolderName, setCardHolderName] = useState(defaultCardHolderName);
  const [email, setEmail] = useState(defaultEmail);
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState(defaultCity);
  const [billingCountry, setBillingCountry] = useState(defaultCountry);
  const [billingCountryCode, setBillingCountryCode] = useState("");
  const [cardPostalCode, setCardPostalCode] = useState("");

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync defaults when profile finishes loading in parent
  useEffect(() => {
    if (defaultCardHolderName && !cardHolderName) setCardHolderName(defaultCardHolderName);
  }, [defaultCardHolderName, cardHolderName]);

  useEffect(() => {
    if (defaultEmail && !email) setEmail(defaultEmail);
  }, [defaultEmail, email]);

  useEffect(() => {
    if (defaultCity && !billingCity) setBillingCity(defaultCity);
  }, [defaultCity, billingCity]);

  useEffect(() => {
    if (defaultCountry && !billingCountry) setBillingCountry(defaultCountry);
  }, [defaultCountry, billingCountry]);

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

    if (!cardHolderName.trim()) {
      setErrorMessage("Por favor ingresa el nombre que figura en la tarjeta.");
      return;
    }

    if (!cardPostalCode.trim()) {
      setErrorMessage("Por favor ingresa tu código postal o selecciona tu dirección.");
      return;
    }

    if (!subscriptionData) {
      setErrorMessage("Inicializando la pasarela de pago. Intenta de nuevo en unos segundos.");
      return;
    }

    setProcessing(true);

    try {
      // 1. Confirm Payment on Stripe Client if live Stripe is active
      if (stripe && elements && subscriptionData.clientSecret && !subscriptionData.isMock) {
        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) {
          throw new Error("No se pudo cargar el campo de tarjeta de crédito.");
        }

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          subscriptionData.clientSecret,
          {
            payment_method: {
              card: cardNumberElement,
              billing_details: {
                name: cardHolderName.trim(),
                email: email.trim() || undefined,
                address: {
                  line1: billingAddress.trim() || undefined,
                  city: billingCity.trim() || undefined,
                  country: billingCountryCode || undefined,
                  postal_code: cardPostalCode.trim() || undefined,
                },
              },
            },
          }
        );

        if (stripeError) {
          throw new Error(stripeError.message || "Tu tarjeta fue rechazada. Verifica los datos o intenta con otro método.");
        }

        if (paymentIntent && paymentIntent.status !== "succeeded") {
          throw new Error("El pago no pudo completarse. Por favor intenta con otra tarjeta.");
        }
      }

      // 2. Notify Backend to verify Stripe subscription & activate tier
      const confirmRes = await fetch("/api/membership/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: subscriptionData.subscriptionId,
          customerId: subscriptionData.customerId,
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

      // Persist in localStorage for pre-fill in Step 4
      if (typeof window !== "undefined") {
        localStorage.setItem("luminus_card_name", cardHolderName.trim());
        if (billingCity) localStorage.setItem("luminus_billing_city", billingCity.trim());
        if (billingCountry) localStorage.setItem("luminus_billing_country", billingCountry.trim());
        if (billingCountryCode) localStorage.setItem("luminus_billing_country_code", billingCountryCode.trim());
      }

      // Success -> Show animation, then advance to appropriate view
      setIsSuccess(true);
      setTimeout(() => {
        if (isFromSettings || isOnboarded) {
          router.push("/perfil-usuario/configuracion?tab=membership&success=1");
        } else {
          router.push("/unirme/perfil");
        }
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || "Tu tarjeta fue rechazada. Verifica los datos o intenta con otro método.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    if (isFromSettings) {
      router.push("/perfil-usuario/configuracion?tab=membership");
    } else {
      router.push("/unirme");
    }
  };

  const handleResetSession = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      if (typeof window !== "undefined") {
        localStorage.removeItem("luminus_card_name");
        localStorage.removeItem("luminus_profile_firstName");
        localStorage.removeItem("luminus_profile_lastName");
        localStorage.removeItem("luminus_user_email");
        localStorage.removeItem("luminus_billing_city");
        localStorage.removeItem("luminus_billing_country");
        localStorage.removeItem("luminus_billing_country_code");
      }
    } finally {
      window.location.href = "/unirme";
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Price & Plan Summary (Hidden on Success) */}
      {!isSuccess && (
        <div className="w-full bg-zinc-50/70 rounded-2xl border border-zinc-200/90 p-5 flex flex-col gap-3 animate-in fade-in duration-200">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 font-jakarta">
                {isAnnual ? "Mecenas Anual" : "Mecenas Mensual"}
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
              onClick={() => onSwitchBilling(isAnnual ? "monthly" : "annual")}
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
                Plan anual con 25% de descuento
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
            Pago confirmado
          </h3>

          {/* Subtitle */}
          <p className="text-sm text-slate-500 max-w-[290px] leading-relaxed mb-6 font-sans">
            Tu membresía ya está activa.
          </p>

          {/* Minimalist Progress Indicator */}
          <div className="w-40 h-1 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-900 rounded-full animate-progress-fill" />
          </div>
        </div>
      ) : (
        <>
          {/* Payment Form with Stripe Split Elements */}
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

            {/* Email field */}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="Correo electrónico para comprobantes"
              className="w-full h-12 px-4 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 font-sans"
            />

            {/* Card Number - Stripe Element */}
            <div className="relative w-full h-12 px-4 bg-white border border-zinc-200/90 rounded-xl focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 transition-colors flex items-center">
              <div className="w-full pr-8">
                <CardNumberElement
                  options={{
                    style: ELEMENT_STYLE,
                    placeholder: "Número de tarjeta",
                  }}
                  onChange={(e) => {
                    if (e.error) setErrorMessage(e.error.message);
                    else setErrorMessage(null);
                  }}
                />
              </div>
              <CreditCard className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Expiry & CVC - Stripe Elements */}
            <div className="grid grid-cols-2 gap-3">
              <div className="w-full h-12 px-4 bg-white border border-zinc-200/90 rounded-xl focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 transition-colors flex items-center">
                <div className="w-full">
                  <CardExpiryElement
                    options={{
                      style: ELEMENT_STYLE,
                      placeholder: "Vencimiento (MM/AA)",
                    }}
                    onChange={(e) => {
                      if (e.error) setErrorMessage(e.error.message);
                      else setErrorMessage(null);
                    }}
                  />
                </div>
              </div>

              <div className="w-full h-12 px-4 bg-white border border-zinc-200/90 rounded-xl focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 transition-colors flex items-center">
                <div className="w-full">
                  <CardCvcElement
                    options={{
                      style: ELEMENT_STYLE,
                      placeholder: "CVC / CVV",
                    }}
                    onChange={(e) => {
                      if (e.error) setErrorMessage(e.error.message);
                      else setErrorMessage(null);
                    }}
                  />
                </div>
              </div>
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
                ? "Ser Mecenas por USD 45/año"
                : "Ser Mecenas por USD 5/mes"}
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

          {/* Secondary Actions: Cambiar plan / Reiniciar */}
          <div className="flex flex-col items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleCancel}
              className="py-1 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors text-center cursor-pointer bg-transparent border-none font-jakarta"
            >
              {isFromSettings ? "← Volver a ajustes de membresía" : "← Cambiar plan"}
            </button>
            {!isFromSettings && (
              <button
                type="button"
                onClick={handleResetSession}
                className="py-1 text-[11px] sm:text-xs text-slate-400 hover:text-red-500 transition-colors text-center cursor-pointer bg-transparent border-none font-sans"
              >
                Cerrar sesión y empezar de nuevo
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function MembershipPaymentView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read params
  const initialBillingParam = searchParams.get("billing") === "annual" ? "annual" : "monthly";
  const selectedAnnualInStep1 = initialBillingParam === "annual";
  const isFromSettings = searchParams.get("from") === "settings";

  // Reactive billing interval state
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">(initialBillingParam);
  const isAnnual = billingCycle === "annual";

  const [loadingIntent, setLoadingIntent] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<{
    clientSecret: string | null;
    subscriptionId: string;
    customerId: string;
    interval?: "month" | "year";
    isMock?: boolean;
  } | null>(null);

  // User Profile Prefills
  const [defaultCardHolderName, setDefaultCardHolderName] = useState(() => {
    if (typeof window !== "undefined") {
      const first = localStorage.getItem("luminus_profile_firstName") || "";
      const last = localStorage.getItem("luminus_profile_lastName") || "";
      return [first, last].filter(Boolean).join(" ");
    }
    return "";
  });
  const [defaultEmail, setDefaultEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("luminus_user_email") || "";
    }
    return "";
  });
  const [defaultCity, setDefaultCity] = useState("");
  const [defaultCountry, setDefaultCountry] = useState("");

  // Initialize Payment Intent with chosen interval (or update existing)
  const initIntent = useCallback(async (interval: "month" | "year", existingSubId?: string) => {
    setLoadingIntent(true);
    try {
      const res = await fetch("/api/membership/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval, existingSubscriptionId: existingSubId }),
      });

      if (res.status === 401) {
        router.push(`/unirme/crear-cuenta?plan=membership&billing=${interval === "year" ? "annual" : "monthly"}`);
        return;
      }

      const data = await res.json();
      if (data.alreadySubscribed) {
        if (isFromSettings) {
          router.push("/perfil-usuario/configuracion?tab=membership");
        } else {
          router.push("/comunidad?welcome=1");
        }
        return;
      }

      setSubscriptionData(data);
    } catch {
      // Non-critical background failure
    } finally {
      setLoadingIntent(false);
    }
  }, [router, isFromSettings]);

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
          if (data?.email) {
            setDefaultEmail(data.email);
            localStorage.setItem("luminus_user_email", data.email);
          }
          const p = data?.profile;
          if (p) {
            const userFullName = [p.first_name, p.last_name].filter(Boolean).join(" ");
            if (userFullName) setDefaultCardHolderName(userFullName);
            if (p.city) setDefaultCity(p.city);
            if (p.country) setDefaultCountry(p.country);
            if (p.isOnboarded) setIsOnboarded(true);
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
    initIntent(newCycle === "annual" ? "year" : "month", subscriptionData?.subscriptionId);
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col justify-between font-sans selection:bg-slate-200">
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-10 pb-8 sm:py-12">
        <main className="w-full max-w-[380px] mx-auto flex flex-col items-center my-auto animate-fade-in-up">
          {/* Header unit - hidden upon payment confirmation */}
          {!isSuccess && (
            <header className="flex flex-col items-center text-center gap-2 mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-[26px] font-bold font-jakarta text-slate-900 tracking-tight m-0 transition-all">
                Conviértete en Mecenas
              </h1>
            </header>
          )}

          <Elements stripe={stripePromise}>
            <PaymentForm
              billingCycle={billingCycle}
              subscriptionData={subscriptionData}
              loadingIntent={loadingIntent}
              isFromSettings={isFromSettings}
              isOnboarded={isOnboarded}
              onSwitchBilling={handleSwitchBilling}
              selectedAnnualInStep1={selectedAnnualInStep1}
              defaultEmail={defaultEmail}
              defaultCardHolderName={defaultCardHolderName}
              defaultCity={defaultCity}
              defaultCountry={defaultCountry}
              isSuccess={isSuccess}
              setIsSuccess={setIsSuccess}
            />
          </Elements>
        </main>
      </div>

      {/* Footer copyright */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 font-sans border-t border-slate-100">
        © {new Date().getFullYear()} LUMINUS. Todos los derechos reservados.
      </footer>
    </div>
  );
}
