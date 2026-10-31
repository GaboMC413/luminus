import { Suspense } from "react";
import AccountCreationView from "@/features/membership/AccountCreationView";
import { PageLoader } from "@/components/ui/PageLoader";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crea tu cuenta — LUMINUS",
  description: "Únete a la red LUMINUS para conectar con personas conscientes en Latinoamérica.",
};

export default async function UnirmeCrearCuentaPage() {
  const session = await getCurrentSession();
  if (session) {
    try {
      const { prisma } = await import("@/lib/db");
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          profile: { select: { isOnboarded: true } },
        },
      });

      // Only redirect if already completely registered and onboarded
      if (user?.profile?.isOnboarded) {
        redirect("/comunidad");
      }
    } catch {
      // Continue to view
    }
  }

  return (
    <Suspense fallback={<PageLoader className="min-h-screen" />}>
      <AccountCreationView />
    </Suspense>
  );
}
