"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { CreditCard, Lock } from "lucide-react";

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

interface AddCardFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddCardForm({ onClose, onSuccess }: AddCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [loadingIntent, setLoadingIntent] = useState(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cardHolderName, setCardHolderName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSetupIntent() {
      try {
        const res = await fetch("/api/membership/setup-intent", { method: "POST" });
        const data = await res.json();
        if (res.ok && data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setErrorMessage(data.message || "No se pudo inicializar la pasarela de pago.");
        }
      } catch {
        setErrorMessage("Error de conexión al cargar la pasarela de pagos.");
      } finally {
        setLoadingIntent(false);
      }
    }
    fetchSetupIntent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!cardHolderName.trim()) {
      setErrorMessage("Por favor ingresa el nombre que figura en la tarjeta.");
      return;
    }

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setErrorMessage("Error al cargar el campo de la tarjeta.");
      return;
    }

    setSubmitting(true);
    try {
      const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: cardHolderName.trim(),
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message || "No se pudo guardar la tarjeta.");
      }

      const pmId = typeof setupIntent?.payment_method === "string"
        ? setupIntent.payment_method
        : setupIntent?.payment_method?.id;

      if (pmId) {
        // Set newly added payment method as default
        await fetch("/api/membership/payment-methods", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentMethodId: pmId }),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "No se pudo agregar la tarjeta. Intenta con otra.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingIntent) {
    return (
      <div className="flex flex-col gap-3 animate-pulse py-1">
        <div className="w-full h-12 bg-slate-100 rounded-xl" />
        <div className="w-full h-12 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="w-full h-12 bg-slate-100 rounded-xl" />
          <div className="w-full h-12 bg-slate-100 rounded-xl" />
        </div>
        <div className="w-36 h-3 bg-slate-100 rounded mt-1" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {errorMessage && (
        <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl">
          {errorMessage}
        </div>
      )}

      {/* Cardholder Name */}
      <InputField
        label="Nombre en la tarjeta"
        type="text"
        required
        value={cardHolderName}
        onChange={(e) => {
          setCardHolderName(e.target.value);
          setErrorMessage(null);
        }}
        placeholder="Tal como figura en la tarjeta"
      />

      {/* Card Details Block */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none">
          Datos de la tarjeta
        </label>
        {/* Card Number */}
        <div className="relative w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-colors flex items-center">
          <div className="w-full pr-8">
            <CardNumberElement
              options={{
                style: ELEMENT_STYLE,
                placeholder: "Número de tarjeta",
              }}
              onChange={() => setErrorMessage(null)}
            />
          </div>
          <CreditCard className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Expiry & CVC */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-colors flex items-center">
            <div className="w-full">
              <CardExpiryElement
                options={{
                  style: ELEMENT_STYLE,
                  placeholder: "MM / AA",
                }}
                onChange={() => setErrorMessage(null)}
              />
            </div>
          </div>

          <div className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-colors flex items-center">
            <div className="w-full">
              <CardCvcElement
                options={{
                  style: ELEMENT_STYLE,
                  placeholder: "CVC / CVV",
                }}
                onChange={() => setErrorMessage(null)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 pt-0.5 text-xs text-slate-500 font-medium">
        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Datos asegurados con Stripe</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onClose}
          disabled={submitting}
          className="w-auto"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={submitting}
          className="w-auto"
        >
          {submitting ? "Guardando..." : "Guardar tarjeta"}
        </Button>
      </div>
    </form>
  );
}

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPaymentMethodModal({ isOpen, onClose, onSuccess }: AddPaymentMethodModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar método de pago"
      maxWidth="460px"
    >
      <Elements stripe={stripePromise}>
        <AddCardForm onClose={onClose} onSuccess={onSuccess} />
      </Elements>
    </Modal>
  );
}
