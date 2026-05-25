import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";

export interface CTASectionProps {
  id?: string;
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  microcopy?: string;
  bgGlow?: string;
  cardBg?: string;
  iconColor?: string;
}

export function CTASection({
  id,
  icon,
  title,
  subtitle,
  ctaText,
  ctaLink,
  microcopy,
  bgGlow = "from-luminus-pink/5 via-luminus-orange/5",
  cardBg = "bg-luminus-pink/15",
  iconColor = "text-luminus-pink",
}: CTASectionProps) {
  return (
    <section id={id} className="py-24 bg-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-tr to-transparent rounded-full blur-3xl pointer-events-none ${bgGlow}`} />

      <div className="mx-auto max-w-5xl px-6">
        <div className={`relative rounded-[2.5rem] border-2 border-black p-8 md:p-16 text-center shadow-bold-lg overflow-hidden ${cardBg}`}>
          
          {/* Subtle connecting lines */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-luminus-blue/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-luminus-lime/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            {/* Sparkle icon */}
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-black border-2 border-black shadow-bold-sm mb-6 ${iconColor}`}>
              <span className="flex items-center justify-center [&>svg]:h-6 [&>svg]:w-6">{icon}</span>
            </div>

            {/* Title */}
            <h2 className="font-display text-3xl font-black text-black sm:text-5xl leading-tight mb-4">
              {title}
            </h2>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-800 leading-relaxed mb-8 max-w-2xl font-bold">
              {subtitle}
            </p>

            {/* Button */}
            <Button variant="primary" href={ctaLink}>
              {ctaText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {/* Microcopy */}
            {microcopy && (
              <p className="text-xs text-slate-500 font-bold mt-5">
                {microcopy}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
