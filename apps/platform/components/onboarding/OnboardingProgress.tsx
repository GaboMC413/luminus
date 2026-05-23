import React from "react";
import { Check } from "lucide-react";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  steps
}) => {
  return (
    <div className="w-full max-w-lg mx-auto mb-10 px-4">
      <div className="relative flex items-center justify-between">
        
        {/* Connecting bar background */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-wellness-sand-200 -z-10"></div>
        
        {/* Active colored bar foreground */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-wellness-sage-400 -z-10 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>

        {/* Dynamic Step Steppers */}
        {steps.map((stepName, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={index} className="flex flex-col items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-premium border-2 bg-white ${
                  isCompleted
                    ? "bg-wellness-sage-500 border-wellness-sage-500 text-white shadow-sm"
                    : isActive
                    ? "border-wellness-sage-500 text-wellness-sage-800 shadow-md ring-4 ring-wellness-sage-50"
                    : "border-wellness-sand-200 text-wellness-sage-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3px]" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>
              <span
                className={`hidden sm:inline text-[10px] font-bold uppercase tracking-wider ${
                  isActive
                    ? "text-wellness-sage-700 font-extrabold"
                    : isCompleted
                    ? "text-wellness-sage-500"
                    : "text-wellness-sage-400/70"
                }`}
              >
                {stepName}
              </span>
            </div>
          );
        })}
        
      </div>
    </div>
  );
};
export default OnboardingProgress;
