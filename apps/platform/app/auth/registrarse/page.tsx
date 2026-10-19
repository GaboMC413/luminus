import SignUpView from "@/features/auth/SignUpView";
import { getCurrentSession, clearSessionCookie } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams?: { onboarding?: string; redirect?: string };
}) {
  const session = getCurrentSession();
  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        status: true,
        profile: { select: { isOnboarded: true } },
        specialistPostulations: { select: { id: true }, take: 1 },
      },
    });

    if (!user || user.status !== "active") {
      clearSessionCookie();
      return <SignUpView />;
    }

    if (user.profile?.isOnboarded || user.specialistPostulations.length > 0) {
      redirect(searchParams?.redirect || "/comunidad");
    }
  }

  return <SignUpView />;
}

