"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SelectablePill } from "@/components/ui/SelectablePill";
import { Compass, ArrowLeft, ArrowRight } from "lucide-react";

interface StepInterestsProps {
  initialData: string[];
  onNext: (interests: string[]) => void;
  onBack: () => void;
}

const AVAILABLE_INTERESTS = [
  "Mindfulness",
  "Somatic Practices",
  "Integrative Nutrition",
  "Executive Coaching",
  "Psychotherapy",
  "Breathwork",
  "Emotional Intelligence",
  "Meditation & Silence",
  "Holistic Medicine",
  "Personal Growth",
  "Neurobiology & Focus",
  "Nature & Ecology",
  "Alternative Therapies",
  "Active Movement & Yoga"
];

export const OnboardingStepInterests: React.FC<StepInterestsProps> = ({
  initialData,
  onNext,
  onBack
}) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialData || []);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedInterests.length < 2) {
      setError("Please select at least 2 areas of interest to help customize your profile.");
      return;
    }

    onNext(selectedInterests);
  };

  return (
    <Card className="p-6 sm:p-10 max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        <div className="flex flex-col gap-2 pl-1">
          <div className="flex items-center gap-2 text-wellness-sage-600">
            <Compass className="w-5 h-5 animate-pulse-slow" />
            <span className="text-xs font-bold uppercase tracking-widest pl-0.5">
              Areas of Focus & Curiosity
            </span>
          </div>
          <p className="text-xs text-wellness-slate-500 leading-normal">
            Select the subjects you specialize in, practice, or would love to explore within the LUMINUS community.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-wellness-clay-50 border border-wellness-clay-200 text-wellness-clay-600 text-xs font-semibold rounded-2xl animate-scale-in">
            {error}
          </div>
        )}

        {/* Dynamic Grid of Pills */}
        <div className="flex flex-wrap gap-2.5 py-2">
          {AVAILABLE_INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <SelectablePill
                key={interest}
                label={interest}
                selected={isSelected}
                onClick={() => toggleInterest(interest)}
              />
            );
          })}
        </div>

        {/* Actions Button Bar */}
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
export default OnboardingStepInterests;
