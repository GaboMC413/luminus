"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProfileButton } from "@/components/ui/Button";
import { PlatformNavbar } from "@/components/ui/PlatformNavbar";
import { PlatformFooter } from "@/components/ui/PlatformFooter";

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function checkSession() {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        router.push("/auth/iniciar-sesion");
        return;
      }

      const data = await response.json();
      setUserEmail(data.user?.email ?? "Usuario Luminus");
      setIsMounted(true);
    }

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/auth/iniciar-sesion");
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
    <div className="w-full min-h-screen bg-slate-50 text-wellness-slate-900 font-sans flex flex-col antialiased">
      {/* 1. PREMIUM HEADER */}
      <PlatformNavbar />

      {/* 2. PAGE CONTENT */}
      <main className="flex-1 w-full flex flex-col pt-[64px] lg:pt-[80px] pb-[calc(64px+env(safe-area-inset-bottom,0px))] lg:pb-0">
        {children}
      </main>

      {/* 3. FOOTER */}
      <PlatformFooter />
    </div>
  );
}
