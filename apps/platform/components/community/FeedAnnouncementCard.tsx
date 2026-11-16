"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

type AnnouncementVariant = "specialist" | "space" | "dark";

const VARIANT_STYLES: Record<
  AnnouncementVariant,
  {
    card: string;
    iconWrap: string;
    title: string;
    description: string;
    button: string;
  }
> = {
  specialist: {
    card: "bg-[#0450FB]/[0.06] border border-[#0450FB]/20",
    iconWrap: "bg-[#0450FB]/12 text-[#0450FB]",
    title: "text-slate-900",
    description: "text-slate-600",
    button: "!bg-[#0450FB] hover:!bg-[#0342D6] !text-white",
  },
  space: {
    card: "bg-[#A8C800]/[0.12] border border-[#A8C800]/35",
    iconWrap: "bg-[#A8C800]/25 text-slate-900",
    title: "text-slate-900",
    description: "text-slate-700",
    button: "!bg-[#A8C800] hover:!bg-[#95B200] !text-slate-900",
  },
  dark: {
    card: "bg-slate-900 border border-slate-900",
    iconWrap: "bg-white/10 text-white",
    title: "text-white",
    description: "text-slate-300",
    button: "!bg-white hover:!bg-slate-100 !text-slate-900",
  },
};

interface FeedAnnouncementCardProps {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  icon?: LucideIcon;
  image?: string;
  variant?: AnnouncementVariant;
}

/**
 * Inline announcement card for promoting LUMINUS platform actions inside the community feed.
 */
export function FeedAnnouncementCard({
  title,
  description,
  ctaLabel,
  ctaHref,
  icon: Icon,
  image,
  variant = "dark",
}: FeedAnnouncementCardProps) {
  const styles = VARIANT_STYLES[variant];

  if (image) {
    return (
      <section className={`w-full rounded-2xl overflow-hidden flex flex-col sm:flex-row items-stretch ${styles.card}`}>
        <div className="relative w-full h-44 sm:w-48 sm:h-auto shrink-0 overflow-hidden bg-slate-100">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, 192px"
          />
        </div>

        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between gap-4 min-w-0">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {Icon && (
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${styles.iconWrap}`}>
                  <Icon className="w-4 h-4" />
                </div>
              )}
              <h3 className={`text-base sm:text-lg font-bold font-jakarta leading-snug ${styles.title}`}>
                {title}
              </h3>
            </div>
            <p className={`text-sm font-sans leading-relaxed ${styles.description}`}>
              {description}
            </p>
          </div>

          <Link href={ctaHref} className="w-full sm:w-auto sm:self-start">
            <Button variant="primary" size="md" className={`w-full sm:w-auto gap-2 ${styles.button}`}>
              <span>{ctaLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={`w-full rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${styles.card}`}>
      <div className="flex items-start gap-3.5 min-w-0">
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${styles.iconWrap}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className={`text-base font-bold font-jakarta leading-snug ${styles.title}`}>
            {title}
          </h3>
          <p className={`text-sm font-sans leading-relaxed ${styles.description}`}>
            {description}
          </p>
        </div>
      </div>

      <Link href={ctaHref} className="shrink-0 w-full sm:w-auto">
        <Button variant="primary" size="md" className={`w-full sm:w-auto gap-2 ${styles.button}`}>
          <span>{ctaLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </section>
  );
}

export default FeedAnnouncementCard;
