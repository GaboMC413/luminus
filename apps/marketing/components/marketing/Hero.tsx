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
  bgGlow = "from-luminus-pink/10 via-luminus-lime/10",
  imageBg = "shadow-bold-pink",
  borderBottom = false,
}: HeroProps) {
  return (
    <section className={`relative overflow-hidden bg-white py-20 lg:py-32 ${borderBottom ? "border-b-2 border-black" : ""}`}>
      {/* Playful background glows */}
      <div className={`absolute left-1/2 top-0 -z-10 h-[600px] w-[1000px] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] bg-radial to-transparent ${bgGlow}`} />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left lg:pr-8">
            {badge && (
              <Badge variant={badge.variant} icon={badge.icon} className="mb-6">
                {badge.text}
              </Badge>
            )}

            <h1 className="font-display text-4xl font-black tracking-tight text-black sm:text-6xl lg:text-6xl leading-[1.05] mb-6">
              {title}
            </h1>

            <p className="text-lg sm:text-xl leading-relaxed text-black font-bold mb-8 max-w-2xl">
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
              <p className="text-xs text-slate-500 font-semibold pl-1">
                {microcopy}
              </p>
            )}
          </div>

          {/* Hero Illustration */}
          {image && (
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div className={`relative w-full max-w-[420px] aspect-square rounded-[2.5rem] p-3 border-2 border-black bg-white transition-transform duration-300 hover:rotate-1 ${imageBg}`}>
                <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-white border-2 border-black flex items-center justify-center">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={500}
                    height={500}
                    className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
                    priority
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
