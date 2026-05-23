"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, User, Users, Compass, BookOpen } from "lucide-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepIntentionProps {
  initialData: string;
  onNext: (intention: string) => void;
  onBack: () => void;
}

const INTENTIONS = [
  {
    id: "personal_growth",
    title: "Focus on Personal Growth",
    description: "I want to cultivate mindfulness routines, emotional resilience, and access curated wellness resources for my own path.",
    icon: Compass,
  },
  {
    id: "find_experts",
    title: "Find Certified Experts",
    description: "I am looking to connect with trusted therapists, health coaches, nutritionists, or somatic guides in Latin America.",
    icon: User,
  },
  {
    id: "share_expertise",
    title: "Share My Expertise",
    description: "I want to join as an expert or wellness professional to offer guides, share insights, and connect with potential clients.",
    icon: BookOpen,
  },
  {
    id: "peer_network",
    title: "Build Meaningful Connections",
    description: "I want to network with like-minded professional peers in LATAM who value conscious living and holistic health.",
    icon: Users,
  }
];

export const OnboardingStepIntention: React.FC<StepIntentionProps> = ({
  initialData,
  onNext,
  onBack
}) => {
  const [selectedIntention, setSelectedIntention] = useState<string>(initialData || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedIntention) {
      setError("Please choose a primary intention to help align your space.");
      return;
    }

    onNext(selectedIntention);
  };

  return (
    <Card className="p-6 sm:p-10 max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        <div className="flex flex-col gap-2 pl-1">
          <span className="text-xs font-bold uppercase tracking-widest text-wellness-sage-600">
            Set Your Focus
          </span>
          <p className="text-xs text-wellness-slate-500 leading-normal">
            What is your main aspiration inside LUMINUS? This helps us curate matches, circles, and discussions for your daily growth.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-wellness-clay-50 border border-wellness-clay-200 text-wellness-clay-600 text-xs font-semibold rounded-2xl animate-scale-in">
            {error}
          </div>
        )}

        {/* Dynamic Card Options */}
        <div className="flex flex-col gap-3">
          {INTENTIONS.map((option) => {
            const isSelected = selectedIntention === option.id;
            const Icon = option.icon;

            return (
              <div
                key={option.id}
                onClick={() => setSelectedIntention(option.id)}
                className={`flex gap-4 p-5 rounded-2xl border text-left cursor-pointer transition-premium relative select-none ${
                  isSelected
                    ? "bg-wellness-sage-50/50 border-wellness-sage-400 ring-1 ring-wellness-sage-400"
                    : "bg-white hover:bg-wellness-sand-50/50 border-wellness-sand-200 hover:border-wellness-sand-300 shadow-sm"
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-premium ${
                  isSelected
                    ? "bg-wellness-sage-500 border-wellness-sage-500 text-white"
                    : "bg-wellness-sand-50 border-wellness-sand-200 text-wellness-sage-500"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-grow flex flex-col gap-1 pr-6">
                  <h4 className="text-sm font-semibold text-wellness-slate-900 leading-tight">
                    {option.title}
                  </h4>
                  <p className="text-xs text-wellness-slate-500 leading-relaxed">
                    {option.description}
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute right-5 top-5 text-wellness-sage-500 animate-scale-in">
                    <CheckCircle2 className="w-5 h-5 fill-current text-wellness-sage-500 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 border-t border-wellness-sand-100 pt-6 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </Button>

          <Button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

      </form>
    </Card>
  );
};
export default OnboardingStepIntention;
