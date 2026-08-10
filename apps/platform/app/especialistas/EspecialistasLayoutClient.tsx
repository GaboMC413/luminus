"use client";

import { usePathname } from "next/navigation";
import { PlatformNavbar } from "@/components/ui/PlatformNavbar";
import { PlatformFooter } from "@/components/ui/PlatformFooter";

export function EspecialistasLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOnboarding = pathname.includes("/onboarding");

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      <PlatformNavbar />
      <main className="flex-1 w-full flex flex-col pt-[64px] pb-[calc(64px+env(safe-area-inset-bottom,0px))] lg:pb-0">
        {children}
      </main>
      {!isOnboarding && <PlatformFooter />}
    </div>
  );
}
