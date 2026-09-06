"use client";

import { useMemo, useState } from "react";

type Availability = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
};

type Props = {
  specialistName: string;
  availability: Availability[];
  onClose: () => void;
};

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTH_LABELS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

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

export function IntroSessionScheduler({ specialistName, availability, onClose }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

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

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-5" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white sm:max-w-2xl sm:rounded-3xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sesión introductoria · 15 minutos</p>
            <h2 className="mt-1 font-jakarta text-xl font-bold text-slate-950">Elige un horario con {specialistName}</h2>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="flex flex-col gap-6 p-5 pb-28 sm:p-7 sm:pb-7">
          <div className="flex items-center justify-between">
            <button disabled={weekOffset === 0} onClick={() => setWeekOffset((value) => Math.max(0, value - 1))} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 disabled:opacity-30">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <strong className="capitalize text-slate-900">{monthTitle}</strong>
            <button onClick={() => setWeekOffset((value) => value + 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200">
              <span className="material-symbols-outlined">chevron_right</span>
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
                  className={`flex min-h-[68px] flex-col items-center justify-center rounded-xl border text-xs transition sm:min-h-[76px] ${selected ? "border-black bg-black text-white" : enabled ? "border-slate-200 bg-white text-slate-800 hover:border-slate-500" : "border-slate-100 bg-slate-50 text-slate-300"}`}
                >
                  <span>{DAY_LABELS[index]}</span>
                  <strong className="mt-1 text-lg">{date.getDate()}</strong>
                </button>
              );
            })}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-900">Horarios disponibles</h3>
              <span className="text-xs text-slate-500">{timezone}</span>
            </div>
            {!selectedDate ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">Selecciona un día para ver sus horarios.</div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((time) => (
                  <button key={time} onClick={() => setSelectedTime(time)} className={`h-11 rounded-xl border text-sm font-semibold transition ${selectedTime === time ? "border-black bg-black text-white" : "border-slate-200 text-slate-700 hover:border-slate-500"}`}>
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="fixed inset-x-0 bottom-[68px] z-[110] border-t border-slate-200 bg-white p-4 sm:static sm:border-0 sm:p-0">
            <button
              type="button"
              disabled={!selectedDate || !selectedTime}
              onClick={() => setIsConfirmationOpen(true)}
              className="h-12 w-full rounded-xl bg-black font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              Confirmar horario
            </button>
          </div>
        </div>
      </div>

      {isConfirmationOpen && selectedDate && selectedTime && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-5" role="alertdialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-xl sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <span className="material-symbols-outlined text-[30px]">event_available</span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-950">Confirma tu horario</h2>
            <p className="mt-3 capitalize font-semibold text-slate-800">{formattedSelectedDate}</p>
            <p className="mt-1 text-lg font-bold text-slate-950">{selectedTime} · {timezone}</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Al confirmar, te enviaremos por correo todos los detalles de la sesión introductoria con {specialistName}.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmationOpen(false);
                  onClose();
                }}
                className="h-12 w-full rounded-xl bg-black font-bold text-white hover:bg-zinc-800"
              >
                Confirmar
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmationOpen(false)}
                className="h-12 w-full rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
