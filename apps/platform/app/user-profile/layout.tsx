"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProfileButton } from "@/components/ui/Button";
import { PlatformNavbar } from "@/components/ui/PlatformNavbar";

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const isLoggedIn = localStorage.getItem("luminus_logged_in") === "true";
    if (!isLoggedIn) {
      router.push("/auth/signin");
    } else {
      setUserEmail(localStorage.getItem("luminus_user_email") || "Usuario Luminus");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("luminus_logged_in");
    localStorage.removeItem("luminus_user_email");
    router.push("/auth/signin");
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[24px] animate-pulse" />
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF9F6] text-wellness-slate-900 font-sans flex flex-col antialiased">
      {/* 1. PREMIUM HEADER */}
      <PlatformNavbar />

      {/* 2. PAGE CONTENT */}
      <main className="flex-1 w-full flex flex-col pt-[64px] pb-[64px] md:pt-[80px] md:pb-0">
        {children}
      </main>

      {/* 3. FOOTER */}
      <footer className="w-full py-8 border-t border-zinc-200/60 bg-white shrink-0">
        <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-semibold">
          LUMINUS LATAM © 2026 • Espacio de Profesionales & Bienestar
        </p>
      </footer>
    </div>
  );
}
