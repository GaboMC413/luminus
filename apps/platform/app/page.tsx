"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function App() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/signin");
    } else if (!user.isOnboarded) {
      router.push("/onboarding");
    } else {
      router.push("/profile");
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-wellness-sand-50 via-white to-wellness-sage-50">
      <div className="relative flex items-center justify-center">
        {/* Tranquil breathing circular indicator */}
        <div className="w-16 h-16 border-2 border-wellness-sage-100 rounded-full animate-ping duration-1000"></div>
        <div className="absolute w-12 h-12 border border-t-2 border-wellness-sage-500 rounded-full animate-spin"></div>
        <div className="absolute w-6 h-6 bg-wellness-sage-200/50 rounded-full"></div>
      </div>
      <p className="mt-6 text-wellness-sage-600 text-xs font-semibold tracking-widest uppercase animate-pulse">LUMINUS</p>
    </div>
  );
}
