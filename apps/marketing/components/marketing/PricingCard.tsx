import React from "react";
import { Check } from "lucide-react";

export interface PricingCardProps {
  name: string;
  price: string;
  billing: string;
  trialBadge: string;
  discountBadge?: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  disclaimer: string;
  isPopular?: boolean;
  inclusions: string[];
}

export function PricingCard({
  name,
  price,
  billing,
  trialBadge,
  discountBadge,
  description,
  ctaText,
  ctaLink,
  disclaimer,
  isPopular = false,
  inclusions,
}: PricingCardProps) {
  return (
    <div 
      className={`relative flex flex-col justify-between rounded-3xl p-8 border border-slate-200/80 transition-all duration-300 ${
        isPopular 
          ? "luminus-card-glow shadow-medium scale-[1.02] md:scale-105 z-10 hover:-translate-y-1" 
          : "bg-white/80 shadow-soft hover:shadow-medium hover:-translate-y-1"
      }`}
    >
      {/* Top badges for discount or popular plan */}
      <div className="absolute -top-3.5 left-6 flex items-center gap-2">
        {discountBadge && (
          <span className="inline-flex items-center rounded-full bg-[#FFE0FC] px-3.5 py-1 text-[11px] font-semibold text-[#B832B4] border border-[#FF80FC]/20">
            {discountBadge}
          </span>
        )}
        {isPopular && (
          <span className="inline-flex items-center rounded-full bg-[#FFE0C2] px-3.5 py-1 text-[11px] font-semibold text-[#B84A00] border border-[#FF7700]/20">
            Recomendado
          </span>
        )}
      </div>

      <div>
        {/* Plan Title & Trial Badge */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <h3 className="font-display text-2xl font-bold text-slate-900">
            {name}
          </h3>
          <span className="inline-flex items-center rounded-full bg-[#DCE6FF] px-2.5 py-0.5 text-xs font-semibold text-[#002C9E] border border-[#0450FB]/10">
            {trialBadge}
          </span>
        </div>

        {/* Plan Pricing */}
        <div className="flex items-baseline gap-1 mb-6">
          <span className="font-display text-4xl font-bold tracking-tight text-slate-900">
            {price}
          </span>
          <span className="text-sm font-semibold text-slate-400">
            {billing}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
          {description}
        </p>

        <hr className="border-slate-100 my-6" />

        {/* Plan Inclusions */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
            ¿Qué incluye LUMINUS?
          </p>
          <ul className="space-y-3.5">
            {inclusions.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 font-medium">
                <Check className={`h-4 w-5 shrink-0 mt-0.5 ${
                  feature.startsWith("Próximamente") ? "text-slate-300" : "text-emerald-500"
                }`} />
                <span className={feature.startsWith("Próximamente") ? "text-slate-400 font-normal" : "text-slate-700"}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Button & Disclaimer */}
      <div>
        <a
          href={ctaLink}
          className={`w-full inline-flex items-center justify-center rounded-full py-3.5 px-6 text-base font-semibold transition-all duration-250 border ${
            isPopular
              ? "bg-black text-white border-black hover:bg-neutral-900 shadow-soft hover:shadow-medium hover:-translate-y-[1px]"
              : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50 shadow-soft hover:shadow-medium hover:-translate-y-[1px]"
          }`}
        >
          {ctaText}
        </a>
        
        {/* Disclaimer */}
        <p className="text-[11px] leading-relaxed text-slate-400 mt-4 text-center font-medium">
          {disclaimer}
        </p>
      </div>
    </div>
  );
}
