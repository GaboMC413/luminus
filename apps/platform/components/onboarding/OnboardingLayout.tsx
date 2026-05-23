"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Heart, LogOut } from "lucide-react";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle: string;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle
}) => {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-wellness-sand-50 via-white to-wellness-sage-50/40 text-wellness-slate-900 pb-16">
      
      {/* Calm Wellness Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-wellness-sand-100/50">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 bg-wellness-sage-500 rounded-full shadow-sm text-white">
            <Heart className="w-4.5 h-4.5 fill-white/10" />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-wellness-sage-800">
            Luminus
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden sm:inline text-xs font-semibold text-wellness-sage-600/80">
              Session: {user.name || user.email}
            </span>
          )}
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-wellness-clay-500 hover:text-wellness-clay-600 border border-transparent hover:border-wellness-clay-100 rounded-xl transition-premium active:scale-95"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Spacious Onboarding Container */}
      <main className="flex-grow flex flex-col items-center px-4 mt-8 sm:mt-12 max-w-3xl mx-auto w-full">
        
        {/* Step Headings */}
        <div className="text-center flex flex-col gap-3 mb-8 w-full max-w-xl">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-wellness-sage-500">
            Step {currentStep} of {totalSteps}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-wellness-slate-900">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-wellness-slate-500 font-medium leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Content Box */}
        <div className="w-full animate-scale-in">
          {children}
        </div>
        
      </main>
      
    </div>
  );
};
export default OnboardingLayout;
