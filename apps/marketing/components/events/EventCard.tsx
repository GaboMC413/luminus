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

export function EventCard({ item }: EventCardProps) {
  const ytId = item.youtube_id || getYoutubeId(item.link) || "";
  const thumbUrl =
    item.cover_url ||
    (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "/placeholder-video.jpg");
  const displayDate = item.date ? formatDate(item.date) : item.publishTimeText || "";
  const videoLink = item.link || (ytId ? `https://www.youtube.com/watch?v=${ytId}` : undefined);
  const hasVideo = Boolean(ytId || videoLink);

  return (
    <div className="w-full min-h-[370px] sm:min-h-[340px] h-full bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors overflow-hidden flex flex-col group shadow-none">

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

          {/* Speaker + Date row */}
          <div className="w-full flex justify-between items-center text-xs text-slate-500 font-medium">
            <span className="truncate max-w-[150px] sm:max-w-[200px]">
              {item.speaker_name || "Especialista LUMINUS"}
            </span>
            {displayDate && <span>{displayDate}</span>}
          </div>

          {/* Title */}
          {hasVideo && videoLink ? (
            <a
              href={videoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline hover:text-red-600 transition-colors block"
            >
              <h3 className="w-full text-base font-semibold text-slate-900 leading-snug line-clamp-2">
                {item.title}
              </h3>
            </a>
          ) : (
            <h3 className="w-full text-base font-semibold text-slate-900 leading-snug line-clamp-2">
              {item.title}
            </h3>
          )}
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
