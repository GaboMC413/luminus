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
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 bg-luminus-pink/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-4xl">
        <div className="rounded-[2.5rem] border-2 border-black bg-white p-8 md:p-12 shadow-bold-lg">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            
            {/* Left side: narrative */}
            <div className="md:col-span-7 text-left flex flex-col items-start">
              <Badge variant="lime" className="mb-6">
                {badge}
              </Badge>

              <h2 className="font-display text-3xl font-black text-black sm:text-4xl mb-4">
                {title}
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 font-semibold mb-6">
                {description}
              </p>
              
              {/* Disclaimer Note */}
              <div className="flex gap-2.5 items-start rounded-2xl bg-luminus-orange/10 border-2 border-black p-4 text-xs text-black shadow-bold-sm">
                <Info className="h-5 w-5 shrink-0 text-black mt-0.5" />
                <p className="leading-relaxed font-bold">
                  {disclaimer}
                </p>
              </div>
            </div>

            {/* Right side: Modules Checklist */}
            <div className="md:col-span-5 rounded-[2rem] bg-luminus-pink/15 p-6 border-2 border-black shadow-bold-sm">
              <p className="text-xs font-black uppercase tracking-wider text-black mb-4 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-luminus-orange animate-pulse" />
                {cardTitle}
              </p>
              <ul className="space-y-3.5">
                {modules.map((mod, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-800 font-bold">
                    <CheckCircle className="h-5 w-5 shrink-0 text-black stroke-[2.5px] mt-0.5" />
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
