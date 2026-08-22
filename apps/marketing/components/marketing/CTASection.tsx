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
  bgGlow = "",
  cardBg = "",
  iconColor = "",
}: CTASectionProps) {
  const isDark = cardBg === "dark";

  return (
    <section id={id} className={`py-24 ${isDark ? "bg-slate-950" : "bg-white"} relative overflow-hidden`}>
      {/* Background glow effects */}
      {isDark ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-[#0450FB]/10 to-[#FF80FC]/10 rounded-full blur-3xl pointer-events-none opacity-50" />
      ) : (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-tr to-transparent rounded-full blur-3xl pointer-events-none opacity-40" />
      )}

      <div className="mx-auto max-w-5xl px-6">
        <div className={`relative rounded-3xl border p-8 md:p-16 text-center shadow-soft overflow-hidden animate-fadeIn ${
          isDark 
            ? "bg-slate-900 border-slate-800 text-white" 
            : "highlight-module border-slate-200/80 bg-white"
        }`}>
          
          {/* Subtle backgrounds */}
          <div className={`absolute inset-0 opacity-[0.02] ${isDark ? "bg-[radial-gradient(#ffffff_1px,transparent_1px)]" : "bg-[radial-gradient(#000000_1px,transparent_1px)]"} [background-size:24px_24px] pointer-events-none`} />
          <div className={`absolute -right-16 -top-16 w-64 h-64 ${isDark ? "bg-[#0450FB]/20" : "bg-[#DCE6FF]/10"} rounded-full blur-3xl pointer-events-none`} />
          <div className={`absolute -left-16 -bottom-16 w-64 h-64 ${isDark ? "bg-[#FF80FC]/20" : "bg-[#F4F8B8]/10"} rounded-full blur-3xl pointer-events-none`} />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            {/* Icon container */}
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? "bg-white text-black animate-pulse" : "bg-black text-[#FF80FC]"} shadow-soft mb-6`}>
              <span className="flex items-center justify-center [&>svg]:h-6 [&>svg]:w-6">{icon}</span>
            </div>

            {/* Title */}
            <h2 className={`font-display text-3xl font-bold sm:text-5xl leading-tight mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              {title}
            </h2>

            {/* Subtitle */}
            <p className={`text-base sm:text-lg leading-relaxed mb-8 max-w-2xl font-medium ${isDark ? "text-slate-300" : "text-slate-650"}`}>
              {subtitle}
            </p>

            {/* Button */}
            {isDark ? (
              <Button variant="secondary" href={ctaLink} className="bg-white text-black border-white hover:bg-slate-100 hover:text-black">
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5 text-black" />
              </Button>
            ) : (
              <Button variant="primary" href={ctaLink}>
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}

            {/* Microcopy */}
            {microcopy && (
              <p className={`text-xs font-medium mt-5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {microcopy}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
