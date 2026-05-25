import React from "react";
import { Container } from "../ui/Container";

export interface BenefitItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  cardClass: string;
  iconBg: string;
}

export interface BenefitsGridProps {
  id?: string;
  tagline?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  items: BenefitItem[];
}

export function BenefitsGrid({
  id,
  tagline,
  title,
  subtitle,
  items,
}: BenefitsGridProps) {
  return (
    <section id={id} className="py-24 bg-white border-b-2 border-black relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-luminus-pink/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-10 bottom-10 w-48 h-48 bg-luminus-lime/5 rounded-full blur-2xl pointer-events-none" />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-center">
          
          {/* Headline */}
          <div className="lg:col-span-5 text-left">
            {tagline && (
              <span className="text-xs font-bold uppercase tracking-wider text-luminus-orange mb-3 block">
                {tagline}
              </span>
            )}
            <h2 className="font-display text-4xl font-black tracking-tight text-black sm:text-5xl mb-6">
              {title}
            </h2>
            {subtitle && (
              <p className="text-base sm:text-lg leading-relaxed text-slate-700 font-bold">
                {subtitle}
              </p>
            )}
          </div>

          {/* Core Benefit Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {items.map((benefit, idx) => (
              <div 
                key={idx}
                className={`flex flex-col items-start p-6 rounded-[2rem] hover:-translate-x-0.5 hover:-translate-y-0.5 ${benefit.cardClass}`}
              >
                {/* Icon wrapper */}
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-bold-sm mb-5 ${benefit.iconBg}`}>
                  {benefit.icon}
                </div>
                
                {/* Benefit Name */}
                <h3 className="font-display text-base font-black text-black mb-2">
                  {benefit.title}
                </h3>
                
                {/* Benefit Description */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </Container>
    </section>
  );
}
