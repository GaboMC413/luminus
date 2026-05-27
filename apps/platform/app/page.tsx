"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlatformHomePage() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      router.push(response.ok ? "/community" : "/auth/signin");
    }

    checkSession();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black select-none">
      <div className="flex flex-col items-center gap-4 animate-float">
        <img
          src="/logo-luminus-white.svg"
          alt="Luminus"
          className="h-[24px] opacity-80"
        />
        <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold animate-pulse-slow">
          Cargando LUMINUS...
        </p>
      </div>
    </div>
  );
}

