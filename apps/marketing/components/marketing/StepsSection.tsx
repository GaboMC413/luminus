import React from "react";
import { ArrowRight } from "lucide-react";
import { Section } from "../ui/Section";
import { SectionHeader } from "../ui/SectionHeader";
import { Button } from "../ui/Button";

export interface StepItem {
  num: string;
  title: string;
  description: string;
  numColor: string;
  badgeBg: string;
  shadowColor: string;
}

export interface StepsSectionProps {
  id?: string;
  title: React.ReactNode;
  subtitle: string;
  steps: StepItem[];
  ctaText?: string;
  ctaLink?: string;
}

export function StepsSection({
  id,
  title,
  subtitle,
  steps,
  ctaText,
  ctaLink,
}: StepsSectionProps) {
  return (
    <Section id={id} borderBottom>
      {/* Decorative background glows */}
      <div className="absolute left-0 bottom-0 w-80 h-80 bg-[#FFE0FC]/10 rounded-full blur-3xl pointer-events-none" />

      <SectionHeader title={title} subtitle={subtitle} />

      {/* Steps Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {steps.map((step, idx) => {
          // Determine brand colors based on input data
          let accentClass = "border-t-4 border-slate-900";
          if (step.numColor.includes("blue")) accentClass = "border-t-4 border-[#0450FB]";
          else if (step.numColor.includes("lime")) accentClass = "border-t-4 border-[#D4E600]";
          else if (step.numColor.includes("orange")) accentClass = "border-t-4 border-[#FF7700]";
          else if (step.numColor.includes("pink")) accentClass = "border-t-4 border-[#FF80FC]";

          return (
            <div 
              key={idx}
              className={`relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all duration-300 group ${accentClass}`}
            >
              {/* Number indicator */}
              <div className="flex items-baseline justify-between mb-8">
                <span className={`font-display text-5xl font-bold tracking-tight text-slate-300 transition-transform duration-300 group-hover:scale-105`}>
                  {step.num}
                </span>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold border bg-slate-50/50 text-slate-500 border-slate-200/60">
                  Paso {idx + 1}
                </span>
              </div>

              <div>
                {/* Title */}
                <h3 className="font-display text-xl font-bold text-slate-900 mb-3">
                  {step.title}
                </h3>
                {/* Description */}
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      {ctaText && ctaLink && (
        <div className="flex flex-col items-center justify-center animate-fadeIn">
          <Button variant="primary" href={ctaLink}>
            {ctaText}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </Section>
  );
}
