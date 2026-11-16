"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Cloud, Sparkles, Sun, Sunrise } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Skeleton } from "@/components/ui/Skeleton";

type ResonanceKey = "no_match" | "dim" | "warm" | "luminous";

type SessionInfo = {
  id: string;
  friendlyDate: string;
  startTime: string;
  endTime: string;
  role: "requester" | "specialist";
  counterparty: {
    name: string;
    avatarUrl: string;
    specialty?: string;
  };
  specialistGuidance?: string | null;
};

const RESONANCE_OPTIONS: {
  key: ResonanceKey;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: "no_match",
    label: "No hubo sintonía",
    hint: "No sentí conexión o no era lo que buscaba",
    icon: Cloud,
  },
  {
    key: "dim",
    label: "Algo de claridad",
    hint: "Estuvo bien, aunque quedó espacio para más",
    icon: Sunrise,
  },
  {
    key: "warm",
    label: "Buena sintonía",
    hint: "Cálida, clara y útil para dar un paso",
    icon: Sun,
  },
  {
    key: "luminous",
    label: "Muy luminosa",
    hint: "Gran conexión y mucha claridad",
    icon: Sparkles,
  },
];

function FeedbackFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") || "";
  const token = searchParams.get("token") || "";

  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [attended, setAttended] = useState(true);
  const [resonance, setResonance] = useState<ResonanceKey | null>(null);
  const [publicNote, setPublicNote] = useState("");
  const [privateNote, setPrivateNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!sessionId) {
        setError("Falta el identificador de la sesión.");
        setLoading(false);
        return;
      }
      try {
        const query = token ? `?token=${encodeURIComponent(token)}` : "";
        const res = await fetch(`/api/sessions/${sessionId}/feedback${query}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => null);
        if (!active) return;
        if (!res.ok || !data?.session) {
          setError(data?.message || "No pudimos abrir esta valoración.");
        } else {
          setSessionInfo(data.session);
          if (data.feedback) {
            setAttended(data.feedback.attended);
            setResonance(data.feedback.resonance);
            setPublicNote(data.feedback.publicNote || "");
            setPrivateNote(data.feedback.privateNote || "");
            setSubmitted(true);
          }
        }
      } catch {
        if (active) setError("Error de conexión al cargar la valoración.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [sessionId, token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionInfo) return;
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/sessions/${sessionInfo.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token || undefined,
          attended,
          resonance,
          publicNote,
          privateNote,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message || "No pudimos guardar tu valoración.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Error de red al guardar tu valoración.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error && !sessionInfo) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-center space-y-4">
          <h1 className="font-jakarta text-lg font-bold text-slate-900">
            Enlace no disponible
          </h1>
          <p className="font-sans text-sm text-slate-600">{error}</p>
          <Button variant="secondary" onClick={() => router.push("/sesiones")}>
            Ir a mis sesiones
          </Button>
        </div>
      </div>
    );
  }

  if (!sessionInfo) return null;

  const isSpecialist = sessionInfo.role === "specialist";

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="font-jakarta text-xl font-bold text-slate-900">
            ¡Gracias por tu valoración!
          </h1>
          <p className="font-sans text-sm text-slate-600">
            {isSpecialist
              ? publicNote.trim()
                ? `Enviamos tu orientación a ${sessionInfo.counterparty.name} y registramos la señal para LUMINUS.`
                : "Registramos tu señal sobre la sesión para seguir cuidando la experiencia."
              : "Tu mirada nos ayuda a cuidar la calidad y sintonía de las sesiones en LUMINUS."}
          </p>
          <div className="pt-2 flex justify-center">
            <Button variant="primary" onClick={() => router.push("/sesiones")}>
              Ir a mis sesiones
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
          <UserAvatar
            src={sessionInfo.counterparty.avatarUrl}
            alt={sessionInfo.counterparty.name}
            size="md"
          />
          <div className="min-w-0">
            <h1 className="font-jakarta text-lg font-bold text-slate-900">
              {isSpecialist ? "Cierre de sesión" : "¿Cómo sentiste tu sesión?"}
            </h1>
            <p className="font-sans text-xs text-slate-500">
              Con {sessionInfo.counterparty.name} · {sessionInfo.friendlyDate} ({sessionInfo.startTime} hs)
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-jakarta text-xs font-semibold text-slate-700">
            {isSpecialist
              ? `¿${sessionInfo.counterparty.name} se conectó a la sesión?`
              : "¿La sesión se realizó?"}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant={attended ? "primary" : "secondary"}
              size="md"
              onClick={() => setAttended(true)}
            >
              Sí, se realizó
            </Button>
            <Button
              type="button"
              variant={!attended ? "primary" : "secondary"}
              size="md"
              onClick={() => setAttended(false)}
            >
              No se realizó
            </Button>
          </div>
        </div>

        {attended && (
          <div className="space-y-2.5">
            <p className="font-jakarta text-xs font-semibold text-slate-700">
              {isSpecialist
                ? "¿Cómo sentiste el encuentro?"
                : "Claridad y sintonía del encuentro"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {RESONANCE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = resonance === opt.key;
                return (
                  <Button
                    key={opt.key}
                    type="button"
                    variant={selected ? "primary" : "secondary"}
                    className="h-auto py-3 px-3.5 justify-start text-left"
                    onClick={() => setResonance(opt.key)}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-jakarta text-xs font-semibold">
                          {opt.label}
                        </div>
                        <div
                          className={`font-sans text-[11px] font-normal mt-0.5 ${
                            selected ? "text-slate-200" : "text-slate-500"
                          }`}
                        >
                          {opt.hint}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <TextAreaField
          id="publicNote"
          label={
            isSpecialist
              ? "Orientación o próximo paso para el usuario"
              : "Mensaje para el especialista"
          }
          helperText={
            isSpecialist
              ? "Se enviará por email, chat y aparecerá en su tarjeta de sesión."
              : undefined
          }
          value={publicNote}
          onChange={(e) => setPublicNote(e.target.value)}
          maxLength={1000}
          showCount
          rows={3}
        />

        <TextAreaField
          id="privateNote"
          label="Nota privada para LUMINUS"
          helperText="Solo el equipo de LUMINUS puede ver este comentario."
          value={privateNote}
          onChange={(e) => setPrivateNote(e.target.value)}
          maxLength={1000}
          showCount
          rows={2}
        />

        {error && (
          <p className="font-sans text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/sesiones")}
          >
            Omitir por ahora
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Guardando..." : "Enviar valoración"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function SessionFeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto px-4 py-12">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      }
    >
      <FeedbackFormContent />
    </Suspense>
  );
}
