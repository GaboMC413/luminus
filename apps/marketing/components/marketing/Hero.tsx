import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

export interface HeroProps {
  badge?: {
    text: string;
    icon?: React.ReactNode;
    variant?: "lime" | "pink" | "orange";
  };
  title: React.ReactNode;
  subtitle: string;
  primaryCta?: {
    text: string;
    link: string;
  };
  secondaryCta?: {
    text: string;
    link: string;
  };
  microcopy?: React.ReactNode;
  image?: {
    src: string;
    alt: string;
  };
  bgGlow?: string;
  imageBg?: string;
  borderBottom?: boolean;
}

export function Hero({
  badge,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  microcopy,
  image,
  bgGlow = "",
  imageBg = "",
  borderBottom = false,
}: HeroProps) {
  return (
    <section className={`relative overflow-hidden luminus-hero-gradient py-24 lg:py-36 ${borderBottom ? "border-b border-slate-100" : ""}`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left lg:pr-8 animate-fadeIn">
            {badge && (
              <Badge variant={badge.variant || "lime"} icon={badge.icon} className="mb-6">
                {badge.text}
              </Badge>
            )}

            <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl leading-[1.08] mb-6">
              {title}
            </h1>

            <p className="text-lg sm:text-xl leading-relaxed text-slate-600 font-medium mb-8 max-w-2xl whitespace-pre-line">
              {subtitle}
            </p>

            {/* CTAs */}
            {(primaryCta || secondaryCta) && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-5">
                {primaryCta && (
                  <Button variant="primary" href={primaryCta.link}>
                    {primaryCta.text}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
                {secondaryCta && (
                  <Button variant="secondary" href={secondaryCta.link}>
                    {secondaryCta.text}
                  </Button>
                )}
              </div>
            )}

            {microcopy && (
              <p className="text-xs text-slate-400 font-medium pl-1">
                {microcopy}
              </p>
            )}
          </div>

          {/* Hero Illustration - Editorial Photo Placeholder */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end animate-fadeIn">
            {/* Ambient light halo behind the image */}
            <div className="absolute -inset-4 -z-10 rounded-full bg-radial from-luminus-pink/20 to-transparent blur-2xl opacity-60" />
            
            <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl p-3 bg-white/70 border border-slate-200/60 shadow-soft backdrop-blur-sm transition-all duration-500 hover:shadow-medium">
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Image
                  src="/luminus_photo_placeholder.png"
                  alt={image?.alt || "LUMINUS Bienestar"}
                  width={500}
                  height={625}
                  className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
