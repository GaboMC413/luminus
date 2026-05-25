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
      <div className="absolute left-0 bottom-0 w-80 h-80 bg-luminus-pink/5 rounded-full blur-3xl pointer-events-none" />

      <SectionHeader title={title} subtitle={subtitle} />

      {/* Steps Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {steps.map((step, idx) => (
          <div 
            key={idx}
            className={`relative flex flex-col justify-between rounded-[2.5rem] border-2 border-black bg-white p-8 ${step.shadowColor} hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 group`}
          >
            {/* Number indicator */}
            <div className="flex items-baseline justify-between mb-8">
              <span className={`font-display text-6xl font-black tracking-tight ${step.numColor} transition-transform duration-200 group-hover:scale-110`}>
                {step.num}
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black border-2 border-black shadow-bold-sm ${step.badgeBg}`}>
                Paso {idx + 1}
              </span>
            </div>

            <div>
              {/* Title */}
              <h3 className="font-display text-2xl font-black text-black mb-3">
                {step.title}
              </h3>
              {/* Description */}
              <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      {ctaText && ctaLink && (
        <div className="flex flex-col items-center justify-center">
          <Button variant="primary" href={ctaLink}>
            {ctaText}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </Section>
  );
}
