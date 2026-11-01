import SpecialistSignUpWizard from "@/features/auth/SpecialistSignUpWizard";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Únete como Especialista — LUMINUS",
  description: "Sé parte de la red de especialistas y profesionales del bienestar en Latinoamérica.",
};

export default async function UnirmeEspecialistaPage() {
  const session = await getCurrentSession();
  if (session) {
    // If already authenticated, redirect straight to in-app specialist onboarding
    redirect("/especialistas/unirme");
  }

  return <SpecialistSignUpWizard />;
}
