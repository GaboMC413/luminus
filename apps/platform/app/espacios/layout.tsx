"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlatformNavbar } from "@/components/ui/PlatformNavbar";

export default function EspaciosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const isLoggedIn = localStorage.getItem("luminus_logged_in") === "true";
    if (!isLoggedIn) {
      router.push("/auth/signin");
    }
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
    <div className="w-full min-h-screen bg-[#FAF9F6] text-wellness-slate-900 font-sans flex flex-col antialiased">
      <PlatformNavbar />
      <main className="flex-1 w-full flex flex-col pt-[64px] pb-[64px] md:pt-[80px] md:pb-0">
        {children}
      </main>
      <footer className="w-full py-8 border-t border-zinc-200/60 bg-white shrink-0">
        <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-semibold">
          LUMINUS LATAM © 2026 • Espacio de Profesionales & Bienestar
        </p>
      </footer>
    </div>
  );
}
