"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SelectInput } from "@/components/ui/SelectInput";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle2,
  ArrowLeft,
  HouseHeart,
} from "lucide-react";

interface UserDisplay {
  name: string;
  email: string;
  phone?: string;
}

const MOTIVO_OPTIONS = [
  { value: "Espacios", label: "Espacios" },
  { value: "Especialistas", label: "Especialistas" },
  { value: "Eventos y actividades", label: "Eventos y actividades" },
  { value: "Cuenta o membresía", label: "Cuenta o membresía" },
  { value: "Propuesta o colaboración", label: "Propuesta o colaboración" },
  { value: "Otro motivo", label: "Otro motivo" },
];

function resolveInitialMotivo(param: string | null): string {
  if (!param) return "";
  const lower = param.toLowerCase();
  if (lower.startsWith("espacio")) return "Espacios";
  if (lower.startsWith("especialista")) return "Especialistas";
  if (lower.startsWith("evento") || lower.startsWith("actividad")) return "Eventos y actividades";
  if (lower.startsWith("cuenta") || lower.startsWith("membresia") || lower.startsWith("membresía")) return "Cuenta o membresía";
  if (lower.startsWith("propuesta") || lower.startsWith("colabora")) return "Propuesta o colaboración";
  return "";
}

export function ContactClientForm({ userDisplay }: { userDisplay: UserDisplay }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [motivo, setMotivo] = useState(() =>
    resolveInitialMotivo(searchParams.get("motivo"))
  );
  const [mensaje, setMensaje] = useState("");

  // Responder a selector
  const [canalRespuesta, setCanalRespuesta] = useState<"correo" | "telefono" | "otro">("correo");
  const [otroValor, setOtroValor] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const responderOptions = [
    {
      value: "correo",
      label: userDisplay.email ? `Correo (${userDisplay.email})` : "Correo electrónico",
    },
    {
      value: "telefono",
      label: userDisplay.phone ? `Teléfono (${userDisplay.phone})` : "Teléfono / WhatsApp",
    },
    {
      value: "otro",
      label: "Otro canal de contacto",
    },
  ];

  const getResolvedDestination = () => {
    if (canalRespuesta === "correo") {
      return userDisplay.email || "tu correo registrado";
    }
    if (canalRespuesta === "telefono") {
      return userDisplay.phone || otroValor || "tu teléfono";
    }
    return otroValor.trim() || userDisplay.email;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!motivo) {
      setErrorMessage("Por favor selecciona un motivo.");
      return;
    }

    if (!mensaje.trim()) {
      setErrorMessage("Por favor escribe tu mensaje antes de enviar.");
      return;
    }

    if (canalRespuesta === "otro" && !otroValor.trim()) {
      setErrorMessage("Por favor ingresa el correo o teléfono donde prefieres recibir la respuesta.");
      return;
    }

    if (canalRespuesta === "telefono" && !userDisplay.phone && !otroValor.trim()) {
      setErrorMessage("Por favor ingresa tu número de teléfono / WhatsApp.");
      return;
    }

    setIsSubmitting(true);

    const resolvedDestination = getResolvedDestination();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motivo,
          mensaje,
          responderA: {
            tipo: canalRespuesta,
            valor: resolvedDestination,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No pudimos enviar tu mensaje en este momento.");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al conectar con el servidor. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    const destination = getResolvedDestination();

    return (
      <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 flex flex-col items-center text-center shadow-xs animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-6">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-[11px] font-semibold tracking-widest text-emerald-600 font-jakarta uppercase mb-2">
          MENSAJE ENVIADO
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-jakarta text-slate-900 tracking-tight mb-3">
          ¡Gracias por comunicarte!
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-lg leading-relaxed mb-8">
          Hemos recibido tu mensaje correctamente{userDisplay.name ? `, ${userDisplay.name}` : ""}. Te
          responderemos a <strong className="text-slate-900 font-semibold">{destination}</strong> a la
          brevedad.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {motivo === "Espacios" ? (
            <Button
              variant="primary"
              onClick={() => router.push("/espacios")}
              className="flex items-center gap-2 h-11 px-6 rounded-xl"
            >
              <HouseHeart className="w-4 h-4" />
              <span>Volver a Espacios</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => router.push("/inicio")}
              className="flex items-center gap-2 h-11 px-6 rounded-xl"
            >
              <span>Ir a la Comunidad</span>
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => router.push("/inicio")}
            className="flex items-center gap-2 h-11 px-5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Inicio</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xs">
      <div className="flex flex-col items-start mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-jakarta text-slate-900 tracking-tight leading-tight">
          Conversemos
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 leading-normal max-w-lg">
          Escríbenos y te responderemos a la brevedad.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <SelectInput
          label="Motivo"
          value={motivo}
          options={MOTIVO_OPTIONS}
          onSelect={(val) => {
            setMotivo(val);
            if (errorMessage) setErrorMessage("");
          }}
          placeholder="Selecciona el motivo"
        />

        <TextAreaField
          id="mensaje"
          label="Mensaje"
          placeholder="¿En qué podemos ayudarte? Escribe aquí tu mensaje..."
          rows={4}
          value={mensaje}
          onChange={(e) => {
            setMensaje(e.target.value);
            if (errorMessage) setErrorMessage("");
          }}
          required
        />

        {/* Responder a Selector */}
        <div className="flex flex-col gap-2.5">
          <SelectInput
            label="Responder a"
            value={canalRespuesta}
            options={responderOptions}
            onSelect={(val) => {
              setCanalRespuesta(val as "correo" | "telefono" | "otro");
              if (errorMessage) setErrorMessage("");
            }}
          />

          {/* Conditional extra input if custom phone or other is selected */}
          {canalRespuesta === "telefono" && !userDisplay.phone && (
            <div className="animate-in fade-in duration-150">
              <InputField
                id="telefono-custom"
                label="Número de teléfono / WhatsApp"
                placeholder="+54 9 11 ... o tu número con código de país"
                value={otroValor}
                onChange={(e) => setOtroValor(e.target.value)}
                required
              />
            </div>
          )}

          {canalRespuesta === "otro" && (
            <div className="animate-in fade-in duration-150">
              <InputField
                id="otro-contacto"
                label="Indica dónde prefieres que te respondamos"
                placeholder="Ingresa otro correo electrónico o teléfono"
                value={otroValor}
                onChange={(e) => setOtroValor(e.target.value)}
                required
              />
            </div>
          )}
        </div>

        <div className="pt-1 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-6 rounded-xl border-none bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors cursor-pointer shadow-none"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Volver</span>
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full sm:w-auto h-11 px-7 rounded-xl flex items-center justify-center text-sm font-semibold"
          >
            {isSubmitting ? "Enviando mensaje..." : "Enviar mensaje"}
          </Button>
        </div>
      </form>
    </div>
  );
}
