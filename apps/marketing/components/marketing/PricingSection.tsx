import React from "react";
import { Section } from "../ui/Section";
import { SectionHeader } from "../ui/SectionHeader";
import { Badge } from "../ui/Badge";
import { PricingCard, PricingCardProps } from "./PricingCard";

export interface PricingSectionProps {
  id?: string;
  badge?: string;
  title: React.ReactNode;
  subtitle?: string;
  plans: PricingCardProps[];
}

export function PricingSection({
  id,
  badge,
  title,
  subtitle,
  plans,
}: PricingSectionProps) {
  return (
    <Section id={id} borderBottom>
      <SectionHeader
        badge={
          badge ? (
            <Badge variant="lime">{badge}</Badge>
          ) : undefined
        }
        title={title}
        subtitle={subtitle}
      />

      <div className={`mx-auto grid gap-8 items-stretch ${
        plans.length === 3
          ? "max-w-sm grid-cols-1 md:max-w-7xl md:grid-cols-3"
          : "max-w-sm grid-cols-1 md:max-w-4xl md:grid-cols-2 lg:gap-12"
      }`}>
        {plans.map((plan, idx) => (
          <PricingCard key={idx} {...plan} />
        ))}
      </div>
    </Section>
  );
}
