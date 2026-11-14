"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SelectInput } from "@/components/ui/SelectInput";
import { TagSelector } from "@/features/especialistas/onboarding/components/molecules/TagSelector";

const DAYS_OF_WEEK = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const HOURS_OPTIONS = Array.from({ length: 16 }, (_, i) => {
  const hour = (i + 7).toString().padStart(2, "0") + ":00";
  return { label: hour, value: hour };
});

export interface AvailabilitySlotInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface EditSpecialistAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlots: AvailabilitySlotInput[];
  onSave: (slots: AvailabilitySlotInput[]) => Promise<void>;
}

export function EditSpecialistAvailabilityModal({
  isOpen,
  onClose,
  initialSlots,
  onSave,
}: EditSpecialistAvailabilityModalProps) {
  const [enabled, setEnabled] = useState(true);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialSlots.length > 0) {
      setEnabled(true);
      const dayNames = initialSlots
        .map((slot) => DAYS_OF_WEEK[slot.dayOfWeek])
        .filter((name): name is string => Boolean(name));
      setSelectedDays(Array.from(new Set(dayNames)));
      setStartTime(initialSlots[0]?.startTime || "09:00");
      setEndTime(initialSlots[0]?.endTime || "18:00");
    } else {
      setEnabled(false);
      setSelectedDays([]);
      setStartTime("09:00");
      setEndTime("18:00");
    }
    setError("");
  }, [isOpen, initialSlots]);

  const endOptions = useMemo(
    () => HOURS_OPTIONS.filter((opt) => opt.value > startTime),
    [startTime]
  );

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (enabled && selectedDays.length === 0) {
      setError("Selecciona al menos un día disponible o desactiva las sesiones.");
      return;
    }
    if (enabled && startTime >= endTime) {
      setError("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }

    const slots: AvailabilitySlotInput[] = enabled
      ? selectedDays
          .map((day) => DAYS_OF_WEEK.indexOf(day))
          .filter((idx) => idx >= 0)
          .sort((a, b) => a - b)
          .map((dayOfWeek) => ({
            dayOfWeek,
            startTime,
            endTime,
          }))
      : [];

    setSaving(true);
    setError("");
    try {
      await onSave(slots);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible guardar la disponibilidad.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sesión introductoria"
      subtitle="Define los días y horarios en los que recibes videollamadas de 15 minutos."
      maxWidth="540px"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar disponibilidad"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <label className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer">
          <div className="flex flex-col gap-0.5">
            <span className="text-body font-semibold text-slate-900">
              Ofrecer sesión introductoria gratuita
            </span>
            <span className="text-meta text-slate-500">
              Videollamada breve de 15 minutos para conocerte.
            </span>
          </div>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-4 h-4 accent-slate-900 rounded cursor-pointer shrink-0"
          />
        </label>

        {enabled && (
          <>
            <TagSelector
              label="Días disponibles"
              tags={DAYS_OF_WEEK}
              selectedTags={selectedDays}
              onToggle={toggleDay}
            />

            <div className="grid grid-cols-2 gap-3">
              <SelectInput
                label="Desde"
                options={HOURS_OPTIONS}
                value={startTime}
                onSelect={(val) => {
                  setStartTime(val);
                  if (val >= endTime) {
                    const next = HOURS_OPTIONS.find((o) => o.value > val);
                    if (next) setEndTime(next.value);
                  }
                }}
              />
              <SelectInput
                label="Hasta"
                options={endOptions}
                value={endTime}
                onSelect={setEndTime}
              />
            </div>
          </>
        )}

        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
