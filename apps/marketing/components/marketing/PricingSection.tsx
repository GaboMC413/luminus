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

      <div className="mx-auto grid max-w-sm grid-cols-1 gap-8 md:max-w-4xl md:grid-cols-2 md:gap-8 lg:gap-12 items-stretch">
        {plans.map((plan, idx) => (
          <PricingCard key={idx} {...plan} />
        ))}
      </div>
    </Section>
  );
}
