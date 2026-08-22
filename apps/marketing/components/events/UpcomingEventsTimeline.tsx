"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface EventItem {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  speaker_name?: string;
  speaker_bio?: string;
  category?: string;
  date?: string;
  time_text?: string;
  location?: string;
  coverUrl?: string | null;
  cover_url?: string | null;
  youtube_id?: string;
  link?: string;
  is_upcoming?: boolean;
}

interface UpcomingEventsTimelineProps {
  events: EventItem[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "Crecimiento Personal": "#F0A500",
  "Bienestar Emocional": "#E855C8",
  "Salud Integral": "#0450FB",
  "Movimiento Físico": "#E63946",
  "Mindfulness": "#0D9488",
  "Nutrición": "#A8C800",
  "Espiritualidad": "#6D28D9",
  "Vínculos y Relaciones": "#FF7700",
  "Terapias Complementarias": "#0FA87A",
};

function getLumaDateHeader(dateString?: string) {
  if (!dateString) return { dayMonth: "Próximamente", weekday: "" };
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { dayMonth: "Próximamente", weekday: "" };
    const day = d.getDate();
    const month = d.toLocaleDateString("es-ES", { month: "short" }).toLowerCase().replace(".", "");
    const weekday = d.toLocaleDateString("es-ES", { weekday: "long" }).toLowerCase();
    return { dayMonth: `${day} ${month}`, weekday };
  } catch {
    return { dayMonth: "Próximamente", weekday: "" };
  }
}

function cleanTimeString(timeText?: string): string {
  if (!timeText) return "00:00 hs";
  const cleaned = timeText
    .replace(/\s*\([^)]*GMT[^)]*\)/gi, "")
    .replace(/\s*\([^)]*UTC[^)]*\)/gi, "")
    .replace(/\s*GMT[+-]?\d*/gi, "")
    .replace(/\s*UTC[+-]?\d*/gi, "")
    .trim();
  return cleaned || "00:00 hs";
}

