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

import Image from "next/image";

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
      <div className="absolute right-10 top-10 w-96 h-96 bg-[#FFE0C2]/25 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
        
        {/* Left Column: Narrative texts */}
        <div className="lg:col-span-7 text-left flex flex-col items-start animate-fadeIn">
          <Badge variant="orange" className="mb-6">
            El Desafío Actual
          </Badge>

          <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6 leading-tight">
            {title}
          </h2>
          <div className="space-y-6 text-base sm:text-lg leading-relaxed text-slate-600 font-medium">
            <p>{description}</p>
            <div className="border border-slate-200 border-l-4 border-l-[#D4E600] pl-6 text-slate-700 font-medium bg-[#F4F8B8]/30 py-4 pr-4 rounded-3xl shadow-soft mt-4">
              {highlight}
            </div>
            
            {/* Dynamic Image Placeholder to Reserve Space */}
            <div className="relative w-full aspect-[21/9] rounded-3xl p-2.5 bg-white border border-slate-200/60 shadow-soft transition-all duration-300 hover:shadow-medium mt-6">
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                <Image
                  src="/luminus_photo_placeholder.png"
                  alt="Desafíos en el bienestar"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pain points visual card */}
        <div className="lg:col-span-5 animate-fadeIn">
          <div className="card rounded-3xl border border-slate-200/80 bg-[#FFE0C2]/30 p-8 shadow-soft transition-all duration-300 hover:shadow-medium hover:-translate-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-[#FF7700] text-white shadow-soft mb-6">
              {cardIcon}
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-6">
              {cardTitle}
            </h3>
            <ul className="space-y-4">
              {bullets.map((problem, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                  <XCircle className="h-5 w-5 shrink-0 text-[#B84A00] stroke-[2px] mt-0.5" />
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
