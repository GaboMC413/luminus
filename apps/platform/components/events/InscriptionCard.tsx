"use client";

import Link from "next/link";
import { PlayCircle, Video, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatEventDateTime } from "@/lib/eventDateUtils";
import type { ActivityEventItem } from "@/components/events/ActivityCard";

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

function isEventPast(event: ActivityEventItem): boolean {
  if (event.isUpcoming === false) return true;
  const d = parseCalendarDate(event.date);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

function resolveDirectEventUrl(event: ActivityEventItem): string | null {
  const rawLink = event.link?.trim();
  if (rawLink) return rawLink;

  const rawYt = event.youtubeId?.trim();
  if (rawYt) {
    return rawYt.startsWith("http://") || rawYt.startsWith("https://")
      ? rawYt
      : `https://www.youtube.com/watch?v=${rawYt}`;
  }

  return null;
}

function formatSpeakerName(speakerName?: string | null): string | null {
  if (!speakerName) return null;
  const clean = speakerName.trim();
  if (
    !clean ||
    clean === "Especialista LUMINUS" ||
    clean === "Especialistas LUMINUS" ||
    clean === "Especialista" ||
    clean === "LUMINUS"
  ) {
    return null;
  }
  return clean.startsWith("Con ") ? clean : `Con ${clean}`;
}

function resolveCoverThumbnail(event: ActivityEventItem): string {
  if (event.coverUrl && event.coverUrl.trim().length > 0) {
    return event.coverUrl;
  }
  if (event.youtubeId) {
    return `https://i.ytimg.com/vi/${event.youtubeId}/hqdefault.jpg`;
  }
  return "/luminus_events.jpg";
}

interface InscriptionCardProps {
  event: ActivityEventItem;
}

/**
 * Compact card for the "Mis inscripciones" grid, modeled after RecordingCard.
 * Surfaces a unified "Unirse al evento" / "Ver grabación" action when a link exists,
 * or a clear pending-link state when it is not yet defined.
 */
export function InscriptionCard({ event }: InscriptionCardProps) {
  const eventSlug = event.slug || event.id;
  const detailHref = `/actividades/${eventSlug}`;
  const isPast = isEventPast(event);
  const directUrl = resolveDirectEventUrl(event);
  const thumbUrl = resolveCoverThumbnail(event);
  const speakerText = formatSpeakerName(event.speakerName);

  const dt = formatEventDateTime(event.date, event.timeText);
  const cleanTime = dt.timeString.replace(/\s*\([^)]*\)/g, "").trim();
  const dateTimeLabel = dt.dayMonth
    ? `${dt.dayMonth} • ${cleanTime}`
    : cleanTime;

  const mediaContent = (
    <img
      src={thumbUrl}
      alt={event.title}
      className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
      loading="lazy"
    />
  );

  return (
    <article className="w-full h-[350px] sm:h-[370px] bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-colors overflow-hidden flex flex-col group shadow-none">
      {/* 1. 16:9 Cover Thumbnail */}
      {isPast && directUrl ? (
        <a
          href={directUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full aspect-video relative overflow-hidden bg-slate-100 shrink-0 block"
        >
          {mediaContent}
        </a>
      ) : (
        <Link
          href={detailHref}
          className="w-full aspect-video relative overflow-hidden bg-slate-100 shrink-0 block"
        >
          {mediaContent}
        </Link>
      )}

      {/* 2. Card Body */}
      <div className="w-full flex-1 p-3.5 sm:p-4 flex flex-col justify-between items-start min-h-0">
        <div className="w-full flex flex-col gap-2">
          {/* Date & Time */}
          <p className="text-xs font-medium text-slate-500 font-sans truncate w-full">
            {dateTimeLabel}
          </p>

          {/* Title & Speaker */}
          <div className="flex flex-col gap-1">
            {isPast && directUrl ? (
              <a
                href={directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline block group/title"
              >
                <h3 className="w-full text-sm sm:text-base font-semibold text-slate-900 leading-snug line-clamp-2 font-jakarta group-hover/title:text-slate-600 transition-colors">
                  {event.title}
                </h3>
              </a>
            ) : (
              <Link
                href={detailHref}
                className="no-underline block group/title"
              >
                <h3 className="w-full text-sm sm:text-base font-semibold text-slate-900 leading-snug line-clamp-2 font-jakarta group-hover/title:text-slate-600 transition-colors">
                  {event.title}
                </h3>
              </Link>
            )}

            {speakerText && (
              <p className="text-xs text-slate-500 truncate w-full font-sans">
                {speakerText}
              </p>
            )}
          </div>
        </div>

        {/* 3. Action Footer */}
        <div className="w-full mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {isPast ? (
            directUrl ? (
              <a
                href={directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold font-jakarta text-slate-700 hover:text-slate-950 transition-colors"
              >
                <PlayCircle className="w-4 h-4 text-slate-500 group-hover/link:text-slate-900 shrink-0 transition-colors" />
                <span>Ver grabación</span>
              </a>
            ) : (
              <span className="text-xs font-medium text-slate-400 font-sans">
                Actividad finalizada
              </span>
            )
          ) : directUrl ? (
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold font-jakarta text-slate-900 hover:text-black transition-colors"
            >
              <Video className="w-4 h-4 text-slate-700 group-hover/link:text-black shrink-0 transition-colors" />
              <span>Unirse al evento</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-slate-900 shrink-0 transition-colors" />
            </a>
          ) : (
            <span className="text-xs font-medium text-slate-400 font-sans">
              Enlace disponible próximamente
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * Co-located skeleton matching InscriptionCard dimensions.
 */
export function InscriptionCardSkeleton() {
  return (
    <article className="w-full h-[350px] sm:h-[370px] bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col shadow-none">
      <Skeleton className="w-full aspect-video rounded-none shrink-0" />
      <div className="w-full flex-1 p-3.5 sm:p-4 flex flex-col justify-between items-start min-h-0">
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="h-3 w-28 rounded-md" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md mt-0.5" />
          </div>
        </div>
        <div className="w-full mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
      </div>
    </article>
  );
}
