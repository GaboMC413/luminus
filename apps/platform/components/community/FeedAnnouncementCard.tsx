"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FeedAnnouncementCardProps {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  icon: LucideIcon;
}

/**
 * Clean inline announcement card for promoting LUMINUS platform actions inside the community feed.
 */
export function FeedAnnouncementCard({
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
  icon: Icon,
}: FeedAnnouncementCardProps) {
  return (
    <section className="w-full bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-jakarta">
            {eyebrow}
          </span>
          <h3 className="text-base font-semibold text-slate-900 font-jakarta leading-snug">
            {title}
          </h3>
          <p className="text-sm text-slate-600 font-sans leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <Link href={ctaHref} className="shrink-0 w-full sm:w-auto">
        <Button variant="soft" size="sm" className="w-full sm:w-auto gap-1.5">
          <span>{ctaLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </section>
  );
}

export default FeedAnnouncementCard;
