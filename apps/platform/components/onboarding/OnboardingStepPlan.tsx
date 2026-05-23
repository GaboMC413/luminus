"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Check, ArrowLeft, Heart, Flame, ShieldCheck } from "lucide-react";

interface StepPlanProps {
  initialPlan: string;
  onComplete: (plan: string) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

const PLANS = [
  {
    id: "seed",
    name: "Luminus Seed",
    price: "Free",
    description: "Your foundational start for exploring wellness.",
    icon: Heart,
    features: [
      "Access to basic wellness circles",
      "Standard interest-tag matching",
      "Read public professional guides",
      "1 personal focus intent"
    ],
    recommended: false,
    color: "border-wellness-sand-200"
  },
  {
    id: "path",
    name: "Luminus Path",
    price: "$19/mo",
    description: "Deepen your practice and expand your connections.",
    icon: Flame,
    features: [
      "Access to premium wellness circles",
      "Direct professional directory messaging",
      "Unlimited interest matches & alerts",
      "Join monthly live expert workshops",
      "Custom notifications & feed filters"
    ],
    recommended: true,
    color: "border-wellness-sage-300 ring-2 ring-wellness-sage-200/50"
  },
  {
    id: "sanctuary",
    name: "Luminus Sanctuary",
    price: "$49/mo",
    description: "All-inclusive guidance for absolute wellbeing.",
    icon: ShieldCheck,
    features: [
      "Everything in the Path tier",
      "One 1-on-1 monthly session with an expert",
      "Direct personalized growth path audit",
      "Exclusive small-group focus circles",
      "24/7 dedicated platform concierge"
    ],
    recommended: false,
    color: "border-wellness-sand-200"
  }
];

export const OnboardingStepPlan: React.FC<StepPlanProps> = ({
  initialPlan,
  onComplete,
  onBack,
  isSubmitting = false
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>(initialPlan || "path");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(selectedPlan);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        <div className="flex flex-col gap-1.5 pl-1 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-wellness-sage-600">
            Choose Your Tier
          </span>
          <p className="text-xs text-wellness-slate-500 leading-normal">
            Select the support level that matches your current intentions. You can change your plan at any time inside your dashboard.
          </p>
        </div>

        {/* Dynamic Card Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const PlanIcon = plan.icon;

            return (
              <Card
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                variant={isSelected ? "elevated" : "flat"}
                interactive
                className={`p-6 flex flex-col justify-between border-2 relative h-full select-none ${
                  isSelected
                    ? "border-wellness-sage-500 ring-2 ring-wellness-sage-100 shadow-md"
                    : "border-wellness-sand-100 hover:border-wellness-sand-300"
                }`}
              >
                {/* Recommended Clay Tag */}
                {plan.recommended && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-wellness-clay-500 text-white text-[9px] font-extrabold uppercase tracking-widest rounded-full shadow-sm">
                    Recommended Focus
                  </span>
                )}

                <div className="flex flex-col gap-4">
                  {/* Icon & Plan name */}
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                      isSelected
                        ? "bg-wellness-sage-100 text-wellness-sage-600 border-wellness-sage-200"
                        : "bg-wellness-sand-100 text-wellness-sage-500 border-wellness-sand-200"
                    }`}>
                      <PlanIcon className="w-4.5 h-4.5" />
                    </div>
                    <h4 className="text-sm font-bold text-wellness-slate-900 leading-tight">
                      {plan.name}
                    </h4>
                  </div>

                  {/* Price info */}
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-extrabold text-wellness-slate-900">
                      {plan.price}
                    </span>
                    {plan.price !== "Free" && (
                      <span className="text-xs text-wellness-slate-500 font-medium">
                        / month
                      </span>
                    )}
                  </div>

                  {/* Desc */}
                  <p className="text-xs text-wellness-slate-500 leading-relaxed font-medium">
                    {plan.description}
                  </p>

                  <div className="border-t border-wellness-sand-100/70 my-2"></div>

                  {/* Features list */}
                  <ul className="flex flex-col gap-2.5 mt-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 bg-transparent p-0 hover:bg-transparent text-xs leading-normal">
                        <Check className="w-3.5 h-3.5 text-wellness-sage-500 mt-0.5 flex-shrink-0 stroke-[2.5]" />
                        <span className="text-wellness-slate-600 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Button Toggle Indicator */}
                <div className="mt-6 pt-2">
                  <button
                    type="button"
                    className={`w-full py-2.5 text-xs uppercase font-extrabold tracking-wider rounded-xl transition-premium active:scale-95 ${
                      isSelected
                        ? "bg-wellness-sage-500 hover:bg-wellness-sage-600 text-white shadow-sm"
                        : "bg-wellness-sand-100 hover:bg-wellness-sand-200 text-wellness-sage-700 border border-wellness-sand-200/50"
                    }`}
                  >
                    {isSelected ? "Plan Chosen" : "Select Plan"}
                  </button>
                </div>

              </Card>
            );
          })}
        </div>

        {/* Action button bar */}
        <div className="flex items-center gap-4 border-t border-wellness-sand-100 pt-6 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </Button>

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <span>Complete Setup</span>
          </Button>
        </div>

      </form>
    </div>
  );
};
export default OnboardingStepPlan;