function getLocalTimeString(dateString?: string, fallbackTime?: string): string {
  const fallback = cleanTimeString(fallbackTime);
  if (!dateString) return fallback;
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return fallback;
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes} hs`;
  } catch {
    return fallback;
  }
}

export function UpcomingEventsTimeline({ events }: UpcomingEventsTimelineProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cleanTimeString = (timeText?: string) => {
    if (!timeText) return "";
    return timeText
      .replace(/\s*\(.*?\)/g, "")
      .replace(/hs$/i, "hs")
      .trim();
  };

  const getLocalTimeString = (dateStr?: string, defaultTimeText?: string) => {
    if (!dateStr) return cleanTimeString(defaultTimeText);
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return cleanTimeString(defaultTimeText);

      const hours = d.getHours().toString().padStart(2, "0");
      const minutes = d.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes} hs`;
    } catch {
      return cleanTimeString(defaultTimeText);
    }
  };

  const getLumaDateHeader = (dateStr?: string) => {
    if (!dateStr) return { dayMonth: "", weekday: "" };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { dayMonth: dateStr, weekday: "" };

      const day = d.getDate();
      const monthRaw = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
      const month = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1);

      const weekdayRaw = d.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "");
      const weekday = weekdayRaw.toUpperCase();

      return {
        dayMonth: `${day} ${month}`,
        weekday: weekday,
      };
    } catch {
      return { dayMonth: dateStr || "", weekday: "" };
    }
  };

  const upcomingList = events
    .filter((e) => {
      if (e.is_upcoming === true) return true;
      if (e.is_upcoming === false) return false;
      if (!e.date) return false;
      const d = new Date(e.date);
      return !isNaN(d.getTime()) && d >= new Date();
    })
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });

  return (
    <section className="w-full py-14 sm:py-16 md:py-24 bg-white flex-1 flex flex-col items-center">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-10 flex flex-col gap-10 md:gap-12">

        {/* Header Section */}
        <div className="w-full flex flex-col justify-start items-start gap-3 md:gap-4 text-left">
          <h1 className="w-full text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-slate-900 leading-[40px] md:leading-[48px]">
            Próximas Fechas
          </h1>
          <p className="w-full text-lg sm:text-xl lg:text-[24px] font-normal text-slate-800 leading-7 md:leading-8">
            Eventos y actividades sobre bienestar.
          </p>
        </div>

        {/* Timeline */}
        {upcomingList.length === 0 ? (
          <div className="w-full py-14 px-6 md:px-12 text-center bg-slate-50/80 rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-4 my-2">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
              <span className="material-symbols-outlined text-[24px]">calendar_today</span>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">
              Actualmente no hay próximas actividades disponibles
            </h2>
            <p className="text-sm md:text-base font-light text-slate-600 max-w-lg leading-relaxed">
              Muy pronto estaremos compartiendo nuevas charlas, talleres y experiencias LUMINUS. Mientras tanto, puedes explorar nuestras entrevistas y contenidos grabados.
            </p>
            <div className="pt-2">
              <Link
                href="https://www.youtube.com/@luminus_latam"
                target="_blank"
                className="inline-flex items-center justify-center h-12 px-7 bg-black hover:bg-slate-800 text-white font-medium rounded-2xl text-sm transition-colors gap-2 shadow-sm"
              >
                <span>Explorar canal de YouTube</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col">
            {upcomingList.map((item, index) => {
              const isLast = index === upcomingList.length - 1;
              const eventSlug = item.slug || item.id || `evento-${index}`;
              const { dayMonth, weekday } = getLumaDateHeader(item.date);

              const localTimeText = mounted
                ? getLocalTimeString(item.date, item.time_text)
                : cleanTimeString(item.time_text);

              const coverUrl = item.coverUrl || item.cover_url || "/placeholder-video.jpg";

              return (
                <div key={item.id || index} className="flex gap-5 md:gap-7 items-stretch group">

                  {/* Axis Column */}
                  <div className="w-6 shrink-0 flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-slate-400 group-hover:bg-slate-900 transition-colors border-2 border-white ring-2 ring-slate-100 shrink-0 mt-[5px] z-10" />
                    {!isLast && <div className="flex-1 w-[2px] bg-slate-300" />}
                    {isLast && (
                      <div
                        className="flex-1 w-[2px]"
                        style={{ background: "linear-gradient(to bottom, #CBD5E1, transparent)" }}
                      />
                    )}
                  </div>

                  {/* Content Column */}
                  <div className={`flex-1 min-w-0 flex flex-col gap-3.5 ${isLast ? 'pb-2' : 'pb-10 md:pb-12'}`}>
                    <div className="flex items-baseline text-lg sm:text-xl select-none">
                      <span className="font-semibold text-slate-900 tracking-tight">
                        {dayMonth}
                      </span>
                      {weekday && (
                        <span className="font-light text-slate-400 ml-2.5 capitalize">
                          {weekday}
                        </span>
                      )}
                    </div>

                    <div className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden transition-colors flex flex-col md:flex-row md:items-stretch">
                      <div className="flex-1 min-w-0 flex flex-col justify-between gap-4 order-last md:order-first p-5 md:p-6">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight leading-none">
                            {localTimeText}
                          </span>
                          {item.location && (
                            <span className="inline-flex items-center justify-center px-3.5 py-1.5 bg-white text-slate-700 rounded-full text-xs font-medium border border-slate-200">
                              {item.location}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-2.5 my-auto py-2">
                          <Link href={`/proximasfechas/${eventSlug}`}>
                            <h2 className="text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight hover:text-black transition-colors">
                              {item.title}
                            </h2>
                          </Link>

                          {item.speaker_name && (
                            <p className="text-base sm:text-lg font-semibold text-slate-800">
                              Con {item.speaker_name}
                            </p>
                          )}

                          <p className="text-sm font-light text-slate-600 line-clamp-3 leading-relaxed">
                            {item.description
                              ? item.description
                                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
                                .replace(/\*\*([^*]+)\*\*/g, "$1")
                              : ""}
                          </p>
                        </div>

                        <div className="flex justify-start pt-1">
                          <Link
                            href={`/proximasfechas/${eventSlug}`}
                            className="w-full sm:w-auto h-12 px-8 bg-black hover:bg-slate-800 text-white font-normal rounded-2xl text-base transition-colors text-center cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                          >
                            <span>Inscribirme a este evento</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>

                      <Link
                        href={`/proximasfechas/${eventSlug}`}
                        className="w-full md:w-1/2 shrink-0 aspect-video relative overflow-hidden order-first md:order-last block"
                      >
                        <Image
                          src={coverUrl}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 58vw"
                          className="object-cover object-center"
                          unoptimized
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
