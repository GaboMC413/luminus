import React from "react";
import { ArrowRight } from "lucide-react";

interface ExpertFeatureCardProps {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  isComingSoon?: boolean;
  icon: React.ReactNode;
  accentBgClass?: string;
}

export default function ExpertFeatureCard({
  title,
  description,
  ctaText,
  ctaLink,
  isComingSoon = false,
  icon,
  accentBgClass = "bg-luminus-blue text-white",
}: ExpertFeatureCardProps) {
  return (
    <div 
      className={`group relative flex flex-col justify-between rounded-[2.5rem] border-2 border-black p-8 bg-white transition-all duration-150 ${
        isComingSoon 
          ? "hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5" 
          : "hover:shadow-bold-lg hover:-translate-x-1 hover:-translate-y-1"
      }`}
    >
      <div>
        {/* Header (Icon + Optional Coming Soon Badge) */}
        <div className="flex items-center justify-between mb-6">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black shadow-bold-sm transition-transform duration-200 group-hover:scale-110 ${accentBgClass}`}>
            {icon}
          </div>
          {isComingSoon && (
            <span className="inline-flex items-center rounded-full bg-luminus-pink border-2 border-black px-2.5 py-0.5 text-xs font-black text-black shadow-bold-sm">
              Próximamente
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-xl font-black tracking-tight text-black mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed text-slate-700 font-semibold mb-8">
          {description}
        </p>
      </div>

      {/* Action CTA */}
      <div>
        {isComingSoon ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 cursor-not-allowed">
            {ctaText}
          </span>
        ) : (
          <a 
            href={ctaLink}
            className="inline-flex items-center gap-1.5 text-sm font-extrabold text-black hover:text-luminus-blue transition-all duration-200 group/link"
          >
            {ctaText}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1" />
          </a>
        )}
      </div>
    </div>
  );
}
