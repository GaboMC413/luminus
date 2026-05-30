import React from "react";
import { CheckCircle, Info, Sparkles } from "lucide-react";
import { Section } from "../../ui/Section";
import { Badge } from "../../ui/Badge";

export interface PlatformSectionProps {
  id?: string;
  badge: string;
  title: string;
  description: string;
  disclaimer: string;
  cardTitle: string;
  modules: string[];
}

export function PlatformSection({
  id,
  badge,
  title,
  description,
  disclaimer,
  cardTitle,
  modules,
}: PlatformSectionProps) {
  return (
    <Section id={id} borderBottom>
      {/* Decorative backdrop glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 bg-[#FFE0FC]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-4xl">
        <div className="card rounded-3xl border border-slate-200/80 bg-white/80 p-8 md:p-12 shadow-soft hover:shadow-medium transition-all duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            
            {/* Left side: narrative */}
            <div className="md:col-span-7 text-left flex flex-col items-start">
              <Badge variant="lime" className="mb-6">
                {badge}
              </Badge>

              <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl mb-4 leading-snug">
                {title}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 font-medium mb-6">
                {description}
              </p>
              
              {/* Disclaimer Note */}
              <div className="flex gap-2.5 items-start rounded-2xl bg-[#FFE0C2]/30 border border-[#FF7700]/25 p-4 text-xs text-[#B84A00] shadow-soft">
                <Info className="h-5 w-5 shrink-0 text-[#FF7700] mt-0.5" />
                <p className="leading-relaxed font-semibold">
                  {disclaimer}
                </p>
              </div>
            </div>

            {/* Right side: Modules Checklist */}
            <div className="md:col-span-5 rounded-3xl bg-[#FFE0FC]/30 p-6 border border-[#FF80FC]/20 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#B832B4] animate-pulse" />
                {cardTitle}
              </p>
              <ul className="space-y-3.5">
                {modules.map((mod, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 font-medium">
                    <CheckCircle className="h-5 w-5 shrink-0 text-[#B832B4] stroke-[2px] mt-0.5" />
                    <span>{mod}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </div>
    </Section>
  );
}
