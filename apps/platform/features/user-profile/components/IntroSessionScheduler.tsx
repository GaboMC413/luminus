"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Clock, Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { IntroSessionGuideModal } from "./IntroSessionGuideModal";
import {
  type AvailableDateOption,
  formatSessionDate,
} from "@/lib/sessions/sessionAvailability";

type Props = {
  specialistId: string;
  specialistName: string;
  availableDates: AvailableDateOption[];
  initialDateKey?: string | null;
  onClose: () => void;
  onBooked?: (session: any) => void;
};

export function IntroSessionScheduler({
  specialistId,
  specialistName,
  availableDates,
  initialDateKey = null,
  onClose,
  onBooked,
}: Props) {
  const router = useRouter();
  const [selectedDateKey, setSelectedDateKey] = useState<string>(
    () =>
      (initialDateKey &&
        availableDates.some((d) => d.dateKey === initialDateKey) &&
        initialDateKey) ||
      availableDates[0]?.dateKey ||
      ""
  );
  const [selectedTime, setSelectedTime] = useState("");
  const [requesterNote, setRequesterNote] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [step, setStep] = useState<"select" | "confirm" | "success">("select");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedDay = useMemo(
    () => availableDates.find((d) => d.dateKey === selectedDateKey) || null,
    [availableDates, selectedDateKey]
  );

  const slots = selectedDay?.slots || [];
  const timezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch {
      return "";
    }
  }, []);
  const formattedSelectedDate = selectedDateKey
    ? formatSessionDate(selectedDateKey)
    : "";

  const handleConfirm = async () => {
    const trimmedNote = requesterNote.trim();
    if (!selectedDateKey || !selectedTime || !trimmedNote || !acceptedTerms || isSubmitting) return;

    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          specialistId,
          scheduledDate: selectedDateKey,
          startTime: selectedTime,
          timezone: timezone || "UTC",
          requesterNote: trimmedNote,
          acceptedTerms: true,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "No pudimos solicitar la sesión.");
      }

      window.dispatchEvent(new Event("luminus_messages_update"));
      window.dispatchEvent(new Event("luminus_notifications_update"));
      onBooked?.(data.session);
      setStep("success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No pudimos solicitar la sesión."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        step === "success"
          ? "¡Solicitud enviada!"
          : step === "confirm"
            ? "Confirma tu solicitud"
            : `Elige un horario con ${specialistName}`
      }
      subtitle={
        step === "select" ? "Sesión introductoria · 15 minutos · Sin costo" : undefined
      }
      maxWidth={step === "select" ? "560px" : "440px"}
      footer={
        step === "select" ? (
          <Button
            variant="primary"
            fullWidth
            disabled={!selectedDateKey || !selectedTime}
            onClick={() => {
              setError("");
              setStep("confirm");
            }}
          >
            Continuar
          </Button>
        ) : step === "confirm" ? (
          <>
            <Button
              variant="secondary"
              fullWidth
              disabled={isSubmitting}
              onClick={() => setStep("select")}
            >
              Volver
            </Button>
            <Button
              variant="primary"
              fullWidth
              disabled={isSubmitting || !requesterNote.trim() || !acceptedTerms}
              onClick={handleConfirm}
            >
              {isSubmitting ? "Enviando..." : "Solicitar sesión"}
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" fullWidth onClick={onClose}>
              Cerrar
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                onClose();
                router.push("/sesiones");
              }}
            >
              Ver mis sesiones
            </Button>
          </>
        )
      }
    >
      {step === "select" && (
        <div className="flex flex-col gap-5 pt-1">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2.5">
            <span className="text-xs text-slate-600">
              ¿Primera vez agendando?
            </span>
            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-transparent border-none p-0 cursor-pointer font-jakarta shrink-0 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Descubre cómo funciona</span>
            </button>
          </div>
          {availableDates.length === 0 ? (
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-6 text-center text-body text-slate-500">
              No hay horarios disponibles en los próximos días.
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-title-section text-slate-900 font-bold mb-2.5">
                  Días disponibles
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {availableDates.slice(0, 5).map((day) => {
                    const isSelected = day.dateKey === selectedDateKey;
                    return (
                      <button
                        key={day.dateKey}
                        type="button"
                        onClick={() => {
                          setSelectedDateKey(day.dateKey);
                          setSelectedTime("");
                        }}
                        className={`flex flex-col items-center justify-center rounded-xl border px-2.5 py-2.5 transition font-jakarta cursor-pointer ${
                          isSelected
                            ? "border-slate-900 bg-slate-900 text-white font-bold"
                            : "border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 font-semibold"
                        }`}
                      >
                        <span className="text-meta text-current opacity-75">
                          {day.dayLabel}
                        </span>
                        <strong className="mt-0.5 text-sm font-bold">
                          {day.dayNumber} {day.monthShort}
                        </strong>
                        <span className="mt-0.5 text-meta text-current opacity-70">
                          {day.slots.length}{" "}
                          {day.slots.length === 1 ? "turno" : "turnos"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <h3 className="text-title-section text-slate-900 font-bold">
                    Horarios disponibles
                  </h3>
                  <span className="text-meta text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {timezone || "Hora local"}
                  </span>
                </div>
                {slots.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-6 text-center text-body text-slate-500">
                    No hay turnos disponibles para este día.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 max-h-[240px] overflow-y-auto pr-1 subtle-scrollbar">
                    {slots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`h-10 rounded-xl border text-xs sm:text-sm font-semibold transition font-jakarta cursor-pointer ${
                          selectedTime === time
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {step === "confirm" && (
        <div className="flex flex-col gap-5 py-1">
          <div className="flex flex-col items-center text-center bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-emerald-700">
              15 minutos con {specialistName}
            </p>
            <p className="mt-1.5 text-label text-slate-700">
              {formattedSelectedDate
                ? formattedSelectedDate.charAt(0).toUpperCase() +
                  formattedSelectedDate.slice(1)
                : ""}
            </p>
            <p className="mt-1 text-title-page text-slate-900">
              {selectedTime} hs
            </p>
            <p className="mt-1.5 text-meta text-slate-500">
              {timezone || "Hora local"}
            </p>
          </div>

          <TextAreaField
            id="intro-session-note"
            label="¿Qué te gustaría conversar?"
            placeholder="Cuéntale brevemente tu objetivo o consulta para aprovechar mejor los 15 minutos..."
            value={requesterNote}
            onChange={(e) => {
              setRequesterNote(e.target.value);
              if (error) setError("");
            }}
            maxLength={500}
            showCount
            required
            rows={3}
          />

          <label className="flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-200/80 p-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (error) setError("");
              }}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 shrink-0 cursor-pointer"
            />
            <span className="text-xs leading-relaxed text-slate-600">
              Entiendo que es una sesión introductoria gratuita (no una consulta médica ni terapéutica), que LUMINUS no interviene ni responde por el servicio, asistencia o fallos técnicos, y acepto las{" "}
              <a
                href="https://luminuslatam.com/legal/sesiones-introductorias"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-slate-900 underline hover:text-slate-700"
              >
                Condiciones de Sesiones Introductorias
              </a>
              .
            </span>
          </label>

          {error && (
            <p className="text-xs font-medium text-rose-600 px-0.5">{error}</p>
          )}
        </div>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Check className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-title-page text-slate-900">
            Solicitud enviada a {specialistName}
          </h3>
          <p className="text-body text-slate-500 mt-2">
            Le avisamos sobre tu solicitud. Cuando confirme la sesión, recibirás
            el enlace de acceso en{" "}
            <strong className="text-slate-800">Mis sesiones</strong>.
          </p>
        </div>
      )}
      <IntroSessionGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        defaultTab="miembros"
      />
    </Modal>
  );
}
