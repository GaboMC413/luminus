import { assertOnboarded } from "@/lib/auth/session";
import { PlatformNavbar } from "@/components/ui/PlatformNavbar";
import { PlatformFooter } from "@/components/ui/PlatformFooter";

export const metadata = {
  title: "Grabaciones | LUMINUS",
  description: "Videoteca de charlas y entrevistas de bienestar.",
};

export default async function GrabacionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertOnboarded("/grabaciones");

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      <PlatformNavbar />
      <main className="flex-1 w-full flex flex-col pt-[64px] pb-[calc(64px+env(safe-area-inset-bottom,0px))] lg:pb-0">
        {children}
      </main>
      <PlatformFooter />
    </div>
  );
}
