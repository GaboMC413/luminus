"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlatformNavbar } from "@/components/ui/PlatformNavbar";
import { PlatformFooter } from "@/components/ui/PlatformFooter";

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        router.push("/auth/signin");
        return;
      }

      setIsMounted(true);
    }

    checkSession();
  }, [router]);

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[24px]" />
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 text-wellness-slate-900 font-sans flex flex-col antialiased">
      <PlatformNavbar />
      <main className="flex-1 w-full flex flex-col pt-[64px] lg:pt-[80px]">
        {children}
      </main>
      <PlatformFooter />
    </div>
  );
}
