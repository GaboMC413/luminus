import React from "react";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import { Section } from "../ui/Section";
import { SectionHeader } from "../ui/SectionHeader";

export interface ComparisonColumnProps {
  badgeText: string;
  badgeBg: string;
  title: string;
  description: string;
  bullets: string[];
  isHighlighted?: boolean;
  highlightBadgeText?: string;
  highlightBadgeIcon?: React.ReactNode;
}

export interface ComparisonSectionProps {
  id?: string;
  title: React.ReactNode;
  subtitle: string;
  columns: ComparisonColumnProps[];
}

export function ComparisonSection({
  id,
  title,
  subtitle,
  columns,
}: ComparisonSectionProps) {
  return (
    <Section id={id} borderBottom>
      {/* Decorative radial gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-radial from-luminus-orange/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <SectionHeader title={title} subtitle={subtitle} />

      {/* Comparison Columns Grid */}
      <div className="mx-auto grid max-w-md grid-cols-1 gap-12 md:max-w-4xl md:grid-cols-2 md:gap-8 lg:gap-12 items-stretch">
        {columns.map((col, idx) => {
          if (col.isHighlighted) {
            return (
              <div key={idx} className="relative flex flex-col justify-between rounded-[2.5rem] p-8 md:p-10 bg-luminus-pink/10 border-2 border-black shadow-bold-lg hover:-translate-y-1 transition-all duration-150">
                {col.highlightBadgeText && (
                  <div className="absolute -top-4 left-6 flex items-center gap-1.5 rounded-full bg-black border-2 border-black px-4 py-1.5 text-xs font-black text-white shadow-bold-sm">
                    {col.highlightBadgeIcon || <Sparkles className="h-3.5 w-3.5 text-luminus-orange" />}
                    <span>{col.highlightBadgeText}</span>
                  </div>
                )}
                <div>
                  <div className="mb-6 mt-2 flex flex-col items-start">
                    <span className={`inline-flex items-center rounded-full border-2 border-black px-3 py-1 text-xs font-black text-black shadow-bold-sm mb-4 ${col.badgeBg}`}>
                      {col.badgeText}
                    </span>
                    <h3 className="font-display text-2xl font-black text-black">
                      {col.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-700 font-black mb-6 leading-relaxed">
                    {col.description}
                  </p>
                  <ul className="space-y-4">
                    {col.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-3 text-sm text-slate-900 font-bold">
                        <Check className="h-5 w-5 shrink-0 text-black stroke-[3px] mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          }

          return (
            <div key={idx} className="flex flex-col justify-between rounded-[2.5rem] p-8 md:p-10 bg-white border-2 border-black shadow-bold hover:shadow-bold-lg transition-all duration-150">
              <div>
                <div className="mb-6 flex flex-col items-start">
                  <span className={`inline-flex items-center rounded-full border-2 border-black px-3 py-1 text-xs font-black text-black shadow-bold-sm mb-4 ${col.badgeBg}`}>
                    {col.badgeText}
                  </span>
                  <h3 className="font-display text-2xl font-black text-black">
                    {col.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-700 font-semibold mb-6 leading-relaxed">
                  {col.description}
                </p>
                <ul className="space-y-4">
                  {col.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-3 text-sm text-slate-700 font-semibold">
                      <ChevronRight className="h-5 w-5 shrink-0 text-black stroke-[3px] mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
