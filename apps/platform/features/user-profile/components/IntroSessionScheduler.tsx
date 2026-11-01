"use client";

import { useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight, CalendarCheck, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Availability = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
};

type Props = {
  specialistName: string;
  availability: Availability[];
  initialDate?: Date | null;
  onClose: () => void;
};

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTH_LABELS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function mondayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatMinutes(value: number) {
  const hours = Math.floor(value / 60).toString().padStart(2, "0");
  const minutes = (value % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function IntroSessionScheduler({ specialistName, availability, initialDate = null, onClose }: Props) {
  const initialOffset = useMemo(() => {
    if (!initialDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((initialDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.floor(diffDays / 7));
  }, [initialDate]);

  const [weekOffset, setWeekOffset] = useState(initialOffset);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
  const [selectedTime, setSelectedTime] = useState("");
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + weekOffset * 7 + index);
      return date;
    });
  }, [weekOffset]);

  const availabilityByDay = useMemo(() => {
    const map = new Map<number, Availability>();
    availability.filter((item) => item.isActive !== false).forEach((item) => map.set(item.dayOfWeek, item));
    return map;
  }, [availability]);

  const slots = useMemo(() => {
    if (!selectedDate) return [];
    const range = availabilityByDay.get(mondayIndex(selectedDate));
    if (!range) return [];
    const result: string[] = [];
    for (let time = toMinutes(range.startTime); time + 15 <= toMinutes(range.endTime); time += 15) {
      result.push(formatMinutes(time));
    }
    return result;
  }, [availabilityByDay, selectedDate]);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Hora local";
  const monthTitle = `${MONTH_LABELS[days[0].getMonth()]} ${days[0].getFullYear()}`;

  const formattedSelectedDate = selectedDate?.toLocaleDateString("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleConfirm = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsConfirmationOpen(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-none sm:max-w-xl">
        <header className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-meta text-slate-500 font-semibold uppercase tracking-wider">
              Sesión introductoria · 15 minutos
            </p>
            <h2 className="mt-1 font-jakarta text-lg sm:text-xl font-bold text-slate-900">
              Elige un horario con {specialistName}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer border-none"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex flex-col gap-5 p-5 sm:p-6 pb-24 sm:pb-6">
          <div className="flex items-center justify-between">
            <button 
              disabled={weekOffset === 0} 
              onClick={() => setWeekOffset((value) => Math.max(0, value - 1))} 
              className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <strong className="capitalize text-slate-900 font-jakarta text-sm font-bold">{monthTitle}</strong>
            <button 
              onClick={() => setWeekOffset((value) => value + 1)} 
              className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {days.map((date, index) => {
              const enabled = availabilityByDay.has(mondayIndex(date));
              const selected = selectedDate && dateKey(selectedDate) === dateKey(date);
              return (
                <button
                  key={dateKey(date)}
                  disabled={!enabled}
                  onClick={() => { setSelectedDate(date); setSelectedTime(""); }}
                  className={`flex min-h-[64px] flex-col items-center justify-center rounded-xl border text-xs transition font-jakarta cursor-pointer ${
                    selected 
                      ? "border-slate-900 bg-slate-900 text-white font-bold" 
                      : enabled 
                        ? "border-slate-200 bg-white text-slate-800 hover:border-slate-400 font-semibold" 
                        : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                  }`}
                >
                  <span className="text-[11px] opacity-75">{DAY_LABELS[index]}</span>
                  <strong className="mt-0.5 text-base">{date.getDate()}</strong>
                </button>
              );
            })}
          </div>

          <div>
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <h3 className="text-title-section text-slate-900 font-jakarta font-semibold text-sm">Horarios disponibles</h3>
              <span className="text-meta text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {timezone}
              </span>
            </div>
            {!selectedDate ? (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-6 text-center text-body text-slate-500 font-sans">
                Selecciona un día para ver sus horarios disponibles.
              </div>
            ) : slots.length === 0 ? (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-6 text-center text-body text-slate-500 font-sans">
                No hay turnos disponibles para este día.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((time) => (
                  <button 
                    key={time} 
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

          <div className="fixed inset-x-0 bottom-0 z-[110] border-t border-slate-100 bg-white p-4 sm:static sm:border-0 sm:p-0">
            <Button
              variant="primary"
              fullWidth
              disabled={!selectedDate || !selectedTime}
              onClick={() => setIsConfirmationOpen(true)}
            >
              Confirmar horario
            </Button>
          </div>
        </div>
      </div>

      {isConfirmationOpen && selectedDate && selectedTime && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" role="alertdialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200/90 p-6 text-center shadow-none animate-in fade-in duration-150">
            {isSuccess ? (
              <div className="flex flex-col items-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="text-title-page font-bold text-slate-900 font-jakarta">¡Sesión solicitada!</h3>
                <p className="text-body text-slate-500 font-sans mt-2">
                  Te hemos enviado la confirmación de la sesión con {specialistName}.
                </p>
              </div>
            ) : (
              <>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <h3 className="text-title-section text-slate-900 font-bold font-jakarta text-lg">
                  Confirma tu sesión
                </h3>
                <p className="mt-2 text-sm capitalize font-semibold text-slate-800 font-jakarta">
                  {formattedSelectedDate}
                </p>
                <p className="mt-0.5 text-base font-bold text-slate-900 font-jakarta">
                  {selectedTime} · {timezone}
                </p>
                <p className="mt-3 text-meta text-slate-500 leading-relaxed font-sans">
                  Sesión introductoria de 15 minutos para conocer el enfoque de {specialistName}.
                </p>
                <div className="mt-5 flex flex-col sm:flex-row-reverse gap-2">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleConfirm}
                  >
                    Confirmar cita
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setIsConfirmationOpen(false)}
                  >
                    Volver
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
