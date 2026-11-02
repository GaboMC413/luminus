"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { ActivityCard, ActivityEventItem } from "@/components/events/ActivityCard";

function parseCalendarDate(dateStr?: string | Date | null): Date | null {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
  const str = String(dateStr).trim();
  if (!str) return null;

  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    return new Date(year, month, day);
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function formatTimelineDate(dateStr?: string | null) {
  if (!dateStr) return { dayMonth: "Próximamente", weekday: "" };
  const d = parseCalendarDate(dateStr);
  if (!d) return { dayMonth: dateStr, weekday: "" };

  const day = d.getDate();
  const monthRaw = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
  const month = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1);

  const weekdayRaw = d.toLocaleDateString("es-ES", { weekday: "long" });
  const weekday = weekdayRaw.charAt(0).toUpperCase() + weekdayRaw.slice(1);

  return {
    dayMonth: `${day} ${month}`,
    weekday: weekday,
  };
}

export default function ActividadesPage() {
  const [events, setEvents] = useState<ActivityEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const res = await fetch("/api/events", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("No se pudieron cargar las actividades.");
        }
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err: any) {
        setError(err.message || "Error al cargar actividades.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pb-16 pt-6 font-sans sm:px-6 md:py-10">
      {/* Header: Clean, only Title and Subtitle, no eyebrow, no search, no categories */}
      <header className="flex flex-col gap-2 text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-jakarta text-slate-900 tracking-tight">
          Actividades
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-sans leading-relaxed">
          Eventos y actividades sobre bienestar.
        </p>
      </header>

      {/* Main Content: Timeline */}
      {loading ? (
        <div className="flex flex-col gap-8 py-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 sm:gap-6 animate-pulse">
              <div className="w-6 flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-slate-300 shrink-0 mt-1" />
                <div className="w-[2px] flex-1 bg-slate-200 mt-2" />
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <div className="h-6 w-36 bg-slate-200 rounded-md" />
                <div className="w-full h-56 bg-slate-200 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="w-full py-16 px-6 text-center bg-white rounded-2xl border border-slate-200/90 flex flex-col items-center justify-center gap-4 my-4 shadow-none">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
            <Calendar className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-jakarta text-slate-900 tracking-tight">
            Actualmente no hay próximas actividades disponibles
          </h2>
          <p className="text-sm font-normal font-sans text-slate-600 max-w-md leading-relaxed">
            Muy pronto estaremos compartiendo nuevas charlas, talleres y experiencias LUMINUS.
          </p>
        </div>
      ) : (
        <div className="w-full flex flex-col">
          {events.map((item, index) => {
            const isLast = index === events.length - 1;
            const { dayMonth, weekday } = formatTimelineDate(item.date);

            return (
              <div key={item.id} className="flex gap-4 sm:gap-6 md:gap-7 items-stretch group">
                {/* Axis Column */}
                <div className="w-6 shrink-0 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-slate-400 group-hover:bg-slate-900 transition-colors border-2 border-white ring-2 ring-slate-100 shrink-0 mt-1.5 z-10" />
                  {!isLast && <div className="flex-1 w-[2px] bg-slate-200" />}
                  {isLast && (
                    <div
                      className="flex-1 w-[2px]"
                      style={{ background: "linear-gradient(to bottom, #E2E8F0, transparent)" }}
                    />
                  )}
                </div>

                {/* Content Column */}
                <div className={`flex-1 min-w-0 flex flex-col gap-3.5 ${isLast ? "pb-4" : "pb-10 sm:pb-12"}`}>
                  {/* Date Header */}
                  <div className="flex items-baseline text-base sm:text-lg font-bold font-jakarta text-slate-900 tracking-tight select-none">
                    <span>{dayMonth}</span>
                    {weekday && (
                      <span className="ml-2 font-medium font-sans text-slate-500 text-sm sm:text-base">
                        {weekday}
                      </span>
                    )}
                  </div>

                  {/* Standardized Activity Card */}
                  <ActivityCard event={item} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
