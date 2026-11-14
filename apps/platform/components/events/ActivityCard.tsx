"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, TvMinimalPlay } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export interface ActivityEventItem {
  id: string;
  slug?: string | null;
  title: string;
  description: string;
  speakerName?: string | null;
  speakerBio?: string | null;
  category?: string | null;
  coverUrl?: string | null;
  date?: string | null;
  timeText?: string | null;
  location?: string | null;
  link?: string | null;
  youtubeId?: string | null;
  isUpcoming?: boolean;
  isRegistered?: boolean;
}

function cleanTimeString(timeText?: string | null): string {
  if (!timeText) return "18:00 hs";
  return (
    timeText
      .replace(/\s*\([^)]*GMT[^)]*\)/gi, "")
      .replace(/\s*\([^)]*UTC[^)]*\)/gi, "")
      .replace(/\s*GMT[+-]?\d*/gi, "")
      .replace(/\s*UTC[+-]?\d*/gi, "")
      .trim() || "18:00 hs"
  );
}

function cleanDescriptionText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
}

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

function resolveYoutubeUrl(event: ActivityEventItem): string | null {
  if (event.youtubeId) {
    return `https://www.youtube.com/watch?v=${event.youtubeId}`;
  }
  if (event.link && (event.link.includes("youtube.com") || event.link.includes("youtu.be"))) {
    return event.link;
  }
  return null;
}

interface ActivityCardProps {
  event: ActivityEventItem;
  onRequestCancel?: (event: ActivityEventItem) => void;
}

export function ActivityCard({ event, onRequestCancel }: ActivityCardProps) {
  const router = useRouter();
  const eventSlug = event.slug || event.id;
  const timeText = cleanTimeString(event.timeText);
  const coverUrl = event.coverUrl || "/luminus_events.jpg";
  const isPast = isEventPast(event);
  const youtubeUrl = isPast ? resolveYoutubeUrl(event) : null;
  const isInteractive = !isPast || Boolean(youtubeUrl);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    if (isPast) {
      if (youtubeUrl) {
        window.open(youtubeUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }
    router.push(`/actividades/${eventSlug}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group relative w-full bg-white border border-slate-200/90 rounded-2xl overflow-hidden transition-colors shadow-none flex flex-col md:flex-row md:items-stretch ${
        isInteractive ? "hover:border-slate-300 cursor-pointer" : "cursor-default"
      }`}
    >
      {/* Content Side: Left on desktop, Bottom on mobile */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5 p-5 lg:p-6 order-last md:order-first">
        {/* Top Badges (Time & Location / Status Badge - simple, no icons, no category) */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-base sm:text-lg font-bold font-jakarta text-slate-900 leading-none">
            {timeText}
          </span>

          {event.location && (
            <span className="inline-flex items-center justify-center px-3.5 py-1 bg-slate-50 text-slate-700 rounded-full text-xs font-medium font-jakarta border border-slate-200">
              {event.location}
            </span>
          )}
        </div>

        {/* Title, Speaker & Description */}
        <div className="flex flex-col gap-1.5">
          {!isPast ? (
            <Link
              href={`/actividades/${eventSlug}`}
              className="text-lg sm:text-xl font-bold font-jakarta text-slate-900 tracking-tight leading-snug line-clamp-2 group-hover:text-black transition-colors"
            >
              {event.title}
            </Link>
          ) : youtubeUrl ? (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg sm:text-xl font-bold font-jakarta text-slate-900 tracking-tight leading-snug line-clamp-2 group-hover:text-black transition-colors"
            >
              {event.title}
            </a>
          ) : (
            <span className="text-lg sm:text-xl font-bold font-jakarta text-slate-900 tracking-tight leading-snug line-clamp-2">
              {event.title}
            </span>
          )}

          {event.speakerName && event.speakerName.toLowerCase() !== "especialista luminus" && (
            <p className="text-sm sm:text-base font-semibold font-jakarta text-slate-700 truncate">
              Con {event.speakerName}
            </p>
          )}

          {event.description && (
            <p className="text-sm font-normal font-sans text-slate-600 line-clamp-2 leading-relaxed">
              {cleanDescriptionText(event.description)}
            </p>
          )}
        </div>

        {/* CTA Button */}
        <div className="flex justify-start pt-0.5">
          {isPast ? (
            youtubeUrl ? (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-11 px-5 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-semibold font-jakarta flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-none"
              >
                <TvMinimalPlay className="w-4 h-4" />
                <span>Ver grabación en YouTube</span>
              </a>
            ) : (
              <span className="w-full sm:w-auto h-11 px-5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm font-semibold font-jakarta flex items-center justify-center">
                Actividad finalizada
              </span>
            )
          ) : event.isRegistered ? (
            onRequestCancel ? (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestCancel(event);
                }}
                className="w-full sm:w-auto bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-800 hover:text-emerald-900"
                title="Presiona para cancelar tu inscripción"
              >
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>Inscripto</span>
              </Button>
            ) : (
              <Link
                href={`/actividades/${eventSlug}`}
                className="w-full sm:w-auto h-11 px-5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-sm font-semibold font-jakarta flex items-center justify-center gap-2 transition-colors"
              >
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>Inscripto</span>
              </Link>
            )
          ) : (
            <Link
              href={`/actividades/${eventSlug}`}
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-semibold font-jakarta flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-none"
            >
              <span>Inscribirme</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Media Side: Right on desktop, Top on mobile - strictly 16:9 aspect-video like YouTube */}
      {!isPast ? (
        <Link
          href={`/actividades/${eventSlug}`}
          className="w-full md:w-[420px] lg:w-[480px] xl:w-[500px] shrink-0 aspect-video relative overflow-hidden bg-slate-100 order-first md:order-last block"
        >
          <Image
            src={coverUrl}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 480px, 500px"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
            unoptimized
          />
        </Link>
      ) : youtubeUrl ? (
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-[420px] lg:w-[480px] xl:w-[500px] shrink-0 aspect-video relative overflow-hidden bg-slate-100 order-first md:order-last block"
        >
          <Image
            src={coverUrl}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 480px, 500px"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
            unoptimized
          />
        </a>
      ) : (
        <div className="w-full md:w-[420px] lg:w-[480px] xl:w-[500px] shrink-0 aspect-video relative overflow-hidden bg-slate-100 order-first md:order-last block">
          <Image
            src={coverUrl}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 480px, 500px"
            className="object-cover object-center"
            unoptimized
          />
        </div>
      )}
    </article>
  );
}

/**
 * Co-located 1:1 skeleton for ActivityCard.
 * Matches exact responsive order (media top on mobile, right on desktop),
 * padding, line counts (2-line title, speaker, 2-line description), and 16:9 cover dimensions.
 */
export function ActivityCardSkeleton() {
  return (
    <article className="w-full bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-none flex flex-col md:flex-row md:items-stretch">
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5 p-5 lg:p-6 order-last md:order-first">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-6 w-40 rounded-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-6 sm:h-7 w-4/5 rounded-md" />
          <Skeleton className="h-6 sm:h-7 w-2/5 rounded-md" />
          <Skeleton className="h-4 w-44 rounded-md mt-0.5" />
          <Skeleton className="h-3.5 w-full rounded-md mt-1" />
          <Skeleton className="h-3.5 w-5/6 rounded-md" />
        </div>
        <div className="flex justify-start pt-0.5">
          <Skeleton className="w-full sm:w-36 h-11 rounded-xl" />
        </div>
      </div>
      <Skeleton className="w-full md:w-[420px] lg:w-[480px] xl:w-[500px] shrink-0 aspect-video rounded-none order-first md:order-last" />
    </article>
  );
}
