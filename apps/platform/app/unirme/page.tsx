import MembershipChoiceView from "@/features/membership/MembershipChoiceView";
import { redirectIfAuthenticated } from "@/lib/auth/session";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forma parte de LUMINUS — Membresía",
  description: "Sé parte de la red e impulsa su crecimiento en toda Latinoamérica.",
};

export default async function UnirmePage() {
  await redirectIfAuthenticated();
  return <MembershipChoiceView />;
}
