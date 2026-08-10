import { assertOnboarded } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { PlatformNavbar } from "@/components/ui/PlatformNavbar";
import { PlatformFooter } from "@/components/ui/PlatformFooter";

export default async function NetworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertOnboarded();

  return (
    <div className="w-full h-[100dvh] lg:h-auto lg:min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased overflow-hidden lg:overflow-visible">
      <PlatformNavbar />
      <main className="flex-1 w-full flex flex-col pt-[64px] pb-[calc(64px+env(safe-area-inset-bottom,0px))] lg:pb-0 min-h-0 overflow-hidden lg:overflow-visible">
        {children}
      </main>
      <PlatformFooter />
    </div>
  );
}
