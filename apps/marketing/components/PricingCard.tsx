import React from "react";
import { Check } from "lucide-react";

interface PricingCardProps {
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
}

export default function PricingCard({
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
}: PricingCardProps) {
  // Features included in the platform
  const inclusions = [
    "Acceso completo a la Comunidad",
    "Próximamente: Asistente Faro con IA",
    "Próximamente: Directorio de Expertos",
    "Próximamente: Espacios de Aprendizaje",
    "Próximamente: Mapa de bienestar Latam",
  ];

  return (
    <div 
      className={`relative flex flex-col justify-between rounded-3xl p-8 bg-white border transition-all duration-300 ${
        isPopular 
          ? "border-luminus-blue/40 shadow-premium-hover scale-[1.02] md:scale-105 z-10" 
          : "border-slate-200 shadow-premium hover:border-slate-300"
      }`}
    >
      {/* Top badges for discount or popular plan */}
      <div className="absolute -top-4 left-6 flex items-center gap-2">
        {discountBadge && (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200 shadow-sm animate-pulse">
            {discountBadge}
          </span>
        )}
        {isPopular && (
          <span className="inline-flex items-center rounded-full bg-luminus-blue px-3 py-1 text-xs font-bold text-white shadow-sm">
            Recomendado
          </span>
        )}
      </div>

      <div>
        {/* Plan Title & Trial Badge */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <h3 className="font-display text-2xl font-bold text-luminus-text">
            {name}
          </h3>
          <span className="inline-flex items-center rounded-full bg-luminus-blue-soft px-2.5 py-0.5 text-xs font-semibold text-luminus-blue border border-blue-100">
            {trialBadge}
          </span>
        </div>

        {/* Plan Pricing */}
        <div className="flex items-baseline gap-1 mb-6">
          <span className="font-display text-4xl font-extrabold tracking-tight text-luminus-text">
            {price}
          </span>
          <span className="text-sm font-medium text-luminus-secondary">
            {billing}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-sm text-luminus-secondary leading-relaxed mb-6">
          {description}
        </p>

        <hr className="border-slate-100 my-6" />

        {/* Plan Inclusions */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            ¿Qué incluye LUMINUS?
          </p>
          <ul className="space-y-3.5">
            {inclusions.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-luminus-secondary">
                <Check className={`h-4 w-5 shrink-0 mt-0.5 ${
                  feature.startsWith("Próximamente") ? "text-slate-300" : "text-teal-600"
                }`} />
                <span className={feature.startsWith("Próximamente") ? "text-slate-400" : ""}>
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
          className={`w-full inline-flex items-center justify-center rounded-2xl py-4 px-6 text-base font-bold transition-all duration-200 ${
            isPopular
              ? "bg-luminus-blue text-white shadow-accent hover:shadow-accent-hover hover:bg-blue-700 hover:-translate-y-0.5"
              : "border border-slate-200 bg-white text-luminus-text hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          {ctaText}
        </a>
        
        {/* Disclaimer */}
        <p className="text-[11px] leading-relaxed text-slate-400 mt-4 text-center">
          {disclaimer}
        </p>
      </div>
    </div>
  );
}
