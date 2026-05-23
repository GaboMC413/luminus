"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Heart,
  LogOut,
  MapPin,
  Sparkles,
  User,
  Compass,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FolderHeart
} from "lucide-react";

const AVATAR_MAP: Record<string, { emoji: string; color: string }> = {
  leaf: { emoji: "🌿", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  sun: { emoji: "☀️", color: "bg-amber-50 text-amber-600 border-amber-100" },
  ocean: { emoji: "🌊", color: "bg-sky-50 text-sky-600 border-sky-100" },
  lotus: { emoji: "🪷", color: "bg-rose-50 text-rose-600 border-rose-100" }
};

const INTENTION_MAP: Record<string, string> = {
  personal_growth: "Focus on Personal Growth",
  find_experts: "Find Certified Experts",
  share_expertise: "Share My Expertise",
  peer_network: "Build Meaningful Connections"
};

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
  };

  const avDetails = user?.onboardingData?.avatar
    ? AVATAR_MAP[user.onboardingData.avatar]
    : AVATAR_MAP.leaf;

  const userIntention = user?.onboardingData?.intention
    ? INTENTION_MAP[user.onboardingData.intention]
    : "Conscious living & wellness";

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-tr from-wellness-sand-50 via-white to-wellness-sage-50/30 text-wellness-slate-900 pb-16">
        
        {/* Navigation Bar */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-wellness-sand-100 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 bg-wellness-sage-500 rounded-full shadow-sm text-white">
                <Heart className="w-4.5 h-4.5 fill-white/10" />
              </div>
              <span className="text-sm font-extrabold tracking-widest uppercase text-wellness-sage-800">
                Luminus
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-wellness-sage-50 text-wellness-sage-600 text-[10px] font-bold tracking-widest uppercase rounded-full">
                {user?.onboardingData?.plan ? `Plan: ${user.onboardingData.plan}` : "Luminus Path"}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-wellness-clay-500 hover:text-wellness-clay-600 border border-wellness-sand-100 hover:border-wellness-clay-100 rounded-xl transition-premium active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Dashboard Frame */}
        <main className="max-w-5xl mx-auto px-6 mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: User Summary Card (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card className="p-6 text-center flex flex-col items-center gap-4 border border-wellness-sand-100 relative">
              <span className="absolute top-4 right-4 text-xs font-bold tracking-widest uppercase text-wellness-clay-500 pl-0.5">
                {user?.onboardingData?.plan || "Path"}
              </span>

              {/* Avatar Frame */}
              <div className={`w-24 h-24 rounded-full border flex items-center justify-center text-5xl shadow-sm my-2 ${avDetails?.color || "bg-wellness-sage-50"}`}>
                {avDetails?.emoji || "🌿"}
              </div>

              {/* Name & Role */}
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold text-wellness-slate-900 leading-tight">
                  {user?.name || "Camila Silva"}
                </h3>
                <p className="text-xs font-semibold text-wellness-sage-600 uppercase tracking-wider">
                  {user?.onboardingData?.role || "Wellness Enthusiast"}
                </p>
              </div>

              {/* Location */}
              {user?.onboardingData?.city && (
                <div className="flex items-center justify-center gap-1 text-xs text-wellness-slate-500 font-semibold pl-0.5">
                  <MapPin className="w-3.5 h-3.5 text-wellness-sage-400" />
                  <span>
                    {user.onboardingData.city}, {user.onboardingData.country}
                  </span>
                </div>
              )}

              {/* Short Bio */}
              <div className="border-t border-wellness-sand-100/70 w-full pt-4 mt-2">
                <p className="text-xs text-wellness-slate-500 leading-relaxed font-medium italic">
                  "{user?.onboardingData?.bio || "No professional biography added yet. Click edit to describe your path."}"
                </p>
              </div>
            </Card>

            {/* Premium Invitation Card */}
            <Card variant="flat" className="p-6 bg-[#324336] text-wellness-sand-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-wellness-sage-500/10 rounded-full blur-2xl"></div>
              <h4 className="text-sm font-bold tracking-wider uppercase text-wellness-sand-100/90 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-wellness-sand-200" />
                <span>Sanctuary Access</span>
              </h4>
              <p className="text-xs text-wellness-sand-200/80 leading-relaxed mt-2.5">
                Join our premium conscious circles, coordinate video meetings, or search professional health guides inside LATAM.
              </p>
              <button className="mt-5 w-full py-2 bg-white/10 hover:bg-white/20 active:bg-white/5 border border-white/20 text-xs font-bold uppercase tracking-widest text-white rounded-xl transition-premium">
                Explore Circles
              </button>
            </Card>
          </div>

          {/* Right Column: Dynamic Data Panels (Span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Core preferences Section */}
            <Card className="p-6 sm:p-8 flex flex-col gap-6">
              
              {/* Intention summary */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-wellness-sage-600">
                  <Compass className="w-4.5 h-4.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    My Core Intention
                  </span>
                </div>
                <h2 className="text-lg font-bold text-wellness-slate-900 pl-0.5">
                  {userIntention}
                </h2>
              </div>

              <div className="border-t border-wellness-sand-100/70"></div>

              {/* Interests tag grid */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-wellness-sage-600">
                  <FolderHeart className="w-4.5 h-4.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    My Focus & Curiosity Areas
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-1 pl-0.5">
                  {user?.onboardingData?.interests && user.onboardingData.interests.length > 0 ? (
                    user.onboardingData.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3.5 py-1.5 bg-wellness-sand-100 text-wellness-sage-800 text-xs font-semibold rounded-full border border-wellness-sand-200/60 transition-premium hover:-translate-y-[1px]"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-wellness-slate-400 font-medium italic">
                      No interest tags chosen.
                    </span>
                  )}
                </div>
              </div>

            </Card>

            {/* Empty state section - satisfying required text copy */}
            <Card className="p-6 sm:p-8 border border-wellness-sand-100 flex flex-col gap-6 relative overflow-hidden bg-white">
              
              {/* Background calming accent leaf blob */}
              <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-wellness-sage-500/5 blur-xl"></div>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-wellness-sand-100 text-wellness-sage-500 border border-wellness-sand-200 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                
                <div className="flex-grow flex flex-col gap-1.5">
                  {/* Empty state Title & Subtitle */}
                  <h3 className="text-lg font-bold text-wellness-slate-900 leading-tight tracking-wide">
                    Your LUMINUS profile is ready to grow
                  </h3>
                  <p className="text-xs text-wellness-slate-500 font-semibold leading-relaxed">
                    Complete your information to help others understand your interests, intentions and path.
                  </p>
                </div>
              </div>

              {/* Action Widgets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                
                {/* Action 1 */}
                <div className="p-5 bg-wellness-sand-50/50 hover:bg-wellness-sand-50 border border-wellness-sand-100 hover:border-wellness-sand-200 rounded-2xl transition-premium cursor-pointer group flex flex-col justify-between min-h-[120px]">
                  <div className="flex flex-col gap-1.5">
                    <h5 className="text-xs font-bold text-wellness-slate-900 group-hover:text-wellness-sage-600 transition-colors uppercase tracking-wider">
                      1. Match with Wellness Guides
                    </h5>
                    <p className="text-[11px] text-wellness-slate-500 leading-relaxed font-medium">
                      Search local coaches, certified psychologists, and meditation guides.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-wellness-sage-500 mt-3">
                    <span>Search directory</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Action 2 */}
                <div className="p-5 bg-wellness-sand-50/50 hover:bg-wellness-sand-50 border border-wellness-sand-100 hover:border-wellness-sand-200 rounded-2xl transition-premium cursor-pointer group flex flex-col justify-between min-h-[120px]">
                  <div className="flex flex-col gap-1.5">
                    <h5 className="text-xs font-bold text-wellness-slate-900 group-hover:text-wellness-sage-600 transition-colors uppercase tracking-wider">
                      2. Introduce Yourself
                    </h5>
                    <p className="text-[11px] text-wellness-slate-500 leading-relaxed font-medium">
                      Post a short greetings card in the LATAM network space.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-wellness-sage-500 mt-3">
                    <span>Write greetings</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>

            </Card>

          </div>

        </main>
        
      </div>
    </AuthGuard>
  );
}
