import SignUpView from "@/features/auth/SignUpView";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams?: { onboarding?: string; redirect?: string };
}) {
  const session = getCurrentSession();
  if (session) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.userId },
      select: { isOnboarded: true },
    });
    const postulation = await prisma.specialistPostulation.findFirst({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (profile?.isOnboarded || postulation) {
      redirect(searchParams?.redirect || "/comunidad");
    }
  }

  return <SignUpView />;
}

