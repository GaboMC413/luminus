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
  if (!timeText) return "18:00 hs";
  const cleaned = timeText
    .replace(/\s*\([^)]*GMT[^)]*\)/gi, "")
    .replace(/\s*\([^)]*UTC[^)]*\)/gi, "")
    .replace(/\s*GMT[+-]?\d*/gi, "")
    .replace(/\s*UTC[+-]?\d*/gi, "")
    .trim();
  return cleaned || "18:00 hs";
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

  return (
    <section className="w-full py-8 md:py-12 bg-white flex-1 flex flex-col items-center">
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
        {events.length === 0 ? (
          <div className="w-full py-12 text-center text-slate-500 font-light bg-slate-50 rounded-2xl border border-slate-200">
            No hay próximos eventos programados por el momento.
          </div>
        ) : (
          <div className="w-full flex flex-col">
            {events.map((item, index) => {
              const isLast = index === events.length - 1;
              const eventSlug = item.slug || item.id || `evento-${index}`;
              const { dayMonth, weekday } = getLumaDateHeader(item.date);

              const localTimeText = mounted
                ? getLocalTimeString(item.date, item.time_text)
                : cleanTimeString(item.time_text);

              const rawCover =
                item.cover_url ||
                (item.youtube_id
                  ? `https://i.ytimg.com/vi/${item.youtube_id}/maxresdefault.jpg`
                  : "/placeholder-video.jpg");
              const coverUrl = rawCover.replace("/hqdefault.jpg", "/maxresdefault.jpg");

              return (
                <div key={item.id || index} className="flex gap-5 md:gap-7 items-stretch group">

                  {/* ── LEFT AXIS COLUMN ──
                      The dot and the line live together here.
                      items-center makes both share the exact same horizontal center.
                      No absolute positioning needed → zero offset issues. */}
                  <div className="w-6 shrink-0 flex flex-col items-center">
                    {/* Dot — sits at top, centered in 24px column */}
                    <div
                      className="w-3 h-3 rounded-full bg-slate-400 group-hover:bg-slate-900 transition-colors border-2 border-white ring-2 ring-slate-100 shrink-0 mt-[5px] z-10"
                    />
                    {/* Line — grows downward from the dot, dissolves at end for last item */}
                    {!isLast && (
                      <div className="flex-1 w-[2px] bg-slate-300" />
                    )}
                    {isLast && (
                      <div
                        className="flex-1 w-[2px]"
                        style={{ background: "linear-gradient(to bottom, #CBD5E1, transparent)" }}
                      />
                    )}
                  </div>

                  {/* ── RIGHT CONTENT COLUMN ── pb-10 creates the gap between events,
                       and since items-stretch is on the row, the axis column stretches
                       to the same height → line is continuous dot-to-dot */}
                  <div className={`flex-1 min-w-0 flex flex-col gap-3.5 ${isLast ? 'pb-2' : 'pb-10 md:pb-12'}`}>

                    {/* Luma Date Header */}
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

                    {/* Event Card */}
                    <div className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden transition-colors flex flex-col md:flex-row md:items-stretch">

                      {/* Left: Info — centered content between top time row and bottom CTA button */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between gap-4 order-last md:order-first p-5 md:p-6">

                        {/* Top: Time + Platform Location Badge */}
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

                        {/* Center: Title + Speaker + Description */}
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

                        {/* Bottom: CTA Button */}
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

                      {/* Right: Image at 58% card width, 16:9 ratio, no overflow */}
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
