"use client";

import Image from "next/image";
import Link from "next/link";

export interface EventItem {
  id?: string;
  slug?: string;
  title: string;
  description?: string;
  speaker_name?: string;
  category?: string;
  date?: string;
  publishTimeText?: string;
  cover_url?: string | null;
  youtube_id?: string;
  link?: string;
  is_upcoming?: boolean;
  viewCountText?: string;
  type?: string;
  [key: string]: any;
}

interface EventCardProps {
  item: EventItem;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function getYoutubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function formatUpcomingDateHeader(dateStr?: string, timeText?: string) {
  if (!dateStr) return { tag: "PRÓXIMAMENTE", dateText: "" };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { tag: "PRÓXIMAMENTE", dateText: dateStr };

    const weekdayRaw = d.toLocaleDateString("es-ES", { weekday: "long" });
    const weekday = weekdayRaw.charAt(0).toUpperCase() + weekdayRaw.slice(1);

    const day = d.getDate();

    const monthRaw = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
    const month = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1);

    // Local converted time from Date object (no GMT label)
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const cleanTime = `${hours}:${minutes} hs`;

    return {
      tag: "PRÓXIMAMENTE",
      dateText: `${weekday} ${day} de ${month}. ${cleanTime}`,
    };
  } catch {
    return { tag: "PRÓXIMAMENTE", dateText: dateStr || "" };
  }
}

function isSpeakerNameValid(speakerName?: string, title?: string) {
  if (!speakerName) return false;
  const cleanName = speakerName.trim();
  if (
    cleanName === "Especialista LUMINUS" ||
    cleanName === "Especialistas LUMINUS" ||
    cleanName === "Especialista" ||
    cleanName === "LUMINUS"
  ) {
    return false;
  }
  if (title) {
    const cleanTitle = title.trim().toLowerCase();
    const cleanSpeaker = cleanName.toLowerCase();
    if (cleanTitle === cleanSpeaker) return false;
    if (cleanSpeaker.length >= 4 && cleanTitle.includes(cleanSpeaker)) return false;
  }
  return true;
}

export function EventCard({ item }: EventCardProps) {
  const ytId = item.youtube_id || getYoutubeId(item.link) || "";
  const thumbUrl =
    item.cover_url ||
    (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "/placeholder-video.jpg");
  const isUpcoming = item.is_upcoming === true || (Boolean(item.date) && !isNaN(new Date(item.date!).getTime()) && new Date(item.date!) >= new Date());
  const upcomingHeader = isUpcoming ? formatUpcomingDateHeader(item.date, item.time_text) : { tag: "", dateText: "" };
  const displayDate = isUpcoming ? upcomingHeader.dateText : (item.date ? formatDate(item.date) : item.publishTimeText || "");
  const videoLink = item.link || (ytId ? `https://www.youtube.com/watch?v=${ytId}` : undefined);
  const hasVideo = Boolean(ytId || videoLink);

  return (
    <div className="w-full h-[390px] bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors overflow-hidden flex flex-col group shadow-none">

      {/* Thumbnail — edge-to-edge, no extra border radius */}
      {hasVideo && videoLink ? (
        <a
          href={videoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full aspect-video relative overflow-hidden bg-slate-200 shrink-0 block hover:opacity-95 transition-opacity"
        >
          <Image
            src={thumbUrl}
            alt={item.title}
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        </a>
      ) : (
        <div className="w-full aspect-video relative overflow-hidden bg-slate-200 shrink-0 block">
          <Image
            src={thumbUrl}
            alt={item.title}
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        </div>
      )}

      {/* Content */}
      <div className="w-full flex-1 p-4 flex flex-col justify-between items-start gap-3">
        <div className="w-full flex flex-col gap-2">
          {/* 1. Date / PROXIMAMENTE at the top */}
          {isUpcoming ? (
            <div className="w-full flex justify-start items-center gap-1.5 text-xs font-medium truncate h-4">
              <span className="font-medium text-slate-900 tracking-tight shrink-0">
                {upcomingHeader.tag}
              </span>
              <span className="text-slate-500 truncate">
                {upcomingHeader.dateText}
              </span>
            </div>
          ) : displayDate ? (
            <div className="w-full flex justify-start items-center text-xs font-medium text-slate-500 h-4">
              <span>{displayDate}</span>
            </div>
          ) : (
            <div className="h-4" />
          )}

          {/* 2. Title */}
          {hasVideo && videoLink ? (
            <a
              href={videoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline hover:text-red-600 transition-colors block"
            >
              <h3 className="w-full text-base font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[44px]">
                {item.title}
              </h3>
            </a>
          ) : (
            <h3 className="w-full text-base font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[44px]">
              {item.title}
            </h3>
          )}

          {/* 3. Speaker name below title - fixed height slot for exact alignment */}
          <div className="h-5 flex items-center">
            {isSpeakerNameValid(item.speaker_name, item.title) && (
              <span className="text-xs font-medium text-slate-500 truncate max-w-full">
                Con {item.speaker_name!.startsWith('Con ') ? item.speaker_name!.slice(4) : item.speaker_name}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="inline-flex justify-start items-center mt-auto pt-3 border-t border-slate-100 w-full">
          {hasVideo && videoLink ? (
            <a
              href={videoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 no-underline leading-5 hover:text-red-600 transition-colors"
            >
              <span>Ver en YouTube</span>
              <div
                style={{
                  maskImage: "url('/Icons/play_circle_24dp_000000_FILL0_wght300_GRAD0_opsz24.svg')",
                  WebkitMaskImage: "url('/Icons/play_circle_24dp_000000_FILL0_wght300_GRAD0_opsz24.svg')",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                }}
                className="w-5 h-5 bg-slate-900 group-hover/link:bg-red-600 shrink-0 transition-colors"
              />
            </a>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-500">
              Este evento ya pasó
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
