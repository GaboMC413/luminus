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

import Image from "next/image";

export function BenefitsGrid({
  id,
  tagline,
  title,
  subtitle,
  items,
}: BenefitsGridProps) {
  return (
    <section id={id} className="py-28 bg-slate-50/50 border-b border-slate-100 relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-[#FFE0FC]/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute left-10 bottom-10 w-80 h-80 bg-[#F4F8B8]/30 rounded-full blur-[80px] pointer-events-none" />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:items-start">
          
          {/* Headline and Photo Placeholder */}
          <div className="lg:col-span-5 text-left flex flex-col gap-8">
            <div>
              {tagline && (
                <span className="text-xs font-semibold uppercase tracking-wider text-[#FF7700] mb-3 block">
                  {tagline}
                </span>
              )}
              <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6 leading-[1.1]">
                {title}
              </h2>
              {subtitle && (
                <p className="text-base sm:text-lg leading-relaxed text-slate-600 font-medium whitespace-pre-line">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Photo placeholder reserving space under the manifesto text */}
            <div className="relative w-full aspect-[16/10] rounded-3xl p-2.5 bg-white border border-slate-200/60 shadow-soft transition-all duration-300 hover:shadow-medium">
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                <Image
                  src="/luminus_photo_placeholder.png"
                  alt="Acompañamiento en LUMINUS"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Core Benefit Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:pt-4">
            {items.map((benefit, idx) => {
              // Determine card colors based on input data
              let accentClass = "border-t-4 border-slate-900";
              let iconWrapClass = "bg-slate-50 text-slate-700 border-slate-200/60";
              
              if (benefit.iconBg.includes("pink")) {
                accentClass = "border-t-4 border-[#FF80FC]";
                iconWrapClass = "bg-[#FFE0FC] text-[#B832B4] border-[#FF80FC]/10";
              } else if (benefit.iconBg.includes("orange")) {
                accentClass = "border-t-4 border-[#FF7700]";
                iconWrapClass = "bg-[#FFE0C2] text-[#B84A00] border-[#FF7700]/10";
              } else if (benefit.iconBg.includes("blue")) {
                accentClass = "border-t-4 border-[#0450FB]";
                iconWrapClass = "bg-[#DCE6FF] text-[#002C9E] border-[#0450FB]/10";
              }

              return (
                <div 
                  key={idx}
                  className={`flex flex-col items-start p-6 rounded-3xl bg-white border border-slate-200/60 shadow-soft transition-all duration-300 hover:shadow-medium hover:-translate-y-1 ${accentClass}`}
                >
                  {/* Icon wrapper */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border mb-5 ${iconWrapClass}`}>
                    {benefit.icon}
                  </div>
                  
                  {/* Benefit Name */}
                  <h3 className="font-display text-base font-bold text-slate-900 mb-2">
                    {benefit.title}
                  </h3>
                  
                  {/* Benefit Description */}
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </Container>
    </section>
  );
}
