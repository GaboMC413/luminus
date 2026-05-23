"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === "/signin" || pathname === "/signup";
    const isOnboardingPage = pathname === "/onboarding";
    const isProfilePage = pathname === "/profile";
    const isRootPage = pathname === "/";

    if (!user) {
      // User is not logged in: only allow /signin and /signup. Redirect others to /signin
      if (!isAuthPage) {
        router.push("/signin");
      }
    } else {
      // User is logged in:
      if (!user.isOnboarded) {
        // If not onboarded, force redirect to /onboarding
        if (!isOnboardingPage) {
          router.push("/onboarding");
        }
      } else {
        // If onboarded, prevent access to onboarding and auth pages, redirect to /profile
        if (isOnboardingPage || isAuthPage || isRootPage) {
          router.push("/profile");
        }
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-wellness-sand-50 via-white to-wellness-sage-50">
        <div className="relative flex items-center justify-center">
          {/* Calming breathing pulse loader */}
          <div className="w-16 h-16 border-2 border-wellness-sage-100 rounded-full animate-ping duration-1000"></div>
          <div className="absolute w-12 h-12 border border-t-2 border-wellness-sage-500 rounded-full animate-spin"></div>
          <div className="absolute w-6 h-6 bg-wellness-sage-200/50 rounded-full"></div>
        </div>
        <p className="mt-6 text-wellness-sage-600 text-xs font-semibold tracking-widest uppercase">LUMINUS</p>
      </div>
    );
  }

  // Prevent flicker before redirect on mismatched routes
  const isAuthPage = pathname === "/signin" || pathname === "/signup";
  const isOnboardingPage = pathname === "/onboarding";
  
  if (!user && !isAuthPage) return null;
  if (user && !user.isOnboarded && !isOnboardingPage) return null;
  if (user && user.isOnboarded && (isAuthPage || isOnboardingPage)) return null;

  return <>{children}</>;
};
