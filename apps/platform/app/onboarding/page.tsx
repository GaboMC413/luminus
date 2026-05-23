"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, OnboardingData } from "@/context/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";

// Step components
import { OnboardingStepProfile } from "@/components/onboarding/OnboardingStepProfile";
import { OnboardingStepInterests } from "@/components/onboarding/OnboardingStepInterests";
import { OnboardingStepIntention } from "@/components/onboarding/OnboardingStepIntention";
import { OnboardingStepPlan } from "@/components/onboarding/OnboardingStepPlan";

const STEPS = ["Profile", "Interests", "Intention", "Plan Selection"];

export default function OnboardingPage() {
  const { user, completeOnboarding } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states accumulator
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    avatar: "leaf",
    role: "",
    bio: "",
    city: "",
    country: ""
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [intention, setIntention] = useState<string>("");

  const handleProfileSubmit = (data: typeof profileData) => {
    setProfileData(data);
    setStep(2);
  };

  const handleInterestsSubmit = (selectedInterests: string[]) => {
    setInterests(selectedInterests);
    setStep(3);
  };

  const handleIntentionSubmit = (selectedIntention: string) => {
    setIntention(selectedIntention);
    setStep(4);
  };

  const handleCompleteOnboarding = async (plan: string) => {
    setIsSubmitting(true);
    try {
      const onboardingPayload: OnboardingData = {
        avatar: profileData.avatar,
        role: profileData.role,
        bio: profileData.bio,
        city: profileData.city,
        country: profileData.country,
        interests,
        intention,
        plan
      };
      
      await completeOnboarding(onboardingPayload);
      router.push("/profile");
    } catch (error) {
      console.error("Failed to save onboarding data", error);
      alert("Something went wrong saving your preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic titles and subtitles based on the current step
  const getStepMetadata = () => {
    switch (step) {
      case 1:
        return {
          title: "Introduce yourself to the circle",
          subtitle: "Start building your presence. Pick a calming avatar and outline your professional path."
        };
      case 2:
        return {
          title: "What are you curious about?",
          subtitle: "Select at least 2 focus tags. We will customize your matching directory and circles to these areas."
        };
      case 3:
        return {
          title: "Clarify your core intention",
          subtitle: "What draws you to LUMINUS? Setting an aspiration helps align your growth space."
        };
      case 4:
        return {
          title: "Select your subscription plan",
          subtitle: "Choose the path that fits your current commitments and goals. You can adjust this anytime."
        };
      default:
        return {
          title: "Let’s personalize your experience",
          subtitle: "Your answers help us shape a more relevant space for you inside LUMINUS."
        };
    }
  };

  const metadata = getStepMetadata();

  return (
    <AuthGuard>
      <OnboardingLayout
        currentStep={step}
        totalSteps={4}
        title={metadata.title}
        subtitle={metadata.subtitle}
      >
        {/* Tranquil Visual Stepper */}
        <OnboardingProgress
          currentStep={step}
          totalSteps={4}
          steps={STEPS}
        />

        {/* Dynamic step renderer */}
        <div className="w-full">
          {step === 1 && (
            <OnboardingStepProfile
              initialData={{
                ...profileData,
                name: profileData.name || user?.name || ""
              }}
              onNext={handleProfileSubmit}
            />
          )}

          {step === 2 && (
            <OnboardingStepInterests
              initialData={interests}
              onNext={handleInterestsSubmit}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <OnboardingStepIntention
              initialData={intention}
              onNext={handleIntentionSubmit}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <OnboardingStepPlan
              initialPlan="path"
              onComplete={handleCompleteOnboarding}
              onBack={() => setStep(3)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </OnboardingLayout>
    </AuthGuard>
  );
}
