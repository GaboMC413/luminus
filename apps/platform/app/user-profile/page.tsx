"use client";

import { Suspense } from "react";
import { ProfileContent } from "@/features/user-profile/components/ProfileContent";

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-[#FAF9F6] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-float">
          <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[24px] opacity-80 invert brightness-0" />
          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold animate-pulse-slow">Cargando perfil...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
