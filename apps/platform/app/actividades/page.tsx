"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActivitiesSkeleton } from "@/components/ui/Skeleton";
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

  if (loading) return <ActivitiesSkeleton />;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 pb-12 pt-4 font-sans sm:px-6 md:gap-7 md:py-6">
      {/* 1. Standardized In-App Header */}
      <PageHeader
        title="Actividades"
        description="Eventos y actividades sobre bienestar."
      />

      {/* 2. Main Content: Timeline */}
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
          {error}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No hay próximas actividades disponibles"
          description="Muy pronto estaremos compartiendo nuevas charlas, talleres y experiencias LUMINUS."
        />
      ) : (
        <div className="w-full flex flex-col">
          {events.map((item, index) => {
            const isLast = index === events.length - 1;
            const { dayMonth, weekday } = formatTimelineDate(item.date);

            return (
              <div key={item.id} className="flex gap-4 sm:gap-6 md:gap-7 items-stretch group">
                {/* Timeline Indicator Column */}
                <div className="w-6 shrink-0 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-slate-400 group-hover:bg-slate-900 transition-colors border-2 border-white ring-2 ring-slate-100 shrink-0 mt-1.5 z-10" />
                  {!isLast && <div className="flex-1 w-[2px] bg-slate-200" />}
                  {isLast && (
                    <div className="flex-1 w-[2px] bg-gradient-to-b from-slate-200 to-transparent" />
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
