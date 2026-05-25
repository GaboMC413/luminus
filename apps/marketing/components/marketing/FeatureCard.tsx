import React from "react";
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
  if (layout === "horizontal") {
    return (
      <Card
        hoverEffect={isComingSoon ? "lift" : "lift-lg"}
        className="group flex items-start gap-4 p-6"
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black shadow-bold-sm ${accentBgClass}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-display text-lg font-black text-black mb-2">
            {title}
          </h3>
          <p className="text-sm text-slate-700 font-semibold leading-relaxed">
            {description}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      hoverEffect={isComingSoon ? "lift" : "lift-lg"}
      className="group flex flex-col justify-between"
    >
      <div>
        {/* Header containing Icon and optional Coming Soon Badge */}
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
        <p className="text-sm leading-relaxed text-slate-700 font-medium mb-8">
          {description}
        </p>
      </div>

      {/* CTA Button */}
      {(ctaText || ctaLink) && (
        <div>
          {isComingSoon ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 cursor-not-allowed">
              {ctaText}
            </span>
          ) : (
            <a 
              href={ctaLink || "#"}
              className="inline-flex items-center gap-1.5 text-sm font-extrabold text-black hover:text-luminus-blue transition-all duration-200"
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
