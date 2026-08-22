import React from "react";
import { Section } from "../ui/Section";
import { SectionHeader } from "../ui/SectionHeader";
import { Badge } from "../ui/Badge";
import { FeatureCard, FeatureCardProps } from "./FeatureCard";

export interface FeatureGridProps {
  id?: string;
  badge?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  items: FeatureCardProps[];
  bg?: "white" | "slate-50" | "transparent";
}

export function FeatureGrid({
  id,
  badge,
  title,
  subtitle,
  items,
  bg = "white",
}: FeatureGridProps) {
  return (
    <Section id={id} bg={bg}>
      <SectionHeader
        badge={
          badge ? (
            <Badge variant="pink">{badge}</Badge>
          ) : undefined
        }
        title={title}
        subtitle={subtitle}
      />

      <div className="space-y-8">
        {/* If exactly 5 items, use the 3-2 grid layout */}
        {items.length === 5 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.slice(0, 3).map((feature, idx) => (
                <FeatureCard key={`r1-${idx}`} {...feature} />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:max-w-[70%] lg:mx-auto">
              {items.slice(3, 5).map((feature, idx) => (
                <FeatureCard key={`r2-${idx}`} {...feature} />
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
