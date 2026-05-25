import React from "react";
import { AlertTriangle, XCircle } from "lucide-react";
import { Section } from "../../ui/Section";
import { Badge } from "../../ui/Badge";

export interface ProblemSectionProps {
  id?: string;
  title: string;
  description: string;
  highlight: string;
  cardTitle: string;
  cardIcon?: React.ReactNode;
  bullets: string[];
}

export function ProblemSection({
  id,
  title,
  description,
  highlight,
  cardTitle,
  cardIcon = <AlertTriangle className="h-6 w-6" />,
  bullets,
}: ProblemSectionProps) {
  return (
    <Section id={id} borderBottom>
      {/* Ambient background blur */}
      <div className="absolute right-10 top-10 w-72 h-72 bg-luminus-orange/5 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
        
        {/* Left Column: Narrative texts */}
        <div className="lg:col-span-7 text-left flex flex-col items-start">
          <Badge variant="orange" className="mb-6">
            El Desafío Actual
          </Badge>

          <h2 className="font-display text-4xl font-black tracking-tight text-black sm:text-5xl mb-6">
            {title}
          </h2>
          <div className="space-y-6 text-base sm:text-lg leading-relaxed text-slate-700 font-semibold">
            <p>{description}</p>
            <div className="border-2 border-black border-l-8 pl-6 text-black font-bold bg-luminus-lime/15 py-4 pr-4 rounded-[2rem] shadow-bold-sm mt-4">
              {highlight}
            </div>
          </div>
        </div>

        {/* Right Column: Pain points visual card */}
        <div className="lg:col-span-5">
          <div className="rounded-[2.5rem] border-2 border-black bg-luminus-orange/10 p-8 shadow-bold-lg transition-all duration-150">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-luminus-orange border-2 border-black text-black shadow-bold-sm mb-6">
              {cardIcon}
            </div>
            <h3 className="font-display text-2xl font-black text-black mb-6">
              {cardTitle}
            </h3>
            <ul className="space-y-4">
              {bullets.map((problem, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-800 font-bold">
                  <XCircle className="h-5 w-5 shrink-0 text-black stroke-[3px] mt-0.5" />
                  <span>{problem}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </Section>
  );
}
