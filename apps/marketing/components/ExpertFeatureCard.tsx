import React from "react";
import { ArrowRight } from "lucide-react";

interface ExpertFeatureCardProps {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  isComingSoon?: boolean;
  icon: React.ReactNode;
}

export default function ExpertFeatureCard({
  title,
  description,
  ctaText,
  ctaLink,
  isComingSoon = false,
  icon,
}: ExpertFeatureCardProps) {
  return (
    <div 
      className={`group relative flex flex-col justify-between rounded-3xl border p-8 bg-white transition-all duration-300 ${
        isComingSoon 
          ? "border-slate-100 hover:border-slate-200 hover:shadow-premium" 
          : "border-slate-200 hover:border-luminus-blue/20 hover:shadow-premium-hover"
      }`}
    >
      <div>
        {/* Header (Icon + Optional Coming Soon Badge) */}
        <div className="flex items-center justify-between mb-6">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors duration-300 ${
            isComingSoon 
              ? "border-slate-100 bg-slate-50 text-slate-400 group-hover:bg-slate-100" 
              : "border-luminus-blue/10 bg-luminus-blue-soft text-luminus-blue group-hover:bg-blue-100"
          }`}>
            {icon}
          </div>
          {isComingSoon && (
            <span className="inline-flex items-center rounded-full bg-luminus-mint-soft px-2.5 py-0.5 text-xs font-semibold text-luminus-mint-text border border-teal-100">
              Próximamente
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-xl font-bold tracking-tight text-luminus-text mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed text-luminus-secondary mb-8">
          {description}
        </p>
      </div>

      {/* Action CTA */}
      <div>
        {isComingSoon ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 cursor-not-allowed">
            {ctaText}
          </span>
        ) : (
          <a 
            href={ctaLink}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-luminus-blue hover:text-blue-700 transition-all duration-200"
          >
            {ctaText}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        )}
      </div>
    </div>
  );
}
