"use client";

import React from "react";
import { PlayCircle } from "lucide-react";

export interface RecordingItem {
  id?: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  speakerName?: string | null;
  speakerBio?: string | null;
  category?: string | null;
  coverUrl?: string | null;
  date?: string | Date | null;
  timeText?: string | null;
  location?: string | null;
  link?: string | null;
  youtubeId?: string | null;
  [key: string]: any;
}

const MONTH_NAMES_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic"
];

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

function formatRecordingDate(dateStr?: string | Date | null, timeText?: string | null): string {
  if (!dateStr) return timeText || "";
  try {
    const d = parseCalendarDate(dateStr);
    if (!d) return String(dateStr);

    const now = new Date();
    const sameYear = d.getFullYear() === now.getFullYear();
    const day = d.getDate();
    const month = MONTH_NAMES_ES[d.getMonth()];

    if (sameYear) {
      return `${day} de ${month}`;
    }
    return `${day} de ${month} de ${d.getFullYear()}`;
  } catch {
    return String(dateStr || "");
  }
}

function formatSpeakerName(speakerName?: string | null): string | null {
  if (!speakerName) return null;
  const clean = speakerName.trim();
  if (
    clean === "Especialista LUMINUS" ||
    clean === "Especialistas LUMINUS" ||
    clean === "Especialista" ||
    clean === "LUMINUS"
  ) {
    return null;
  }
  return clean.startsWith("Con ") ? clean : `Con ${clean}`;
}

function resolveYoutubeVideoLink(item: RecordingItem): string {
  if (item.link && (item.link.includes("watch?v=") || item.link.includes("youtu.be/"))) {
    return item.link;
  }
  if (item.youtubeId) {
    return `https://www.youtube.com/watch?v=${item.youtubeId}`;
  }
  return item.link || "https://www.youtube.com/@luminus_latam";
}

function resolveCoverThumbnail(item: RecordingItem): string {
  if (item.coverUrl && item.coverUrl.trim().length > 0) {
    return item.coverUrl;
  }
  if (item.youtubeId) {
    return `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`;
  }
  return "/luminus_events.jpg";
}

interface RecordingCardProps {
  recording: RecordingItem;
}

export function RecordingCard({ recording }: RecordingCardProps) {
  const videoLink = resolveYoutubeVideoLink(recording);
  const thumbUrl = resolveCoverThumbnail(recording);
  const displayDate = formatRecordingDate(recording.date, recording.timeText);
  const speakerText = formatSpeakerName(recording.speakerName);

  return (
    <article className="w-full h-[350px] sm:h-[370px] bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-colors overflow-hidden flex flex-col group shadow-none">
      {/* 1. Cover Thumbnail linking to YouTube */}
      <a
        href={videoLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full aspect-video relative overflow-hidden bg-slate-100 shrink-0 block hover:opacity-95 transition-opacity"
      >
        <img
          src={thumbUrl}
          alt={recording.title}
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
      </a>

      {/* 2. Card Body: Date -> Title -> Speaker -> Action Footer */}
      <div className="w-full flex-1 p-3.5 sm:p-4 flex flex-col justify-between items-start min-h-0">
        <div className="w-full flex flex-col gap-2">
          {/* Date */}
          {displayDate ? (
            <p className="text-xs font-medium text-slate-500 font-sans truncate w-full">
              {displayDate}
            </p>
          ) : (
            <div className="h-4" />
          )}

          {/* Title & Speaker */}
          <div className="flex flex-col gap-1">
            <a
              href={videoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline block group/title"
            >
              <h3 className="w-full text-sm sm:text-base font-semibold text-slate-900 leading-snug line-clamp-2 font-jakarta group-hover/title:text-slate-600 transition-colors">
                {recording.title}
              </h3>
            </a>

            {speakerText && (
              <p className="text-xs text-slate-500 truncate w-full font-sans">
                {speakerText}
              </p>
            )}
          </div>
        </div>

        {/* 3. Action Footer: Ver en YouTube with PlayCircle icon */}
        <div className="w-full mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <a
            href={videoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold font-jakarta text-slate-700 hover:text-slate-950 transition-colors"
          >
            <span>Ver en YouTube</span>
            <PlayCircle className="w-4 h-4 text-slate-500 group-hover/link:text-slate-900 shrink-0 transition-colors" />
          </a>
        </div>
      </div>
    </article>
  );
}

export default RecordingCard;
