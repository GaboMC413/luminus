import React from "react";
import { CheckCircle2, Shield } from "lucide-react";

export interface TrustSectionProps {
  id?: string;
  icon?: React.ReactNode;
  iconBgClass?: string;
  title: string;
  description: string;
  assurances: string[];
  assurancesBgClass?: string;
}

export function TrustSection({
  id,
  icon = <Shield className="h-6 w-6" />,
  iconBgClass = "bg-luminus-blue text-white",
  title,
  description,
  assurances,
  assurancesBgClass = "bg-luminus-lime/10",
}: TrustSectionProps) {
  return (
    <section id={id} className="py-20 bg-white relative overflow-hidden">
      {/* Decorative gradient background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-luminus-blue/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-[2.5rem] border-2 border-black bg-white p-8 md:p-12 shadow-bold hover:shadow-bold-lg transition-all duration-150">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left side: Heading & Paragraph */}
            <div className="md:col-span-6 text-left">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black shadow-bold-sm mb-6 ${iconBgClass}`}>
                {icon}
              </div>
              <h2 className="font-display text-3xl font-black tracking-tight text-black mb-4">
                {title}
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 font-semibold">
                {description}
              </p>
            </div>

            {/* Right side: Bullet checklist box */}
            <div className={`md:col-span-6 rounded-2xl p-6 border-2 border-black shadow-bold-sm ${assurancesBgClass}`}>
              <ul className="space-y-4">
                {assurances.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-black font-extrabold">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-black mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
