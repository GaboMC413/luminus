import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Card } from "../ui/Card";

export interface FeatureCardProps {
  title: string;
  description: React.ReactNode;
  ctaText?: string;
  ctaLink?: string;
  isComingSoon?: boolean;
  icon: React.ReactNode;
  accentBgClass?: string;
  layout?: "vertical" | "horizontal";
}

export function FeatureCard({
  title,
  description,
  ctaText,
  ctaLink,
  isComingSoon = false,
  icon,
  accentBgClass = "bg-luminus-blue text-white",
  layout = "vertical",
}: FeatureCardProps) {
  // Determine card styling based on brand accent color (rich pastels + subtle borders)
  let customCardClass = "border-t-4 border-slate-900 bg-white/80";
  if (accentBgClass.includes("blue")) {
    customCardClass = "border-t-4 border-[#0450FB] bg-[#DCE6FF]/25 border-x-[#0450FB]/10 border-b-[#0450FB]/10 hover:bg-[#DCE6FF]/35 hover:border-x-[#0450FB]/35 hover:border-b-[#0450FB]/35";
  } else if (accentBgClass.includes("lime")) {
    customCardClass = "border-t-4 border-[#D4E600] bg-[#F4F8B8]/25 border-x-[#D4E600]/15 border-b-[#D4E600]/15 hover:bg-[#F4F8B8]/35 hover:border-x-[#D4E600]/35 hover:border-b-[#D4E600]/35";
  } else if (accentBgClass.includes("orange")) {
    customCardClass = "border-t-4 border-[#FF7700] bg-[#FFE0C2]/25 border-x-[#FF7700]/10 border-b-[#FF7700]/10 hover:bg-[#FFE0C2]/35 hover:border-x-[#FF7700]/35 hover:border-b-[#FF7700]/35";
  } else if (accentBgClass.includes("pink")) {
    customCardClass = "border-t-4 border-[#FF80FC] bg-[#FFE0FC]/25 border-x-[#FF80FC]/10 border-b-[#FF80FC]/10 hover:bg-[#FFE0FC]/35 hover:border-x-[#FF80FC]/35 hover:border-b-[#FF80FC]/35";
  }

  if (layout === "horizontal") {
    return (
      <Card
        hoverEffect={isComingSoon ? "lift" : "lift-lg"}
        className={`group flex items-start gap-4 p-6 ${customCardClass}`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50/80 text-slate-700 shadow-soft">
          {icon}
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-slate-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            {description}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      hoverEffect={isComingSoon ? "lift" : "lift-lg"}
      className={`group flex flex-col justify-between ${customCardClass}`}
    >
      <div>
        {/* Header containing Icon and optional Coming Soon Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/80 text-slate-700 shadow-soft transition-transform duration-300 group-hover:scale-105">
            {icon}
          </div>
          {isComingSoon && (
            <span className="inline-flex items-center rounded-full bg-[#FFE0FC] border border-[#FF80FC]/30 px-2.5 py-0.5 text-xs font-semibold text-[#B832B4]">
              Próximamente
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-bold tracking-tight text-slate-900 mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed text-slate-600 font-medium mb-6">
          {description}
        </p>

        {/* Dynamic Image Placeholder to Reserve Space inside Card */}
        <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 mb-6 shadow-inner">
          <Image
            src="/luminus_photo_placeholder.png"
            alt={`${title} - Vista previa`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-103"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* CTA Button */}
      {(ctaText || ctaLink) && (
        <div className="mt-auto">
          {isComingSoon ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 cursor-not-allowed">
              {ctaText}
            </span>
          ) : (
            <a 
              href={ctaLink || "#"}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800 hover:text-black transition-all duration-200"
            >
              {ctaText}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          )}
        </div>
      )}
    </Card>
  );
}
