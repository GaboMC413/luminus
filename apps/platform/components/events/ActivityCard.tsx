"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";

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

interface ActivityCardProps {
  event: ActivityEventItem;
}

export function ActivityCard({ event }: ActivityCardProps) {
  const router = useRouter();
  const eventSlug = event.slug || event.id;
  const timeText = cleanTimeString(event.timeText);
  const coverUrl = event.coverUrl || "/luminus_events.jpg";

  const handleCardClick = (e: React.MouseEvent) => {
    // If the click is on an interactive link/button, let that trigger
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    router.push(`/actividades/${eventSlug}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group relative w-full bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl overflow-hidden transition-colors shadow-none cursor-pointer flex flex-col md:flex-row md:items-center"
    >
      {/* Content Side: Left on desktop, Bottom on mobile - flexible relative width up to margins */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-4 p-5 sm:p-6 lg:p-7 order-last md:order-first">
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
        <div className="flex flex-col gap-2 py-1">
          <Link
            href={`/actividades/${eventSlug}`}
            className="text-lg sm:text-xl lg:text-2xl font-bold font-jakarta text-slate-900 tracking-tight leading-snug group-hover:text-black transition-colors"
          >
            {event.title}
          </Link>

          {event.speakerName && event.speakerName.toLowerCase() !== "especialista luminus" && (
            <p className="text-sm sm:text-base font-semibold font-jakarta text-slate-700">
              Con {event.speakerName}
            </p>
          )}

          {event.description && (
            <p className="text-sm font-normal font-sans text-slate-600 line-clamp-2 leading-relaxed mt-1">
              {cleanDescriptionText(event.description)}
            </p>
          )}
        </div>

        {/* CTA Button - Aligned with other components, opens the page on the app */}
        <div className="flex justify-start pt-1">
          {event.isRegistered ? (
            <Link
              href={`/actividades/${eventSlug}`}
              className="w-full sm:w-auto h-11 px-5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-sm font-semibold font-jakarta flex items-center justify-center gap-2 transition-colors"
            >
              <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              <span>Inscripto</span>
            </Link>
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
    </article>
  );
}
