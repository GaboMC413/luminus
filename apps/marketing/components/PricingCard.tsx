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
  const inclusions = [
    "Acceso completo a la Comunidad",
    "Próximamente: Asistente Faro con IA",
    "Próximamente: Directorio de Expertos",
    "Próximamente: Espacios de Aprendizaje",
    "Próximamente: Mapa de bienestar Latam",
  ];

  return (
    <div 
      className={`relative flex flex-col justify-between rounded-[2.5rem] p-8 border-2 border-black bg-white transition-all duration-150 ${
        isPopular 
          ? "bg-luminus-lime/5 border-2 border-black shadow-bold-lg scale-[1.02] md:scale-105 z-10 hover:-translate-x-0.5 hover:-translate-y-0.5" 
          : "shadow-bold hover:shadow-bold-lg hover:-translate-x-0.5 hover:-translate-y-0.5"
      }`}
    >
      {/* Top badges for discount or popular plan */}
      <div className="absolute -top-4 left-6 flex items-center gap-2">
        {discountBadge && (
          <span className="inline-flex items-center rounded-full bg-luminus-pink px-3 py-1 text-xs font-black text-black border-2 border-black shadow-bold-sm">
            {discountBadge}
          </span>
        )}
        {isPopular && (
          <span className="inline-flex items-center rounded-full bg-luminus-orange px-3 py-1 text-xs font-black text-white border-2 border-black shadow-bold-sm">
            Recomendado
          </span>
        )}
      </div>

      <div>
        {/* Plan Title & Trial Badge */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <h3 className="font-display text-2xl font-black text-black">
            {name}
          </h3>
          <span className="inline-flex items-center rounded-full bg-luminus-blue-soft px-2.5 py-0.5 text-xs font-bold text-luminus-blue border border-blue-150">
            {trialBadge}
          </span>
        </div>

        {/* Plan Pricing */}
        <div className="flex items-baseline gap-1 mb-6">
          <span className="font-display text-4xl font-black tracking-tight text-black">
            {price}
          </span>
          <span className="text-sm font-bold text-slate-500">
            {billing}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-sm text-slate-700 leading-relaxed mb-6 font-semibold">
          {description}
        </p>

        <hr className="border-black/10 my-6" />

        {/* Plan Inclusions */}
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
            ¿Qué incluye LUMINUS?
          </p>
          <ul className="space-y-3.5">
            {inclusions.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 font-semibold">
                <Check className={`h-4 w-5 shrink-0 mt-0.5 ${
                  feature.startsWith("Próximamente") ? "text-slate-300" : "text-emerald-500"
                }`} />
                <span className={feature.startsWith("Próximamente") ? "text-slate-400 font-medium" : "text-black"}>
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
          className={`w-full inline-flex items-center justify-center rounded-full py-4 px-6 text-base font-bold transition-all duration-150 border-2 border-black ${
            isPopular
              ? "bg-black text-white shadow-bold hover:shadow-none hover:bg-luminus-orange hover:text-black hover:translate-x-0.5 hover:translate-y-0.5"
              : "bg-white text-black shadow-bold-sm hover:shadow-none hover:bg-slate-50 hover:translate-x-0.5 hover:translate-y-0.5"
          }`}
        >
          {ctaText}
        </a>
        
        {/* Disclaimer */}
        <p className="text-[11px] leading-relaxed text-slate-500 mt-4 text-center font-medium">
          {disclaimer}
        </p>
      </div>
    </div>
  );
}
